import Foundation
import ExpoModulesCore

private enum ProvisioningProfileError: LocalizedError {
  case missingProfile
  case invalidEncoding
  case missingExpirationDate

  var errorDescription: String? {
    switch self {
    case .missingProfile:
      return "No embedded.mobileprovision file was found in this iOS build."
    case .invalidEncoding:
      return "The embedded provisioning profile has an invalid CMS encoding."
    case .missingExpirationDate:
      return "The embedded provisioning profile does not contain an expiration date."
    }
  }
}

private struct DERElement {
  let tag: UInt8
  let content: Data
  let endOffset: Int
}

private let signedDataOID = Data([0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x07, 0x02])
private let dataOID = Data([0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x07, 0x01])

private func readDERElement(from data: Data, at offset: Int) throws -> DERElement {
  guard offset >= 0, offset + 1 < data.count else {
    throw ProvisioningProfileError.invalidEncoding
  }

  let tag = data[offset]
  let firstLengthByte = data[offset + 1]
  var contentOffset = offset + 2
  var contentLength = 0

  if firstLengthByte & 0x80 == 0 {
    contentLength = Int(firstLengthByte)
  } else {
    let lengthByteCount = Int(firstLengthByte & 0x7f)
    guard
      lengthByteCount > 0,
      lengthByteCount <= MemoryLayout<Int>.size,
      contentOffset + lengthByteCount <= data.count
    else {
      throw ProvisioningProfileError.invalidEncoding
    }

    for _ in 0..<lengthByteCount {
      let byte = Int(data[contentOffset])
      guard contentLength <= (Int.max - byte) / 256 else {
        throw ProvisioningProfileError.invalidEncoding
      }

      contentLength = contentLength * 256 + byte
      contentOffset += 1
    }
  }

  let (endOffset, overflow) = contentOffset.addingReportingOverflow(contentLength)
  guard !overflow, endOffset <= data.count else {
    throw ProvisioningProfileError.invalidEncoding
  }

  return DERElement(
    tag: tag,
    content: data.subdata(in: contentOffset..<endOffset),
    endOffset: endOffset
  )
}

private func readDERChildren(from data: Data) throws -> [DERElement] {
  var elements: [DERElement] = []
  var offset = 0

  while offset < data.count {
    let element = try readDERElement(from: data, at: offset)
    guard element.endOffset > offset else {
      throw ProvisioningProfileError.invalidEncoding
    }

    elements.append(element)
    offset = element.endOffset
  }

  return elements
}

private func extractOctetString(from element: DERElement) throws -> Data {
  switch element.tag {
  case 0x04:
    return element.content
  case 0x24:
    var content = Data()
    for child in try readDERChildren(from: element.content) {
      content.append(try extractOctetString(from: child))
    }
    return content
  default:
    throw ProvisioningProfileError.invalidEncoding
  }
}

private func extractProfilePayload(from encodedProfile: Data) throws -> Data {
  let contentInfo = try readDERElement(from: encodedProfile, at: 0)
  guard contentInfo.tag == 0x30, contentInfo.endOffset == encodedProfile.count else {
    throw ProvisioningProfileError.invalidEncoding
  }

  let contentInfoFields = try readDERChildren(from: contentInfo.content)
  guard
    contentInfoFields.count >= 2,
    contentInfoFields[0].tag == 0x06,
    contentInfoFields[0].content == signedDataOID,
    contentInfoFields[1].tag == 0xa0
  else {
    throw ProvisioningProfileError.invalidEncoding
  }

  let signedData = try readDERElement(from: contentInfoFields[1].content, at: 0)
  guard signedData.tag == 0x30, signedData.endOffset == contentInfoFields[1].content.count else {
    throw ProvisioningProfileError.invalidEncoding
  }

  let signedDataFields = try readDERChildren(from: signedData.content)
  guard signedDataFields.count >= 3, signedDataFields[2].tag == 0x30 else {
    throw ProvisioningProfileError.invalidEncoding
  }

  let encapsulatedContentFields = try readDERChildren(from: signedDataFields[2].content)
  guard
    encapsulatedContentFields.count >= 2,
    encapsulatedContentFields[0].tag == 0x06,
    encapsulatedContentFields[0].content == dataOID,
    encapsulatedContentFields[1].tag == 0xa0
  else {
    throw ProvisioningProfileError.invalidEncoding
  }

  let encapsulatedContent = try readDERElement(
    from: encapsulatedContentFields[1].content,
    at: 0
  )
  guard encapsulatedContent.endOffset == encapsulatedContentFields[1].content.count else {
    throw ProvisioningProfileError.invalidEncoding
  }

  return try extractOctetString(from: encapsulatedContent)
}

public class ProvisioningProfileModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ProvisioningProfile")

    AsyncFunction("getExpirationTimestamp") { () throws -> Double in
      guard
        let profileURL = Bundle.main.url(forResource: "embedded", withExtension: "mobileprovision")
      else {
        throw ProvisioningProfileError.missingProfile
      }

      let profileData = try Data(contentsOf: profileURL)
      let profilePayload = try extractProfilePayload(from: profileData)

      let profile = try PropertyListSerialization.propertyList(
        from: profilePayload,
        options: [],
        format: nil
      )

      guard
        let profileDictionary = profile as? [String: Any],
        let expirationDate = profileDictionary["ExpirationDate"] as? Date
      else {
        throw ProvisioningProfileError.missingExpirationDate
      }

      return expirationDate.timeIntervalSince1970 * 1000
    }
  }
}

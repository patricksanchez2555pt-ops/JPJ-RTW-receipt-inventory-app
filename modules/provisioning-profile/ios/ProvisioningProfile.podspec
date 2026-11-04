Pod::Spec.new do |s|
  s.name = 'ProvisioningProfile'
  s.version = '1.0.0'
  s.summary = 'Reads the iOS provisioning profile expiration date.'
  s.description = 'Provides the embedded provisioning profile expiration date to the app.'
  s.license = { :type => 'MIT' }
  s.author = 'JPJ RTW'
  s.homepage = 'https://github.com/patricksanchez2555pt-ops/JPJ-RTW-receipt-inventory-app'
  s.platforms = { :ios => '16.4' }
  s.source = { :git => 'https://github.com/patricksanchez2555pt-ops/JPJ-RTW-receipt-inventory-app.git' }
  s.static_framework = true
  s.swift_version = '5.9'
  s.dependency 'ExpoModulesCore'
  s.source_files = '**/*.{h,m,mm,swift}'
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }
end

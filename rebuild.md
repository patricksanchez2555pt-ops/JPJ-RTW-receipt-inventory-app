node ./scripts/remove-ios-signing-team.js
rm -rf ~/Library/Developer/Xcode/UserData/Provisioning\ Profiles
npx expo prebuild --platform ios && npx expo run:ios --configuration Release --device
open ios/JPJRTW.xcworkspace

Prebuild now configures the iOS scene lifecycle required by current iOS SDKs. Rebuild and reinstall the app after this change; an already-installed build will still fail to launch.

In Xcode
Select the macrozone project.
Select the macrozone target.
Go to Signing & Capabilities.
Make sure:
Automatically manage signing = ON
Team = your Personal Team
Bundle Identifier = jpj.rtw
Connect/select your iPhone.

Then go to:

Product → Scheme → Edit Scheme → Run

Change:

Build Configuration → Release

Click Close.

Then:

Product → Run (⌘R)

Xcode will rebuild the app and install the new version on your iPhone.

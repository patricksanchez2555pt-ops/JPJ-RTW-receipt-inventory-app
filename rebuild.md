cd /Users/patricksanchez/Projects/JPJ-RTW-receipt-inventory-app/Code/macrozone
npx expo prebuild --platform ios
npx pod-install / npx expo run:ios
open ios/JPJRTW.xcworkspace

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

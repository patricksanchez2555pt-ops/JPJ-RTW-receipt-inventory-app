const { withAppDelegate } = require('expo/config-plugins');

const APP_DELEGATE_CLASS = 'class AppDelegate: ExpoAppDelegate {';
const SCENE_ENABLED_APP_DELEGATE_CLASS =
  'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {';

const LEGACY_STARTUP = [
  '#if os(iOS) || os(tvOS)',
  '    window = UIWindow(frame: UIScreen.main.bounds)',
  '    factory.startReactNative(',
  '      withModuleName: "main",',
  '      in: window,',
  '      launchOptions: launchOptions)',
  '#endif',
].join('\n');

function withIosSceneLifecycle(config) {
  return withAppDelegate(config, (config) => {
    if (config.modResults.language !== 'swift') {
      throw new Error('The iOS scene lifecycle plugin requires a Swift AppDelegate.');
    }

    let contents = config.modResults.contents;

    if (contents.includes(SCENE_ENABLED_APP_DELEGATE_CLASS) && !contents.includes(LEGACY_STARTUP)) {
      return config;
    }

    if (!contents.includes(APP_DELEGATE_CLASS)) {
      throw new Error(
        'Could not find the expected Expo AppDelegate declaration while enabling iOS scenes.',
      );
    }

    if (!contents.includes(LEGACY_STARTUP)) {
      throw new Error(
        'Could not find the expected legacy React Native startup block while enabling iOS scenes.',
      );
    }

    contents = contents.replace(APP_DELEGATE_CLASS, SCENE_ENABLED_APP_DELEGATE_CLASS);
    contents = contents.replace(LEGACY_STARTUP, '');

    config.modResults.contents = contents;
    return config;
  });
}

module.exports = withIosSceneLifecycle;

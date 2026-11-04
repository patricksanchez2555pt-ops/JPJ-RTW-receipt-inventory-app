const fs = require('node:fs');
const path = require('node:path');

const appJsonPath = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : path.resolve(process.cwd(), 'app.json');
const appConfig = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

if (!appConfig.expo || typeof appConfig.expo.ios !== 'object' || !appConfig.expo.ios) {
  throw new Error(`Expo iOS config was not found in ${appJsonPath}.`);
}

if (!Object.hasOwn(appConfig.expo.ios, 'appleTeamId')) {
  console.log('No ios.appleTeamId is configured; nothing to remove.');
  process.exit(0);
}

delete appConfig.expo.ios.appleTeamId;
fs.writeFileSync(appJsonPath, `${JSON.stringify(appConfig, null, 2)}\n`);
console.log(`Removed ios.appleTeamId from ${appJsonPath}.`);

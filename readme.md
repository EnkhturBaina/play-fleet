## BUILD хийх тохиргоонууд

**Note**

## contants.js (IOS_VERSION, ANDROID_VERSION) UPDATE хийх

## app.json (version, ios->buildNumber, android->versionCode) UPDATE хийх

0. eas build -p android --profile production --skip-submission
1. eas build --platform android //ANDROID BUILD
2. eas submit -p android --latest //ANDROID SUBMIT TO PLAY STORE
3. eas build --platform ios //IOS BUILD
4. eas submit -p ios --latest //ANDROID SUBMIT TO APP STORE

5. eas build -p android --profile preview2 //ANDROID BUILD APK FILE

npm install expo@49
npm install expo@latest

npx expo-doctor

## https://chatgpt.com/share/67e11d71-7e10-8013-ac91-271d4c463402

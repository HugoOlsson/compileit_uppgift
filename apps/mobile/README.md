# Compileit Rooms - mobile

React Native client for the Compileit meeting-room booking case. The app uses Expo SDK 57, TypeScript, and Expo Router.

## Get started

1. Copy `.env.example` to `.env` and replace `YOUR_COMPUTER_IP` with the local IP address of the computer running the API.

2. Install dependencies:

   ```bash
   npm install
   ```

3. Install the native development build the first time:

   ```bash
   npx expo run:ios --device
   ```

4. Start Expo for subsequent development:

   ```bash
   npm start
   ```

Make sure the backend in `../api` is running before opening the booking calendar.

From the Expo terminal, open the app in:

- iOS Simulator by pressing `i`
- Android Emulator by pressing `a`
- A browser by pressing `w`
- Expo Go by scanning the displayed QR code

## Commands

```bash
npm start
npm run ios
npm run android
npm run web
npm run lint
```

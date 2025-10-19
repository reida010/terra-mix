# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

## Configure Firebase cloud sync

The app can back up each device's plant data to [Firebase Firestore](https://firebase.google.com/). To enable cloud sync:

1. Create a Firebase project and enable Firestore in **Native** or **Datastore** mode.
2. Register a Web app in Firebase to obtain the configuration object (API key, project ID, etc.).
3. Update [`app.json`](./app.json) under `expo.extra.firebase` with your project's values. Alternatively, define the same keys with the `EXPO_PUBLIC_FIREBASE_*` environment variables before running the app.
4. Start the Expo app. The first time the app runs it will generate a device identifier, load any existing Firestore document at `users/<device-id>`, and keep the local cache in sync when you make changes.

If no Firebase configuration is provided, the app keeps working offline using the local storage fallback.

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

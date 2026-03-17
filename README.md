# Personal Diary App

A secure, beautifully designed offline-first mobile application built with React Native for capturing your daily thoughts and moments.

## Features

*   **Offline-First & Private:** All your entries are stored locally on your device. No cloud sync, no tracking.
*   **Secure Passcode Lock:** Protect your journal with a 4-digit PIN lock. Sensitive data (passcodes, diary content) is securely encrypted via `react-native-encrypted-storage`.
*   **"Scrollytelling" Feed:** A beautiful vertical timeline to scroll through your past entries.
*   **Warm Minimalism:** Designed with a calming aesthetic using earth tones and serif typography.
*   **Tactile Feedback:** Subtle haptics enhance the "ritual" of saving a new memory.
*   **Brute-Force Protection:** Automatically locks the app for 5 minutes after 3 consecutive wrong password attempts.

## Getting Started

### Prerequisites

Ensure your development environment is set up for React Native:
*   [Node.js](https://nodejs.org/) (version 18 or newer recommended)
*   [React Native CLI Setup](https://reactnative.dev/docs/environment-setup) (Follow the instructions for React Native CLI, NOT Expo)
*   **iOS:** Xcode, CocoaPods (macOS required)
*   **Android:** Android Studio, Android SDK

### Installation

1.  **Clone the repository** (if you haven't already):
    ```bash
    git clone <your-repository-url>
    cd personal-diary
    ```

2.  **Install Node dependencies:**
    ```bash
    npm install
    ```

3.  **Install iOS dependencies (macOS only):**
    ```bash
    cd ios
    pod install
    cd ..
    ```

### Running the App

#### Android

To run the app on an Android emulator or a connected physical device:

```bash
npm run android
```

#### iOS

To run the app on the iOS Simulator or a connected iPhone (macOS required):

```bash
npm run ios
```

### Development Server

The Metro bundler will start automatically when you run the app. If you need to start it manually (or reset the cache):

```bash
npm start
# Or to reset cache: npm start -- --reset-cache
```

## Testing

This project uses Jest and React Native Testing Library. To run the unit tests:

```bash
npm test
```

## License

This project is licensed under the **PolyForm Noncommercial License 1.0.0**.

This means you are free to use, modify, and distribute the software for **personal, educational, or research-related activities**.

**Commercial use is strictly prohibited** without a separate commercial agreement. See the [LICENSE](./LICENSE) file for the full text of the agreement.

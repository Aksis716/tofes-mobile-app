# TOFES

**TOFES** is a mobile companion for football tournaments. It gives supporters a single place to follow fixtures, live match information, standings, teams, news, and tournament highlights—while giving organisers the tools to keep every detail current.

Built as a production-minded Expo/React Native project, it demonstrates a full mobile product flow: authentication, live content, media, push notifications, and role-based administration.

## What it does

- Browse tournament news, teams, fixtures, programme, standings, and past editions.
- Open a match centre with scores, events, lineups, tables, media, and fan commentary.
- Create an account and manage a profile.
- Receive push notifications for tournament updates.
- Give administrators dedicated interfaces to manage articles, teams, matches, standings, comments, notifications, users, and platform statistics.

## Built with

- **Expo** and **React Native** for Android, iOS, and web
- **Expo Router** and React Navigation for app navigation
- **Firebase** for authentication and cloud data
- Expo Notifications, Image Picker, and device APIs
- React Native Paper, Moti, Lucide, and SVG/chart components for the interface

## Run locally

### Prerequisites

- Node.js 18 or later
- npm
- Expo Go or an Android/iOS simulator for mobile testing

### Installation

```bash
git clone https://github.com/Aksis716/tofes-mobile-app.git
cd tofes-mobile-app
npm install
npx expo start
```

Use the Expo terminal to launch Android, iOS, web, or Expo Go. For a native Android build:

```bash
npm run android
```

## Configuration

The app uses Firebase. Add your own Firebase project configuration before running a production build, including any platform service files and notification credentials required by your environment.

## Portfolio note

This repository is shared as a product showcase. TOFES illustrates how I approach real-time, content-rich mobile experiences: clear supporter journeys on one side and practical, role-aware operations tooling on the other.

## License

All rights reserved. The source is provided for portfolio review; reuse or redistribution requires permission.

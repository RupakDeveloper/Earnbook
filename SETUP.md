# EarnBook by RUPAK — Firebase version

## Features
- Mobile-first ENTER screen, then email/password Login and Sign Up.
- Personal earnings, received payments, pending amount and private expenses.
- Each account's data is stored under `users/{Firebase Auth UID}/...`.
- Received payments are allocated to oldest pending earnings in one Firestore batch.
- Instagram: @rupak_nathh
- WhatsApp: +91 9954169799

## Firebase setup
1. In Firebase Console, enable **Authentication → Sign-in method → Email/Password**.
2. Create a **Cloud Firestore** database.
3. In Firestore → Rules, publish the following rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

4. In Project settings → General → Your apps → EarnBook Web, copy the Firebase web config values.
5. For local development, copy `.env.example` to `.env` and replace values:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

## Cloudflare Pages
Use these build settings:
- Framework preset: Vite
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: leave blank

In Cloudflare Pages → Settings → Variables and Secrets, add all six variables above with the matching values from Firebase Web Config. Add them for the production environment (and preview too if you use preview deployments), then trigger a new deployment.

## Important
- Never use Firestore test-mode/open rules for a public website.
- Never put Firebase Admin SDK service-account credentials in frontend code. The web config values are intended for browser applications; Firestore security is enforced by the rules above.
- This starter stores earnings and expenses in separate subcollections for each signed-in user.
- Received amounts are applied to oldest pending earnings first. A single Firestore batch is used for the allocation.
- Expense balance validation is performed in the browser. For a public financial product, add server-side transaction validation before treating it as an authoritative accounting system.

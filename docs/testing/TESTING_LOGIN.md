# Testing Login, Roles & OTP

This document outlines the testing credentials for local development and the necessary steps to test full Firebase OTP on the mobile app.

## 1. Demo User Login Credentials

For local testing, the backend can be seeded with a test account for **every role**. All test accounts share the same password.

**Universal Password for ALL accounts:** `Nesso!Demo!2026`

To ensure these accounts exist in your local database, run:
```bash
pnpm --filter @nesso/api seed:all
```

### 🛠 System Admins & Management
- **Admin:** `9000000001` (Can be modified via `BOOTSTRAP_ADMIN_PHONE` in `apps/api/.env`)
- **Org MD:** `9000000002`
- **Org NESSO:** `9000000003`
- **Tech Support:** `9000000004`

### 🧑‍🌾 Field Operations (Mobile App Testing)
- **Org Field Officer:** `9000000005`
- **Org Field Assistant:** `9000000006`
- **Org Agent:** `9000000007`
- **Field Officer:** `9000000008`
- **Flower Agent:** `9000000009`

### 🏢 Farmer Producer Orgs (FPOs)
- **FPO:** `9000000010`
- **Org FPO:** `9000000011`
- **Org FPO1:** `9000000012`
- **Org Souhardha:** `9000000013`

### 🚜 Farmers
- **Farmer:** `9000000014`
- **Org Farmer:** `9000000015`

### 📦 Supply Chain & Quality
- **Procurement Manager:** `9000000016`
- **Processor:** `9000000017`
- **Quality Auditor:** `9000000018`


---

## 2. Setting Up Firebase OTP for Mobile App Testing

By default, the backend bypasses Firebase OTP during local development, allowing you to log into the Web Dashboard using just the password. However, if you want to test the actual SMS/OTP flow on the **Mobile App**, you must configure Firebase.

### Configured Firebase Testing Numbers (Max 10)
Due to Firebase project limits, only the following 10 numbers are registered as "testing numbers" in the Firebase console. For all of them, the static Verification Code is **`123456`**:
- `+91 90000 00001` (Admin)
- `+91 90000 00002` (Org MD)
- `+91 90000 00003` (Org NESSO)
- `+91 90000 00004` (Tech Support)
- `+91 90000 00005` (Org Field Officer)
- `+91 90000 00008` (Field Officer)
- `+91 90000 00010` (FPO)
- `+91 90000 00014` (Farmer)
- `+91 90000 00016` (Procurement Manager)
- `+91 90000 00018` (Quality Auditor)

### What to add to Firebase Console
1. **Enable Phone Auth**: Go to `Authentication > Sign-in Method` and enable Phone Authentication.
2. **Add Testing Numbers**: In that same section, add the phone numbers you want to test with. (Note: The project is currently at its 10-number limit as documented above. If you need to test a different role, you must delete one of the existing numbers from Firebase first).

### What to add to the Codebase
Firebase requires security keys to allow the mobile app to request the OTP, and the backend to verify the token.

**1. Mobile App Configuration (`apps/mobile`)**
- Download your `google-services.json` from the Firebase Project Settings (Android app config).
- Place the `google-services.json` file inside the `apps/mobile/` folder.
- *(Note: The `@react-native-firebase/app` and `auth` dependencies are already uncommented in package.json).*

**2. Backend API Configuration (`apps/api`)**
- In the Firebase Console, go to **Project Settings > Service Accounts** and click **Generate new private key**.
- Download this JSON file and place it inside the `apps/api/` folder (e.g., `apps/api/firebase-service-account.json`).
- Open `apps/api/.env` and add the path to the key:
  ```env
  FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
  ```

### Testing the Flow
1. Restart the backend API.
2. Open the Expo Mobile app.
3. Enter one of the testing phone numbers you added to the Firebase console (e.g., `9000000001`).
4. Enter your static Verification Code (e.g., `123456`).
5. Firebase will verify the code and send a secure token to the backend. The backend will look up `9000000001` in the database and authenticate you as the **Admin**.

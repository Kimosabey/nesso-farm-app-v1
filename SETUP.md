<div align="center">

<img src="docs/nesso___nr_group_logo.jpeg" alt="Nesso" width="120" />

# Developer Setup Guide

**Everything you need to install on your machine and phone before we kick off Phase 0.**

</div>

---

> **Target OS:** Windows 11. If you're on macOS / Linux, the tool list is the same — just install with `brew` / your package manager instead of `winget`.
>
> **iOS builds:** A Mac is not required. We use **EAS Build (cloud)** for iOS.

<br />

## 1 · Must-have core (all surfaces)

| Tool | Version | Why | Install (Windows) |
|---|---|---|---|
| **Node.js** | 20 LTS | Runs everything | https://nodejs.org · or `winget install OpenJS.NodeJS.LTS` |
| **pnpm** | 9+ | Monorepo package manager | After Node: `corepack enable && corepack prepare pnpm@latest --activate` |
| **Git** | latest | Version control | `winget install Git.Git` |
| **Docker Desktop** | latest | Local Mongo + Redis + Minio + Mailhog | https://www.docker.com/products/docker-desktop · enable WSL2 backend |
| **VS Code** | latest | Editor | `winget install Microsoft.VisualStudioCode` |
| **PowerShell 7** | optional | Nicer shell than 5.1 | `winget install Microsoft.PowerShell` |

### Recommended VS Code extensions

- ESLint
- Prettier · Code formatter
- Tailwind CSS IntelliSense
- MongoDB for VS Code
- Docker
- GitLens
- Expo Tools
- Error Lens
- Console Ninja *(optional)*

<br />

## 2 · Mobile development

### 2.1 On your Windows machine

| Tool | Purpose | Notes |
|---|---|---|
| **Android Studio** (Hedgehog 2023.1+) | Android SDK + emulator | https://developer.android.com/studio · ~10 GB download |
| **Java JDK 17** | Required by Android Gradle | Android Studio bundles it; otherwise `winget install Microsoft.OpenJDK.17` |
| **Android Emulator (AVD)** | Test without a phone | In Android Studio → **Tools → Device Manager** → create a **Pixel 7, API 34** image |
| **Expo CLI** | Comes via `pnpm dlx expo` | No global install required |
| **EAS CLI** | Cloud builds (Phase 1+) | **`npm install --global eas-cli`** ← npm not pnpm; see note below |

> **npm vs pnpm for global CLIs (Windows):** the npm global bin is already in your PATH. The pnpm global bin isn't until you run `pnpm setup` and reopen your shell. For zero hassle, install globals (like `eas-cli`) with **npm**, and use **pnpm** for everything inside the repo. Deprecation warnings during `eas-cli` install (uuid@8, glob@10, etc.) come from EAS's transitive deps — not your code. Ignore them. Full mobile setup details: [`docs/MOBILE_SETUP.md`](docs/MOBILE_SETUP.md).

### 2.2 On your phone

| App | Purpose | Get from |
|---|---|---|
| **Expo Go** | Early prototyping only | Play Store / App Store — search "Expo Go" |
| **Expo Orbit** *(optional)* | Install dev/preview APKs from EAS | Play Store |

> **Important:** Expo Go works only for the first few days. Once we add Firebase Phone Auth, MMKV, and native camera (Phase 1), you'll switch to a **dev client** built with EAS:
> ```
> eas build --profile development --platform android
> ```
> Install the resulting APK via USB or Expo Orbit. Hot reload still works.

### 2.3 iOS (Mac required)

| Tool | Notes |
|---|---|
| **Xcode 15+** | Mac App Store |
| **iOS Simulator** | Bundled with Xcode |
| **Apple Developer account** | $99 / yr — only when publishing to TestFlight |

<br />

## 3 · Backend & database tools

| Tool | Purpose | Notes |
|---|---|---|
| **Docker Desktop** | Spins up Mongo + Redis + Minio + Mailhog | One command: `docker compose up -d` |
| **MongoDB Compass** | DB GUI | https://www.mongodb.com/products/compass |
| **RedisInsight** | Redis GUI | Optional but handy |
| **Postman**, **Bruno**, or **REST Client** (VS Code ext.) | API testing | Pick one |

<br />

## 4 · Accounts to create now

| Service | Why | Plan |
|---|---|---|
| **GitHub** | Source hosting + Actions CI | Free |
| **Firebase** (Google) | Phone OTP auth + FCM push | Spark (free) |
| **Expo / EAS** | Cloud mobile builds | Free tier first |
| **Sentry** | Crash reporting (4 projects: api · web · portal · mobile) | Dev tier |
| **Vercel** *(later)* | Web + QR portal hosting | Hobby (free) |
| **MongoDB Atlas** *(later)* | Prod database | M0 (free) |
| **AWS** or **Azure** *(Phase 2)* | S3 / Blob for images | Free tier |
| **Cloudflare** *(later)* | DNS + CDN for QR portal | Free |

<br />

## 5 · Phone-to-PC connection

So you can run the app on a real Android device:

1. On the phone: **Settings → About phone** → tap **Build number** 7 times to unlock Developer Options.
2. **Settings → Developer options** → enable **USB debugging**.
3. Plug into your PC via USB. Accept the RSA fingerprint prompt on the phone.
4. Verify on PC:

```powershell
adb devices
```

You should see your device listed. (`adb` ships with Android Studio's platform-tools — make sure that folder is in your `PATH`.)

<br />

## 6 · Verification — run these commands

After installing, every one of these should print a version number:

```powershell
node -v          # v20.x.x
pnpm -v          # 9.x.x
git --version
docker --version
java -version    # 17.x.x
adb version
code -v
```

If any fail, fix that one before moving on.

<br />

## 7 · Do this right now, in order

1. **Install Node 20 LTS** → run `corepack enable` → `corepack prepare pnpm@latest --activate`.
2. **Install Git, Docker Desktop, VS Code.**
3. **Start downloading Android Studio in the background** (it's the slow one).
4. **Create accounts:** GitHub, Firebase, Expo, Sentry.
5. **Install Expo Go on your phone.**
6. **Run the verification commands** above.
7. **Ping me** — I'll start **Phase 0** and scaffold the monorepo.

<br />

## 8 · What you do NOT need yet

Skip these — they come in later phases.

- Apple Developer account *(only when publishing iOS)*
- MongoDB Atlas / AWS / Azure / Cloudflare / Vercel *(Phase 1+)*
- EAS paid plan *(free tier is fine for the first weeks)*
- Production domain *(later)*
- Any AI / ML tooling *(post-GA roadmap)*

<br />

## 9 · Troubleshooting common gotchas

<details>
<summary><strong><code>pnpm</code> not found after install</strong></summary>

Open a *new* PowerShell window after running `corepack enable` (the PATH needs to refresh). If still missing, run:
```powershell
corepack prepare pnpm@latest --activate
```

</details>

<details>
<summary><strong>Docker Desktop fails to start (WSL error)</strong></summary>

Run as administrator:
```powershell
wsl --install
wsl --set-default-version 2
```
Restart, then launch Docker Desktop. Make sure virtualization is enabled in BIOS.

</details>

<details>
<summary><strong>Android Studio can't find JDK</strong></summary>

In Android Studio: **File → Settings → Build, Execution, Deployment → Build Tools → Gradle → Gradle JDK** → pick the embedded one (Hedgehog ships with JDK 17).

</details>

<details>
<summary><strong>Phone not detected by <code>adb devices</code></strong></summary>

1. Re-plug the USB cable (try a different port — some are charge-only).
2. On the phone, change USB mode to **File transfer (MTP)**.
3. Accept the RSA fingerprint prompt (look for it in the notification shade).
4. Install your phone OEM's USB driver if Windows didn't auto-install one.

</details>

<details>
<summary><strong>Expo Go shows a blank screen / native module error</strong></summary>

Expected once we add native modules (Firebase, MMKV). Switch to a **dev client**:
```powershell
eas login
eas build --profile development --platform android
```
Install the APK Expo emails you and use that instead of Expo Go.

</details>

<details>
<summary><strong>Ports already in use (3000 / 3001 / 27017 / 6379)</strong></summary>

Stop the conflicting service, or override ports in `docker-compose.override.yml` and `apps/*/package.json` dev scripts.

</details>

<br />

## 10 · Quick links

- Main project README → [`README.md`](README.md)
- **Execution checklist (start here once setup is done)** → [`EXECUTION.md`](EXECUTION.md)
- Full build plan → [`docs/plan/README.md`](docs/plan/README.md)
- Phase 0 checklist → [`docs/plan/11-implementation-phases.md`](docs/plan/11-implementation-phases.md)
- Design handoff → [`docs/ui-ux-design-prototypes-flow/farmer-app-ui-ux-flow/design_handoff_nesso/`](docs/ui-ux-design-prototypes-flow/farmer-app-ui-ux-flow/design_handoff_nesso/)

<br />

---

<div align="center">

<sub><strong>Once your verification commands all pass, ping back and we kick off Phase 0.</strong></sub>

<br /><br />

<img src="docs/nesso___nr_group_logo.jpeg" alt="Nesso" width="60" />

<br />

<sub>Nesso · © 2026 Harshan Aiyappa</sub>

</div>

<div align="center">

[![العربية](https://img.shields.io/badge/اقرأ_بـ-العربية-555?style=flat-square&logo=readme&logoColor=white)](README.md)&nbsp;[![Français](https://img.shields.io/badge/Lire_en-Français-555?style=flat-square&logo=readme&logoColor=white)](README.fr.md)

<br/>

<img src=".github/assets/logo.png" alt="Eventy360" width="120" height="120"/>

<br/>

[![Website](https://img.shields.io/badge/🌐_Website-0A0F1E?style=for-the-badge)](https://eventy360.vercel.app)&nbsp;[![Download App](https://img.shields.io/github/v/release/jhonny1994/eventy360?label=📱+Download+App&style=for-the-badge&color=3DDC84)](https://github.com/jhonny1994/eventy360/releases/latest)&nbsp;[![GitHub](https://img.shields.io/github/stars/jhonny1994/eventy360?label=⭐+GitHub&style=for-the-badge&color=gold)](https://github.com/jhonny1994/eventy360)

<br/>

[![Android](https://img.shields.io/badge/Android-Available-3DDC84?style=flat-square&logo=android&logoColor=white)](#)&nbsp;[![Web](https://img.shields.io/badge/Web-Available-4A90D9?style=flat-square&logo=googlechrome&logoColor=white)](#)&nbsp;[![iOS](https://img.shields.io/badge/iOS-Coming_Soon-999?style=flat-square&logo=apple&logoColor=white)](#)

</div>

---

# Eventy360

### The unified academic workspace — from event discovery to publication, in one place

<br/>

## Who We Are

**Eventy360** is a fully integrated digital platform built for Algerian and Arab researchers and academics. It consolidates into a single focused workspace everything a researcher needs throughout their research cycle: discovering scientific conferences and events, submitting papers and abstracts, tracking peer-review stages in real time, managing subscriptions, and accessing a published research library.

No more juggling emails, paper forms, and scattered links. **Eventy360** puts your entire research workflow in the palm of your hand.

<br/>

## ✨ What You Get

| &nbsp; | Feature | What it actually means for you |
|:---:|:---|:---|
| 🔍 | **Event Discovery** | Browse active calls for papers, filter by topic or location, and bookmark opportunities that match your research path |
| 📄 | **Research Submission** | Submit abstracts, full papers, and revisions through a unified, stage-tracked flow with clear status at every step |
| 🔔 | **Smart Alerts** | Subscribe to scientific topics that matter to you and receive notifications at exactly the right moment |
| ✅ | **Academic Verification** | Prove your researcher status through a secure, document-based review process handled by a dedicated team |
| 📚 | **Research Library** | Browse, search, and download published research via protected file links |
| 💳 | **Subscription & Billing** | Track your access level and submit payment proofs directly from within the app — no external emails needed |
| 🌙 | **Dark / Light Theme** | A comfortable visual experience that adapts automatically to your device settings |
| 🌐 | **Three Languages** | Arabic · French · English, with full right-to-left layout support |

<br/>

## 📲 Available On

<div align="center">

| | Platform | Access |
|:---:|:---|:---|
| 🌐 | **Website** | Live now at [eventy360.app](https://eventy360.vercel.app) |
| 📱 | **Android App** | [Download the latest release](https://github.com/jhonny1994/eventy360/releases/latest) from GitHub Releases |
| 🍎 | **iOS App** | Coming soon |

</div>

<br/>

## 🛡 Security & Reliability

The platform is built on high security standards that guarantee the protection of your data and the integrity of your research workflow:

- Every uploaded file goes through an authenticated request and is opened later via short-lived signed links
- Granular permissions system that exposes no data to anyone who shouldn't have access
- Deployments and updates pass through protected environments before reaching you
- Identity verification and subscription both require human review before granting premium access

<br/>

## 🤝 License & Use

This repository is publicly visible for evaluation, product preview, and potential partnership purposes only.  
The source code, documentation, and all materials are protected by exclusive proprietary rights.  
For details on permitted use, see [PROPRIETARY-NOTICE.md](PROPRIETARY-NOTICE.md).

<br/>

<div align="center">

Built with passion for the Algerian and Arab academic community 🇩🇿

</div>

---

<details>
<summary><b>🛠 For Developers — Technical Information</b></summary>

<br/>

### Technical Stack

| Layer | Technologies |
|:---|:---|
| Web Application | Next.js 16 · React 19 · TypeScript · Tailwind CSS · next-intl |
| Mobile Application | Flutter · Dart — Android & iOS |
| Backend | Supabase (PostgreSQL · Auth · Storage · Edge Functions · RLS) |
| CI/CD | GitHub Actions with protected deployment environments |

### Repository Layout

```
eventy360/
├── apps/
│   ├── web/       # Next.js app — public pages, researcher dashboard, admin panel
│   └── mobile/    # Flutter app — full researcher workflow
├── supabase/      # Schemas, edge functions, RLS & storage configuration
├── docs/          # Architecture, development guide, environments, release process
└── .github/       # CI workflows, security scanning, dependency policy, CODEOWNERS
```

### Running the Web App Locally

```bash
cp apps/web/.env.example apps/web/.env.local
pnpm install:web
pnpm dev:web
```

### Running the Mobile App Locally

```bash
cd apps/mobile
flutter pub get
flutter run
```

### Developer Documentation

- [Architecture](docs/architecture.md)
- [Development Guide](docs/development.md)
- [Environments](docs/environments.md)
- [Release Process](docs/release.md)

</details>

<div align="center">

[![العربية](https://img.shields.io/badge/اقرأ_بـ-العربية-555?style=flat-square&logo=readme&logoColor=white)](README.md)&nbsp;[![English](https://img.shields.io/badge/Read_in-English-555?style=flat-square&logo=readme&logoColor=white)](README.en.md)

<br/>

<img src=".github/assets/logo.png" alt="Eventy360" width="120" height="120"/>

<br/>

[![Site Web](https://img.shields.io/badge/🌐_Site_Web-0A0F1E?style=for-the-badge)](https://eventy360.vercel.app)&nbsp;[![Télécharger](https://img.shields.io/github/v/release/jhonny1994/eventy360?label=📱+Télécharger&style=for-the-badge&color=3DDC84)](https://github.com/jhonny1994/eventy360/releases/latest)&nbsp;[![GitHub](https://img.shields.io/github/stars/jhonny1994/eventy360?label=⭐+GitHub&style=for-the-badge&color=gold)](https://github.com/jhonny1994/eventy360)

<br/>

[![Android](https://img.shields.io/badge/Android-Disponible-3DDC84?style=flat-square&logo=android&logoColor=white)](#)&nbsp;[![Web](https://img.shields.io/badge/Web-Disponible-4A90D9?style=flat-square&logo=googlechrome&logoColor=white)](#)&nbsp;[![iOS](https://img.shields.io/badge/iOS-Bientôt-999?style=flat-square&logo=apple&logoColor=white)](#)

</div>

---

# Eventy360

### L'environnement de travail académique unifié — de l'événement à la publication, en un seul endroit

<br/>

## Qui sommes-nous

**Eventy360** est une plateforme numérique intégrée conçue pour les chercheurs algériens et arabophones. Elle réunit en un seul espace de travail tout ce dont un chercheur a besoin tout au long de son cycle de recherche : découverte de conférences et d'événements scientifiques, soumission de travaux et de résumés, suivi en temps réel des étapes d'évaluation, gestion des abonnements, et accès à une bibliothèque de recherche publiée.

Fini les allers-retours entre e-mails, formulaires papier et liens éparpillés. **Eventy360** met l'intégralité de votre parcours de recherche au creux de votre main.

<br/>

## ✨ Ce que vous obtenez

| &nbsp; | Fonctionnalité | Ce que vous obtenez concrètement |
|:---:|:---|:---|
| 🔍 | **Découverte d'événements** | Parcourez les appels à communications actifs, filtrez par sujet ou lieu, et sauvegardez ce qui correspond à votre parcours |
| 📄 | **Soumission de travaux** | Soumettez vos résumés, articles complets et révisions via un flux unifié avec visibilité claire à chaque étape |
| 🔔 | **Alertes intelligentes** | Abonnez-vous aux thématiques scientifiques qui vous intéressent et recevez des notifications au bon moment |
| ✅ | **Vérification académique** | Prouvez votre statut de chercheur via un processus documentaire sécurisé, traité par une équipe dédiée |
| 📚 | **Bibliothèque de recherche** | Parcourez, recherchez et téléchargez des travaux publiés via des liens protégés |
| 💳 | **Abonnement et facturation** | Suivez votre niveau d'accès et soumettez vos preuves de paiement directement depuis l'application |
| 🌙 | **Mode sombre / clair** | Une expérience visuelle confortable qui s'adapte automatiquement aux paramètres de votre appareil |
| 🌐 | **Trois langues** | Arabe · Français · Anglais avec support RTL complet |

<br/>

## 📲 La plateforme est disponible sur

<div align="center">

| | Plateforme | Accès |
|:---:|:---|:---|
| 🌐 | **Site Web** | Disponible maintenant sur [eventy360.app](https://eventy360.vercel.app) |
| 📱 | **Application Android** | [Télécharger la dernière version](https://github.com/jhonny1994/eventy360/releases/latest) depuis les releases GitHub |
| 🍎 | **Application iOS** | Bientôt disponible |

</div>

<br/>

## 🛡 Sécurité et fiabilité

La plateforme est construite sur des standards de sécurité élevés qui garantissent la protection de vos données et l'intégrité de votre parcours de recherche :

- Chaque fichier téléversé passe par une requête authentifiée et est ouvert ultérieurement via des liens signés à durée limitée
- Système de permissions granulaire qui n'expose aucune donnée sauf aux personnes y ayant droit
- Les déploiements et mises à jour passent par des environnements protégés avant de vous parvenir
- La vérification d'identité et l'abonnement nécessitent une validation humaine avant l'octroi d'un accès premium

<br/>

## 🤝 Licence et utilisation

Ce dépôt est visible publiquement à des fins d'évaluation, d'aperçu du produit et de partenariat potentiel.  
Le code source, la documentation et tous les contenus sont protégés par des droits de propriété intellectuelle exclusifs.  
Pour les détails d'utilisation autorisée, consultez [PROPRIETARY-NOTICE.md](PROPRIETARY-NOTICE.md).

<br/>

<div align="center">

Créé avec passion pour la communauté académique algérienne et arabophone 🇩🇿

</div>

---

<details>
<summary><b>🛠 Pour les développeurs — Informations techniques</b></summary>

<br/>

### Stack technique

| Couche | Technologies |
|:---|:---|
| Application web | Next.js 16 · React 19 · TypeScript · Tailwind CSS · next-intl |
| Application mobile | Flutter · Dart — Android & iOS |
| Backend | Supabase (PostgreSQL · Auth · Storage · Edge Functions · RLS) |
| CI/CD | GitHub Actions avec environnements de déploiement protégés |

### Structure du dépôt

```
eventy360/
├── apps/
│   ├── web/       # Application Next.js — pages publiques, tableau de bord chercheur, admin
│   └── mobile/    # Application Flutter — parcours complet du chercheur
├── supabase/      # Schémas, fonctions, RLS et configuration du stockage
├── docs/          # Architecture, guide de développement, environnements, processus de release
└── .github/       # Workflows CI, sécurité, politique de dépendances, CODEOWNERS
```

### Lancer l'application web en local

```bash
cp apps/web/.env.example apps/web/.env.local
pnpm install:web
pnpm dev:web
```

### Lancer l'application mobile en local

```bash
cd apps/mobile
flutter pub get
flutter run
```

### Documentation développeur

- [Architecture](docs/architecture.md)
- [Guide de développement](docs/development.md)
- [Environnements](docs/environments.md)
- [Processus de release](docs/release.md)

</details>

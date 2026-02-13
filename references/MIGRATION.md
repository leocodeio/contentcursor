# Migration Guide: Spectral Repository Reference

This document serves as a comprehensive reference for the **Spectral** repository - a creator-editor collaboration and content management platform for YouTube production pipelines.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [Authentication & Payments](#authentication--payments)
6. [Features](#features)
7. [Folder Structure](#folder-structure)
8. [Key Services](#key-services)
9. [Development Workflow](#development-workflow)
10. [Migration Notes](#migration-notes)

---

## 📖 Project Overview

**Spectral** is a creator-editor collaboration platform designed to streamline the YouTube production pipeline.

### Core Problem Solved
- **Before:** Fragmented workflow (Drive → Editor → WhatsApp → YouTube Studio)
- **After:** Unified platform with version control, approvals, and auto-publishing

### Target Users
- Content Creators (YouTubers, influencers)
- Video Editors (freelancers, agencies)
- Production Agencies (multi-client management)

---

## 🛠 Tech Stack

### **Framework & Runtime**
| Category | Technology | Purpose |
|----------|------------|---------|
| **Web Framework** | Remix (v2.15.1) | Full-stack React framework |
| **Runtime** | Node.js (>=20.0.0) | Server runtime |
| **Package Manager** | pnpm (v9.0.0) | Monorepo package management |
| **Build Tool** | Turborepo (v2.5.5) | Build orchestration |
| **Language** | TypeScript (v5.1.6) | Type safety |

### **Frontend**
| Category | Technology | Purpose |
|----------|------------|---------|
| **UI Library** | React (v18.2.0) | Component rendering |
| **Styling** | Tailwind CSS (v3.4.17) | Utility-first CSS |
| **UI Components** | Radix UI (v1.1.x) | Accessible primitives |
| **Icons** | Lucide React, Radix Icons | Icon system |
| **Forms** | React Hook Form + Zod | Form handling & validation |
| **Charts** | Recharts (v2.15.4) | Data visualization |
| **Command Menu** | cmdk | Command palette |
| **i18n** | i18next + react-i18next | Internationalization |

### **Backend & Database**
| Category | Technology | Purpose |
|----------|------------|---------|
| **ORM** | Prisma (v6.6.0) | Database ORM |
| **Database** | PostgreSQL | Primary database |
| **Authentication** | Better Auth (v1.2.x) | Auth framework with OAuth |
| **Payments** | Polar.sh + Stripe integration | Subscription/payments |
| **Cloud Storage** | Google Drive API (via @googleapis/drive) | File storage for media/versions |
| **Alternative Storage** | Google Cloud Storage (@google-cloud/storage) | Alternative storage option |

### **DevOps & Tools**
| Category | Technology | Purpose |
|----------|------------|---------|
| **Linting** | ESLint (v8.38.0) | Code linting |
| **Formatting** | Prettier (v3.5.3) | Code formatting |
| **Git Hooks** | Husky (v9.1.7) | Git hooks management |
| **Commits** | Commitizen + Commitlint | Conventional commits |
| **Releases** | Semantic Release | Automated releases |

---

## 🏗 Architecture

### **Monorepo Structure**
```
spectral/
├── apps/
│   └── web/                 # Main Remix application
├── packages/
│   ├── db/                  # Database layer (Prisma)
│   └── types/               # Shared TypeScript types
├── flows/                   # Flow diagrams (db.drawio)
├── future/                  # Deprecated/experimental code
├── study/                   # Documentation, PDFs, research
└──turbo.json               # Turborepo configuration
```

### **Web App Architecture** (`apps/web/`)
```
apps/web/
├── app/
│   ├── server/
│   │   ├── services/        # Backend services
│   │   │   ├── auth/       # Authentication
│   │   │   ├── common/      # Shared utilities
│   │   │   ├── creator/     # Creator features
│   │   │   ├── editor/      # Editor features
│   │   │   ├── payments/    # Payment processing
│   │   │   └── session/     # Session management
│   │   ├── middlewares/     # Express-style middleware
│   │   └── utils/          # Server utilities
│   ├── routes/             # Remix routes (auto-generated)
│   └── entry files         # Client/server entry points
├── components/             # React components
├── public/                 # Static assets
└── server.ts               # Server entry
```

---

## 🗄 Database Schema

### **Core Models** (via Prisma)

#### Users & Authentication
- `User` - Core user profile
- `Session` - User sessions
- `Account` - OAuth accounts (Google, etc.)
- `Verification` - Email/phone verification

#### Content Management
- `Folder` - Directory structure for content
- `Media` - Uploaded files and versions
- `Contribution` - Editor contributions (v1, v2, etc.)

#### Collaboration
- `Comment` - Feedback on versions
- `Approval` - Creator approval workflow

#### Payments (Polar.sh Integration)
- `Subscription` - User subscriptions
- `Invoice` - Payment records

---

## 🔐 Authentication & Payments

### **Authentication Flow**
```
User → Better Auth → OAuth (Google) → Session → JWT Tokens
```

### **Key Auth Features**
- Google OAuth integration
- Session management
- JWT-based tokens
- Role-based access (Creator vs Editor)

### **Payment Integration**
- **Polar.sh** for subscription management
- **Stripe** backend via Polar SDK
- Subscription tiers and billing

---

## ✨ Features

### **1. Content Management**
- [ ] Folder-based organization
- [ ] File upload/download
- [ ] Version control (v1, v2, etc.)
- [ ] Media metadata

### **2. Collaboration**
- [ ] Creator-editor workflow
- [ ] Version approval/rejection
- [ ] In-app commenting
- [ ] Real-time notifications

### **3. Publishing**
- [ ] YouTube API integration
- [ ] Auto-upload on approval
- [ ] Scheduled publishing
- [ ] Multi-channel support

### **4. Team Management**
- [ ] Multi-client support
- [ ] Role-based permissions
- [ ] Activity tracking

---

## 📁 Folder Structure

### **Root Level**
```
spectral/
├── apps/web/              # Main Remix application
├── packages/
│   ├── db/              # Prisma schema & generated client
│   └── types/            # Shared TypeScript definitions
├── flows/                 # Architecture diagrams (db.drawio)
├── future/                # Deprecated/experimental code
├── study/                 # Research, PDFs, documentation
├── .github/              # GitHub workflows
├── .husky/               # Git hooks
├── turbo.json            # Turborepo config
├── pnpm-workspace.yaml   # pnpm monorepo config
└── README.md
```

### **Web App Structure**
```
apps/web/
├── app/
│   ├── server/
│   │   ├── auth/         # Auth service, OAuth setup
│   │   ├── common/       # Shared utilities
│   │   ├── creator/      # Creator-specific services
│   │   ├── editor/       # Editor-specific services
│   │   ├── payments/     # Polar.sh integration
│   │   ├── session/      # Session management
│   │   ├── middlewares/  # Express middleware
│   │   └── utils/        # Server utilities
│   ├── routes/           # Remix routes
│   ├── components/       # React components
│   ├── public/          # Static assets
│   └── server.ts        # Server entry
├── components/           # Shared UI components
├── prisma/              # Database schema
├── public/              # Static files
└── package.json
```

### **Packages Structure**
```
packages/
├── db/                   # Database layer
│   ├── prisma/          # Prisma schema
│   ├── migrations/      # Database migrations
│   └── src/            # Generated Prisma client
└── types/              # Shared TypeScript types
```

---

## 🔧 Key Services

### **1. Authentication Service** (`auth/`)
- User registration/login
- OAuth (Google) integration
- Session management
- JWT token handling

### **2. Content Services** (`editor/`, `creator/`)
- `accounts.server.ts` - Creator accounts
- `contribute.server.ts` - Content contribution
- `creators.server.ts` - Creator management
- `editors.server.ts` - Editor features
- `folder.server.ts` - Folder operations
- `media.server.ts` - File/media handling

### **3. Payment Service** (`payments/`)
- `payment.client.ts` - Client-side payment methods
- `payment.server.ts` - Server-side payment processing

### **4. Session Service** (`session/`)
- `sessions.server.ts` - User session management

---

## 🏃 Development Workflow

### **Commands**

```bash
# Install dependencies
pnpm install

# Development
pnpm dev                  # Run all apps in dev mode
pnpm dev --filter=web     # Run only web app

# Build
pnpm build                # Build all packages/apps
pnpm build --filter=web  # Build only web app

# Database
pnpm db:gen              # Generate Prisma client
pnpm db:migrate          # Run database migrations

# Code Quality
pnpm lint                # Lint all code
pnpm format              # Format with Prettier
pnpm check-types         # TypeScript type checking

# Git
pnpm commit              # Commit with Commitizen
```

### **Database Setup**
```bash
# Generate Prisma client
pnpm db:gen

# Run migrations
pnpm db:migrate
```

### **Environment Variables**
```bash
# Required for development
DATABASE_URL=postgresql://...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
BETTER_AUTH_SECRET=...
POLAR_SH_TOKEN=...
GCP_STORAGE_BUCKET=...
```

---

## 📝 Migration Notes

### **From Other Frameworks**

#### **From Next.js to Remix**
- Remix uses file-based routing with `routes/` folder
- Loader functions replace API routes
- Action functions handle form submissions
- Better SSR by default

#### **From REST to GraphQL (if applicable)**
- Remix handles data loading via loaders
- Actions handle mutations
- No separate GraphQL layer needed

#### **From Other Auth Solutions to Better Auth**
- Better Auth provides OAuth + session management
- Integrates seamlessly with Prisma
- Supports multiple providers

### **Key Differences from Standard Remix Setup**
1. **Monorepo** - Uses Turborepo for build orchestration
2. **Prisma + Better Auth** - Specific auth + DB integration
3. **Polar.sh Payments** - Subscription management via Polar SDK
4. **Google Cloud Storage** - File handling via GCP SDK

---

## 🔗 Useful Resources

### **Official Documentation**
- [Remix Docs](https://remix.run/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Better Auth Docs](https://www.better-auth.com)
- [Polar.sh Docs](https://docs.polar.sh)
- [Radix UI Docs](https://www.radix-ui.com)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### **Internal References**
- `flows/db.drawio` - Database schema diagram
- `study/spectral.md` - Product documentation
- `study/product-management/` - Market research and competitive analysis

---

## 📊 Version Information

| Package | Version |
|---------|---------|
| Remix | v2.15.1 |
| React | v18.2.0 |
| TypeScript | v5.1.6 |
| Prisma | v6.6.0 |
| Better Auth | v1.2.8 |
| Tailwind CSS | v3.4.17 |
| Turborepo | v2.5.5 |
| pnpm | v9.0.0 |

---

## 🚀 Quick Start for Migration

1. **Understand the Monorepo**
   ```bash
   pnpm install
   pnpm dev --filter=web
   ```

2. **Set Up Database**
   ```bash
   pnpm db:gen
   pnpm db:migrate
   ```

3. **Configure Environment**
   - Copy `.env.example` to `.env`
   - Add all required API keys

4. **Run Development Server**
   ```bash
   pnpm dev
   ```

---

*Document generated from spectral repository reference materials.*

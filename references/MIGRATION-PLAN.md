# Migration Plan: Spectral → ContentCursor

This document outlines the complete migration strategy from the **Spectral** repository to **ContentCursor** (Next.js 15 + MongoDB).

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Repository Comparison](#repository-comparison)
3. [Migration Phases](#migration-phases)
4. [Database Schema Migration](#database-schema-migration)
5. [API Implementation Plan](#api-implementation-plan)
6. [Feature Mapping](#feature-mapping)
7. [Known Challenges](#known-challenges)
8. [Action Items](#action-items)

---

## 📊 Executive Summary

| Aspect | Spectral | ContentCursor (Target) |
|--------|----------|------------------------|
| **Framework** | Remix + NestJS | Next.js 15 (Monolithic) |
| **Database** | PostgreSQL | MongoDB |
| **Auth** | Better Auth | Better Auth ✅ |
| **Storage** | Google Drive API | Google Drive API |
| **Payments** | Polar.sh + Stripe | TBD |
| **Architecture** | Monorepo (apps/api + apps/web) | Single Next.js app |

### **Migration Goal**
Migrate ALL Spectral features to ContentCursor while maintaining:
- Google Drive storage integration
- Better Auth authentication
- MongoDB database
- Monolithic Next.js architecture

---

## 🔄 Repository Comparison

### **Spectral Architecture**

```
spectral/
├── apps/web/                 # Remix frontend
├── apps/api/                 # NestJS backend
├── packages/
│   ├── db/                  # Prisma schema (PostgreSQL)
│   └── types/                # Shared types
├── flows/                     # Architecture diagrams
└── study/                     # Documentation
```

### **ContentCursor Architecture (Current)**

```
contentcursor/
├── src/
│   ├── app/                 # Next.js 15 app
│   ├── server/              # Services
│   └── generated/           # Prisma client
├── prisma/
│   └── schema.prisma        # MongoDB schema
└── references/              # Spectral docs
```

### **ContentCursor Architecture (Target)**

```
contentcursor/
├── src/
│   ├── app/
│   │   ├── api/            # API routes (Next.js)
│   │   ├── components/      # React components
│   │   └── pages/           # Pages
│   ├── server/
│   │   ├── services/       # Business logic
│   │   ├── models/         # MongoDB models
│   │   └── utils/          # Utilities
│   └── lib/                 # Shared utilities
├── prisma/
│   └── schema.prisma        # MongoDB schema
└── references/               # Spectral reference docs
```

---

## 🏗 Migration Phases

### **Phase 1: Database Schema Migration** ✅ IN PROGRESS
- [ ] Map Spectral PostgreSQL schemas → MongoDB schemas
- [ ] Create Prisma schema for MongoDB
- [ ] Add missing models (Folder, Media, Contribution, Comment, Approval)

### **Phase 2: API Implementation**
- [ ] Folder management API
- [ ] Media upload/download API (Google Drive)
- [ ] Contribution/version control API
- [ ] Comment system API
- [ ] Approval workflow API

### **Phase 3: Frontend Integration**
- [ ] Dashboard pages
- [ ] Media upload components
- [ ] Version control UI
- [ ] Collaboration features

### **Phase 4: Polish & Deploy**
- [ ] Payment integration (if needed)
- [ ] Testing
- [ ] Deployment

---

## 🗄 Database Schema Migration

### **Current ContentCursor Schema (MongoDB)**

| Model | Fields |
|-------|--------|
| **User** | id, name, email, emailVerified, image, role, phone, phoneVerified, profileCompleted, subscriptionId |
| **Session** | id, expiresAt, token, userId, ipAddress, userAgent |
| **Account** | id, accountId, providerId, userId, accessToken, refreshToken, idToken, scope, password |
| **Verification** | id, identifier, value, expiresAt |

### **Spectral Schema (PostgreSQL)** → MongoDB Mapping

#### **1. User Model** ✅ (Already exists)
```prisma
model User {
  id               String    @id @default(auto()) @map("_id") @db.ObjectId
  name             String
  email            String    @unique
  emailVerified    Boolean   @default(false)
  image            String?
  role             String?   // Creator, Editor, Admin
  phone            String?
  phoneVerified    Boolean?
  profileCompleted Boolean?  @default(false)
  subscriptionId   String?
  
  // Spectral additions
  stripeCustomerId String?   // For payments
  googleId        String?   // Link to Google account
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  sessions        Session[]
  accounts        Account[]
  folders         Folder[]
  contributions   Contribution[]
  comments        Comment[]
  approvals       Approval[]
}
```

#### **2. Folder Model** (NEW)
```prisma
model Folder {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  description String?
  parentId    String?  @db.ObjectId
  ownerId     String   @db.ObjectId
  isPublic    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  parent      Folder?   @relation("FolderHierarchy", fields: [parentId], references: [id])
  children    Folder[]  @relation("FolderHierarchy")
  owner       User     @relation(fields: [ownerId], references: [id])
  media       Media[]
  items       FolderItem[]
}
```

#### **3. Media Model** (NEW)
```prisma
model Media {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  name            String
  type            String   // video, image, audio, document
  mimeType        String?
  size            Int
  
  // Google Drive Integration
  driveFileId     String?   // Google Drive file ID
  driveFolderId   String?   // Google Drive folder ID
  driveUrl        String?   // Shareable URL
  
  // Metadata
  duration        Int?      // For videos (in seconds)
  thumbnailUrl    String?
  
  // Ownership
  uploadedById    String   @db.ObjectId
  folderId        String?   @db.ObjectId
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  uploadedBy      User     @relation(fields: [uploadedById], references: [id])
  folder          Folder?   @relation(fields: [folderId], references: [id])
  contributions   Contribution[]
  comments        Comment[]
  approvals       Approval[]
  
  @@index([uploadedById])
  @@index([folderId])
}
```

#### **4. Contribution Model** (NEW)
```prisma
model Contribution {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  version     Int      // v1, v2, v3, etc.
  description String?
  
  // Editor info
  editorId    String   @db.ObjectId
  
  // Media reference
  mediaId     String   @db.ObjectId
  
  // Drive info for this version
  driveFileId String?
  driveUrl    String?
  
  // Status
  status      String   @default("pending") // pending, approved, rejected
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  editor      User     @relation(fields: [editorId], references: [id])
  media       Media    @relation(fields: [mediaId], references: [id])
  comments    Comment[]
  approvals   Approval[]
  
  @@index([mediaId])
  @@index([editorId])
}
```

#### **5. Comment Model** (NEW)
```prisma
model Comment {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  content         String
  
  // Reference to contribution
  contributionId  String   @db.ObjectId
  
  // Author
  authorId        String   @db.ObjectId
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  contribution    Contribution @relation(fields: [contributionId], references: [id])
  author          User         @relation(fields: [authorId], references: [id])
  
  @@index([contributionId])
  @@index([authorId])
}
```

#### **6. Approval Model** (NEW)
```prisma
model Approval {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  status          String   // pending, approved, rejected
  
  // Reference
  contributionId  String   @db.ObjectId
  
  // Approver (Creator)
  approverId      String   @db.ObjectId
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  decidedAt       DateTime?
  
  contribution    Contribution @relation(fields: [contributionId], references: [id])
  approver        User         @relation(fields: [approverId], references: [id])
  
  @@index([contributionId])
  @@index([approverId])
}
```

#### **7. FolderItem Model** (NEW - for many-to-many)
```prisma
model FolderItem {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  folderId  String   @db.ObjectId
  mediaId  String   @db.ObjectId
  
  createdAt DateTime @default(now())
  
  folder    Folder   @relation(fields: [folderId], references: [id])
  media     Media    @relation(fields: [mediaId], references: [id])
  
  @@unique([folderId, mediaId])
}
```

---

## 🔌 API Implementation Plan

### **1. Folder Management API**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/folders` | GET | List all folders |
| `/api/folders` | POST | Create folder |
| `/api/folders/:id` | GET | Get folder details |
| `/api/folders/:id` | PUT | Update folder |
| `/api/folders/:id` | DELETE | Delete folder |
| `/api/folders/:id/items` | GET | List folder items |

### **2. Media Management API**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/media` | GET | List all media |
| `/api/media/upload` | POST | Upload file (Google Drive) |
| `/api/media/:id` | GET | Get media details |
| `/api/media/:id` | DELETE | Delete media |
| `/api/media/:id/versions` | GET | List versions |

### **3. Contribution/Version API**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/contributions` | GET | List contributions |
| `/api/contributions` | POST | Create new version |
| `/api/contributions/:id` | GET | Get contribution details |
| `/api/contributions/:id/approve` | POST | Approve version |
| `/api/contributions/:id/reject` | POST | Reject version |

### **4. Comments API**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/comments` | GET | List comments |
| `/api/comments` | POST | Add comment |
| `/api/comments/:id` | DELETE | Delete comment |

---

## 📦 Feature Mapping

### **Spectral Features → ContentCursor**

| Feature | Spectral Implementation | ContentCursor Implementation |
|---------|----------------------|-------------------------|
| **User Auth** | Better Auth + OAuth | ✅ Already exists |
| **Google Sign-in** | Better Auth Google provider | ✅ Use existing |
| **Folder Management** | NestJS API + PostgreSQL | Next.js API + MongoDB |
| **Media Upload** | Drive API upload | Next.js API + Drive API |
| **Version Control** | Contributions table | MongoDB Contribution model |
| **Comments** | Comments table | MongoDB Comment model |
| **Approvals** | Approval workflow | MongoDB Approval model |
| **Payments** | Polar.sh + Stripe | Not in scope yet |

---

## ⚠️ Known Challenges

### **1. PostgreSQL → MongoDB Migration**
- **Challenge:** Different data models
- **Solution:** Rewrite schemas for document-based structure
- **Impact:** Medium effort

### **2. NestJS → Next.js API**
- **Challenge:** Different routing patterns
- **Solution:** Use Next.js App Router API routes
- **Impact:** Low effort

### **3. Google Drive Integration**
- **Challenge:** Complex async upload flow
- **Solution:** Follow Spectral's pattern in `media.repository.ts`
- **Impact:** Medium effort (need to implement DriveService)

### **4. Transactions**
- **Challenge:** MongoDB transactions vs PostgreSQL
- **Solution:** Use MongoDB replica set transactions
- **Impact:** Low effort (contentcursor already has replica set)

---

## ✅ Action Items

### **Immediate Next Steps**

1. **Update Prisma Schema**
   - Add Folder, Media, Contribution, Comment, Approval models
   - Ensure MongoDB replica set is running

2. **Implement Google Drive Service**
   - Create `DriveService` following Spectral pattern
   - Implement uploadFile, deleteFile, getFile methods

3. **Implement Folder API**
   - CRUD operations for folders
   - Hierarchy support (parent/child)

4. **Implement Media API**
   - Upload with Drive integration
   - Download/streaming support

5. **Implement Contribution API**
   - Version creation
   - Approval workflow

---

## 📁 Reference Files

| File | Purpose |
|------|---------|
| `references/MIGRATION.md` | Spectral tech stack reference |
| `references/study/spectral.md` | Product documentation |
| `references/apps/api/src/modules/media/` | Media service implementation |
| `references/apps/api/src/modules/folder/` | Folder service implementation |
| `references/apps/web/app/server/services/` | Remix service patterns |

---

## 🏁 Quick Start

```bash
# 1. Start MongoDB replica set (required)
mongod --replSet rs0 --port 27019

# 2. Generate Prisma client
cd contentcursor
npx prisma generate

# 3. Push schema to database
npx prisma db push

# 4. Start development server
bun run dev
```

---

*Migration plan generated from Spectral repository analysis.*
*Last updated: 2026-02-12*

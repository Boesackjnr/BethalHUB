# 🛡️ BETHALHUB

**BethalHUB** 

use the following account details to log in. do not enter any of your personal details to the site, remember this is a test version (prototype), and is not fully
live and operational yet. god bless!!.

email: Test123@gmail.com
password: t12345678

---

## ✨ Features & Architecture

BethalHUB utilizes a full-stack, client-first structure powered by **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4**, and **Firebase** (Firestore & Auth).

### 1. 👥 Resident & Business Portals
*   **Dual Profiles**: Complete dynamic user setups for either community residents (Individuals) or local organizations (Business Partners).
*   **Trust badging**: Users track their verification status seamlessly. Verified residents unlock community project access and administrative capabilities.
*   **Unified Authentication**: Secured via Google OAuth and Firebase Authentication.

### 2. 💼 Opportunity Marketplace (Tenders, Jobs & Learnerships)
*   **Category Filtering**: Intuitive bento-grid components and lists to quickly parse available **Tenders**, **RFQs**, **Jobs**, **Learnerships**, and **Community Projects**.
*   **Detailed Information Panels**: Responsive routing structure for viewing comprehensive listings, attachment documentation, deadlines, and direct submission contacts.

### 3. 📢 Community Alerts & Notices
*   **Real-time Bulletins**: Urgent updates on municipal actions, regional electricity/water schedules, public services, and events.
*   **Priority Triage**: Color-coded, high-contrast indicators mapping to status importance (`low`, `medium`, `high`, `urgent`).

### 4. 🎛️ Back-Office Content Moderator & Dashboard (`/admin`)
*   **Responsive Control Center**: Intelligently fits screens ranging from widescreen monitors to mid-sized tablets and mobile layouts.
*   **User Management & Quick-Verification**: Double-shield control actions for Admins to view pending profiles, toggle resident status on/off, and manage regional authorizations.
*   **Business Ledger Auditing**: Instantly audit submitted business logos, website connectivity, and categorical mappings.
*   **Dynamic Data Seeding**: Quick-action database populate engine to test system boundaries in live preview environments.

---

## 🛠️ Tech Stack & Directory Structure

```text
├── .env.example             # Documented template for external credential integration
├── firebase-blueprint.json  # Data mapping schema definition representing Firestore
├── firestore.rules          # Security controls enforcing write authorization
├── src/
│   ├── App.tsx              # Main system shell & core client routes
│   ├── main.tsx             # DOM initialization entry point
│   ├── types.ts             # Strongly-typed shared TypeScript interfaces
│   ├── index.css            # Tailwind CSS v4 directives & font imports
│   ├── components/          # Reusable layout fragments, menus, and sidebars
│   │   └── admin/           # Navigation bars, overlay drawers, tables, and statistics cards
│   ├── contexts/            # React context modules managing globally accessible state (e.g., Auth)
│   ├── lib/                 # Core engine helpers (Firebase initialization, security rules, seed scripts)
│   └── pages/               # Functional view definitions representing the user flow
│       ├── admin/           # AdminOverview, AdminContent, AdminUsers, AdminBusinesses
│       └── ...              # Home, Profile, Partners, Opportunities, Contact, About
```

*   **UI Framework**: React 19 (Functional Hooks & Context)
*   **Bundler & Preview Engine**: Vite
*   **Responsive Styling**: Tailwind CSS v4 (utilizing utility-first responsive variables)
*   **Graphics & Geometry**: Lucide React
*   **Micro-Interactions**: Motion (`motion`)

---

## 🗄️ Database Schema & Object Models

All structural documents persist as real-time records in **Google Cloud Firestore**. Our system implements strict object validation as mapped in `firebase-blueprint.json`:

### `User`
```typescript
interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'individual' | 'business' | 'admin';
  isVerified: boolean;
  phoneNumber?: string;
  location?: string;
  avatarUrl?: string;
  createdAt: string;
}
```

### `Opportunity`
```typescript
interface Opportunity {
  id: string;
  title: string;
  organization: string;
  description: string;
  category: 'Tender' | 'RFQ' | 'Job' | 'Learnership' | 'Internship' | 'Community Project';
  deadline: string;
  location: string;
  status: 'open' | 'closed' | 'draft';
}
```

### `Business`
```typescript
interface BusinessProfile {
  id: string;
  name: string;
  logoUrl?: string;
  description: string;
  category: string;
  website?: string;
  location: string;
  contact: string;
  verified: boolean;
  ownerId: string;
}
```

### `Notice`
```typescript
interface CommunityNotice {
  id: string;
  title: string;
  content: string;
  type: 'Municipal' | 'Water/Electricity' | 'Announcement' | 'Event' | 'Public Update';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
}
```

---

## 🚀 Getting Started

Ensure you have [Node.js](https://nodejs.org/) installed, then process the environment:

### 1. Setup Dependencies
```bash
npm install
```

### 2. Run Locally (Development server)
```bash
npm run dev
```
The dev server runs on [http://localhost:3000](http://localhost:3000) inside our reverse proxy container logic.

### 3. Check Syntax & Static Types
```bash
npm run lint
```

### 4. Compile Production Shell
```bash
npm run build
```
Creates a hyper-compact, static asset bundle within the `/dist` directory.

---

## 📞 Portal Information & Contacts
BethalHUB's opportunities management services and updates operate directly via the coordinate desk:
*   **Administrative Center**: `3905 Ext 4 Musa Street, Bethal West, Mpumalanga, 2310`
*   **Emergency Portal**: Dynamic channels are verified and monitored 24/7 for our trusted Business Partners.

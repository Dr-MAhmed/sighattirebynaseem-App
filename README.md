# SighAttire E-commerce (Production Ready)

## Overview
A modern, production-ready e-commerce web app built with Next.js, React, Firebase (Firestore, Auth, Storage), and Tailwind CSS.

## Features
- Real product/category data from Firestore
- Admin dashboard (protected)
- Cart, checkout, wishlist, search, and more
- Robust error handling and loading states
- Theming, accessibility, and responsive design

## Getting Started

### 1. Clone the repository
```sh
git clone <your-repo-url>
cd firebaseecommerce2--1-
```

### 2. Install dependencies
```sh
pnpm install
# or
yarn install
# or
npm install
```

### 3. Configure environment variables
Create a `.env.local` file in the root with the following:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
NEXT_PUBLIC_ADMIN_EMAIL=your_admin_email
NEXT_PUBLIC_ADMIN_PASSWORD=your_admin_password
NEXT_PUBLIC_ADMIN_NAME=Admin User
NEXT_PUBLIC_ADMIN_ID=admin-user-1
```

### 4. (Optional) Seed Firestore with mock data for development
- Place your Firebase service account key as `serviceAccountKey.json` in the project root, or set the `FIREBASE_SERVICE_ACCOUNT_PATH` env variable.
- Run:
```sh
npx ts-node scripts/seed-mock-data.ts
```

### 5. Run the development server
```sh
pnpm dev
# or
yarn dev
# or
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the app.

## Deployment
- Set all environment variables in your production environment.
- Deploy using Vercel, Netlify, or your preferred platform.

## Admin Access
- The admin dashboard is protected. Use the credentials set in your environment variables.
- For production, use secure authentication and admin role checks (see code comments for future hardening).

## Accessibility & SEO
- The app uses semantic HTML, ARIA roles, and responsive design.
- Add/adjust meta tags in `app/layout.tsx` as needed for SEO.

## Analytics
- Integrate your preferred analytics (Google Analytics, etc.) in `app/layout.tsx` or via a tag manager.

## Support
For issues or feature requests, open an issue in this repository.

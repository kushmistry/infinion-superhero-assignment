# Superhero Hub Frontend

A modern Next.js application for browsing superheroes and building teams.

## Features

- 🦸 **Hero Database**: Browse and search superheroes
- 👥 **Team Builder**: Create balanced superhero teams
- ⭐ **Favorites**: Save your favorite heroes
- 🔐 **Authentication**: User registration and login
- 🎨 **Modern UI**: Built with Tailwind CSS and responsive design

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **State Management**: React Context + Hooks
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running (see backend README)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```bash
# Backend API URL (adjust if your backend is on different port)
NEXT_PUBLIC_API_URL=http://localhost:8001
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── auth/             # Authentication forms
│   └── layout/           # Layout components
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication state
├── lib/                  # Utilities
│   └── api.ts           # API client
└── hooks/               # Custom React hooks
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

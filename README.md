# IPL Auction Web App — Production Ready

A full-stack cricket auction platform with real-time bidding, premium animations, and robust admin controls.

## Tech Stack
- **Frontend**: React + Vite, TailwindCSS, Framer Motion, Zustand
- **Backend**: Node.js + Express, Socket.io
- **Database**: Supabase (PostgreSQL + Realtime + Auth)

## Setup Instructions

### 1. Supabase Setup
1. Create a new Supabase project.
2. Run the SQL migrations in `supabase/migrations/` in order (001, 002, 003).

### 2. Local Development
1. Clone the repo.
2. Create a `.env` file in the root based on `.env.example`.
3. Install dependencies: `npm install`
4. Run both client and server: `npm run dev`

### 3. Deployment
- **Frontend**: Connect the `client/` directory to Vercel.
- **Backend**: Connect the `server/` directory to Railway or Render.

## Features
- **Real-time Bidding**: Sub-100ms latency via Socket.io.
- **Role-based Access**: Admin, Team Owner, and Viewer roles.
- **Premium UI**: Framer Motion animations and dark-mode aesthetic.
- **Admin Toolkit**: Start/Pause auction, CSV upload, and analytics.

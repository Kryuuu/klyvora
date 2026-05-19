🌌 KlyVora — Neural Workspace Orchestrator

> **From chaos to synchronized neural automation.**

KlyVora is an AI-powered SaaS platform for workflow management, task orchestration, and team collaboration. Built with a signature **"Obsidian Glass"** aesthetic — featuring deep glassmorphism, atmospheric glow effects, and ultra-wide border-radius — it transforms complex projects into a streamlined network of actionable intelligence.

![Next.js](https://img.shields.io/badge/Next.js-16.2.1-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%7C%20DB%20%7C%20Realtime-3FCF8E?logo=supabase)
![Tailwind](https://img.shields.io/badge/Tailwind%20CSS-v4-38B2AC?logo=tailwindcss)

---

✨ Features

🧠 AI Synthesis Engine  
Generate entire operational clusters from a single prompt using **Gemini 2.0 Flash**. Choose from industry templates (E-commerce, DevOps, Content, Startup, Productivity) or describe your own workflow — the AI creates structured tasks and injects them directly into your workspace.

🎨 Vision Studio  
AI-powered image generation through a premium prompt studio. Describe any visual concept and the synthesis engine renders it in real-time with SynthID watermarking.

📋 Mission Board (Kanban)  
A clean, three-column task board with **Normal → Operational → Mission Completed** status flow. Search, filter, and manage tasks across all clusters with one-click status toggling.

📁 Neural Workspace Grid (Clusters)  
Organize projects into clusters — each one a self-contained workspace with progress tracking, task statistics, and quick actions. Create manually or let the AI build one for you.

💬 Global Nexus (Community Chat)  
Realtime global chat room powered by Supabase Realtime. Features `@username` tagging, ephemeral messaging for free users, plan badges (Free/Pro/SYS_DEV), and admin moderation tools.

👥 Network & Direct Messages  
Friend system with search, connection requests, and acceptance flow. Once connected, users can open encrypted direct message tunnels with realtime delivery.

💳 Pro Subscription  
Freemium model with Midtrans payment gateway integration:

|                    | Free     | Pro                 |
| ------------------ | -------- | ------------------- |
| Clusters           | 3 max    | Unlimited           |
| AI Generations     | 3 max    | Unlimited           |
| Vision Generations | 3 max    | Unlimited           |
| Neural Processing  | Standard | Priority            |
| Price              | $0       | Rp49.000 (one-time) |

🎛️ Command Palette  
Quick-access command palette for instant navigation across all sections of the workspace.

---

🛠️ Tech Stack

| Layer               | Technology                                        |
| ------------------- | ------------------------------------------------- |
| **Framework**       | Next.js 16.2.1 (Turbopack)                        |
| **Frontend**        | React 19.2.4                                      |
| **Styling**         | Tailwind CSS v4 + Obsidian Glass design tokens    |
| **Auth & Database** | Supabase (Auth, PostgreSQL, Realtime, RPC)        |
| **AI Engine**       | Google Gemini 2.0 Flash (text + image generation) |
| **Payments**        | Midtrans Snap (sandbox/production)                |
| **Deployment**      | Vercel-ready (Node.js runtime)                    |

---

📁 Project Structure

```txt
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.js          # Login page
│   │   └── register/page.js       # Registration page
│   ├── (dashboard)/
│   │   ├── layout.js              # Authenticated shell layout
│   │   ├── dashboard/page.js      # Command center overview
│   │   ├── workflows/page.js      # Cluster management (CRUD)
│   │   ├── tasks/page.js          # Kanban mission board
│   │   ├── generate/page.jsx      # AI workflow synthesis
│   │   ├── vision/page.js         # AI image generation
│   │   ├── community/page.js      # Global realtime chat
│   │   ├── network/page.js        # Friends & direct messages
│   │   └── subscription/page.js   # Pro upgrade + Midtrans
│   ├── api/
│   │   ├── ai/route.js            # Gemini text generation
│   │   ├── vision/route.js        # Gemini image generation
│   │   ├── payment/route.js       # Midtrans token creation
│   │   ├── webhook/route.js       # Midtrans payment callback
│   │   └── scan/route.js          # Utility scanner
│   ├── layout.js                  # Root layout
│   ├── page.js                    # Landing page
│   └── globals.css                # Global styles + design tokens
├── components/
│   ├── AppShell.js                # Dashboard shell (sidebar + navbar)
│   ├── AuthExperience.js          # Auth form wrapper
│   ├── CommandPalette.js          # Quick navigation overlay
│   ├── Navbar.js                  # Top navigation bar
│   ├── Sidebar.js                 # Side navigation
│   ├── Toast.js                   # Toast notification system
│   └── ui/                        # Reusable UI primitives
│       ├── Badge.js
│       ├── Button.js
│       ├── Card.js
│       ├── Input.js
│       └── Modal.js
├── lib/
│   ├── supabase/server.js         # Server-side Supabase client
│   ├── supabaseClient.js          # Client-side Supabase client
│   ├── authClient.js              # Client session helper
│   └── serverFetch.js             # Fetch utility with timeout
└── proxy.js                       # Next.js 16 proxy (auth middleware)
```

---

🚀 Getting Started

Prerequisites

- Node.js 18+
- npm or yarn
- Supabase project (with Auth, Database, and Realtime enabled)
- Gemini API key
- Midtrans account (sandbox or production)

1. Clone & Install

```bash
git clone https://github.com/Kryuuu/klyvora.git
cd klyvora
npm install
```

2. Environment Setup

Create `.env.local` in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Engine
GEMINI_API_KEY=your_gemini_api_key

# Payment Gateway
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key

# Developer Access
DEVELOPER_EMAIL=your_email@example.com
NEXT_PUBLIC_DEVELOPER_EMAIL=your_email@example.com
```

3. Database Setup

Set up the following tables in your Supabase project:

- `profiles` — User profile data (id, name)
- `workflows` — Workflow clusters (id, user_id, title, category)
- `tasks` — Task items (id, workflow_id, title, status, due_date)
- `subscriptions` — User subscription plans (user_id, plan, status)
- `messages` — Global chat messages
- `direct_messages` — Private DM system
- `friendships` — Friend connections (requester_id, receiver_id, status)
- `vision_history` — AI image generation logs

Enable **Realtime** on `messages` and `direct_messages` tables.

4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the application.

5. Build for Production

```bash
npm run build
npm start
```

---

🔐 Authentication & Access Control

- **Auth**: Supabase Auth with email/password
- **Session Management**: Server-side validation via Next.js 16 Proxy
- **Developer Role**: Identified by `DEVELOPER_EMAIL` env var — bypasses free tier limits and gains admin controls in community chat
- **Free Tier Limits**: 3 workflows, 3 AI generations, 3 vision generations
- **Pro Tier**: Unlimited access via Midtrans one-time payment

---

📡 API Routes

| Endpoint       | Method | Description                                  |
| -------------- | ------ | -------------------------------------------- |
| `/api/ai`      | POST   | Generate workflow structure from text prompt |
| `/api/vision`  | POST   | Generate images from text prompt             |
| `/api/payment` | POST   | Create Midtrans payment token                |
| `/api/webhook` | POST   | Handle Midtrans payment notifications        |
| `/api/scan`    | POST   | Utility scan endpoint                        |

---

🎨 Design System

KlyVora uses a custom **Obsidian Glass** design language:

- **Colors**: Cyan-400 primary, Violet-500 accent, Slate-950 base
- **Glass Cards**: `bg-white/[0.04]` with `backdrop-blur-xl` and `border-white/10`
- **Border Radius**: Ultra-wide `rounded-[28px]` to `rounded-[34px]`
- **Typography**: 10px uppercase tracking labels + semibold headings
- **Animations**: `animate-fade-in`, `animate-slide-up`, `animate-glow-pulse`, `animate-shimmer`
- **Atmospheric Effects**: Blurred gradient orbs, dotted grid backgrounds

---

📄 License

This project is private and not licensed for public distribution.

---

**KlyVora // Neural Workspace Orchestration // V1.0 // Crafted for the Future Operator.**

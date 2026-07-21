# 💯 True Life Bot

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Grammy](https://img.shields.io/badge/Grammy-Active-blue?style=for-the-badge&logo=telegram)](https://grammy.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-Container-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

An interactive, text-based Telegram RPG game bot featuring a rich UI powered by inline menus.

---

## 🚀 Tech Stack

- **Language:** Node.js (TypeScript)
- **Bot Framework:** [Grammy](https://grammy.dev/)
- **ORM:** [Prisma](https://www.prisma.io/) (Multi-file schemas)
- **Database:** PostgreSQL
- **Infrastructure:** Docker Compose

---

## 📂 Project Structure

A brief overview of the project's architecture layouts:
```text
prisma/
├── migrations/      # Database migration history
└── schemas/         # Modular Prisma schemas (user, bank, role)
src/
├── config/          # Global game balance & validation constants
├── generated/       # Strictly typed Prisma client
├── handlers/        # Interface layer (GrammY routers & commands)
│   ├── admin.handler.ts    # Admin management (/changeid)
│   ├── profile.handler.ts  # Profile customization (никнейм)
│   ├── user.handler.ts     # Core player actions (/start, профиль)
│   └── guards.ts           # Middleware role/permission guards
├── lib/             # Infrastructure clients (Prisma Client instance)
├── repositories/    # Data access layer (Pure CRUD queries & transactions)
├── services/        # Domain core (Pure business logic)
│   ├── admin.service.ts      # Admin operations & ID change logic
│   ├── permission.service.ts # Role weight calculation & RBAC
│   └── user.service.ts       # Profile, login & username operations
├── utils/           # Shared helpers (Formatter, ID generator, roles)
└── index.ts         # Central entrypoint & Manual Dependency Injection
```

## 🛠️ Quick Start
### 1. Clone the Repository & Install Dependencies
```bash
git clone https://github.com/d1oxsnd/true_life_bot.git
cd true_life_bot
npm install
```
### 2. Environment Setup
Create a .env file in the root directory and fill it with your credentials:

```bash
# Database connection string (maps to the port exposed in docker-compose.yml)
DATABASE_URL="postgresql://postgres_user:postgres_password@localhost:6000/postgres_db?schema=public"

# Your Telegram Bot Token obtained from @BotFather
BOT_TOKEN="your_bot_token_here"

# Super Admin Telegram ID (automatically gets ADMIN role upon first login)
ADMIN_TELEGRAM_ID="123456789"
```
### 3. Start PostgreSQL via Docker
Spin up the database container in detached mode:

```Bash
docker compose up -d
```
## 4. Setup Database & Run the Bot
Apply migrations, generate the typed client, and boot up the application with hot-reload:

```Bash
npm run db:setup
npm run dev
```

## 📄 License

This project is licensed under the [MIT License](LICENSE).
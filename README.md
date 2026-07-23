# 💯 True Life Bot

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Grammy](https://img.shields.io/badge/Grammy-Active-blue?style=for-the-badge&logo=telegram)](https://grammy.dev/)
[![Prisma](https://img.shields.io/badge/Prisma_7-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Container-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

[🇷🇺 Русский](#-русская-версия) | [🇬🇧 English](#-english-version)

---

## 🇷🇺 Русская версия

### 📖 О проекте
**True Life Bot** — это интерактивный текстовый RPG-бот для Telegram. Игроки могут развивать своего персонажа, управлять банковским балансом, прокачивать статусы (от Бомжа до Админа) и взаимодействовать с другими участниками группы.

### 🚀 Технологический стек
- **Язык & Среда:** Node.js (TypeScript, ES Modules)
- **Фреймворк бота:** [GrammY](https://grammy.dev/)
- **ORM:** [Prisma 7](https://www.prisma.io/) (Модульные схемы в `prisma/schemas`, `prisma.config.ts`)
- **База данных:** PostgreSQL 18
- **Драйвер БД:** `@prisma/adapter-pg` / `pg`
- **Контейнеризация:** Docker Compose

---

### 📂 Архитектура проекта

```text
prisma/
├── migrations/          # История миграций PostgreSQL
└── schemas/             # Модульные схемы Prisma (schema, user, bank, role)
src/
├── commands/            # Обработчики команд бота (GrammY composers)
│   ├── profile/         # Просмотр профиля игрока ("профиль")
│   └── start/           # Команда приветствия (/start)
├── generated/           # Сгенерированный Prisma Client
├── lib/                 # Инициализация Prisma client и иерархия ролей
├── middlewares/         # Middleware (авторизация, проверка бана, RBAC ролей)
├── repositories/        # Слой доступа к данным (CRUD-запросы Prisma)
├── services/            # Слой бизнес-логики (User & Bank services)
├── types/               # Кастомный контекст GrammY (services, smartReply)
├── utils/               # Утилиты (генератор ID, форматирование баланса, экстрактор игроков)
└── index.ts             # Точка входа и ручная инъекция зависимостей (DI)
```

---


### 🛠️ Быстрый запуск

#### 1. Клонирование репозитория и установка зависимостей
```bash
git clone https://github.com/d1oxsnd/true_life_bot.git
cd true_life_bot
npm install
```

#### 2. Настройка переменных окружения
Создайте файл `.env` в корне проекта:
```env
# Подключение к БД (порт 6000 проброшен из контейнера PostgreSQL)
DATABASE_URL="postgresql://postgres_user:postgres_password@localhost:6000/postgres_db?schema=public"

# Токен бота Telegram от @BotFather
BOT_TOKEN="your_telegram_bot_token"

# Telegram ID владельца / супер-админа
ADMIN_TELEGRAM_ID="123456789"
```

#### 3. Запуск PostgreSQL в Docker
```bash
docker compose up -d
```

#### 4. Подготовка БД и запуск бота
```bash
# Применение миграций и генерация Prisma Client
npm run db:setup

# Запуск в режиме разработки с горячей перезагрузкой (tsx watch)
npm run dev
```

#### Полезные скрипты `package.json`:
- `npm run dev` — запуск бота в режиме разработки с отслеживанием изменений.
- `npm run build` — компиляция TypeScript в JavaScript (`dist/`).
- `npm run start` — запуск скомпилированного приложения.
- `npm run db:setup` — применение миграций и генерация типов Prisma.

---

## 🇬🇧 English Version

### 📖 About the Project
**True Life Bot** is an interactive text-based Telegram RPG game bot. Players can develop their characters, manage bank balances, upgrade economic/social statuses (from Homeless to Admin), and interact with other players in chats.

### 🚀 Tech Stack
- **Language & Runtime:** Node.js (TypeScript, ES Modules)
- **Bot Framework:** [GrammY](https://grammy.dev/)
- **ORM:** [Prisma 7](https://www.prisma.io/) (Modular schema files under `prisma/schemas`, configured in `prisma.config.ts`)
- **Database:** PostgreSQL 18
- **DB Driver:** `@prisma/adapter-pg` / `pg`
- **Infrastructure:** Docker Compose

---

### 📂 Project Architecture

```text
prisma/
├── migrations/          # PostgreSQL migration history
└── schemas/             # Modular Prisma schemas (schema, user, bank, role)
src/
├── commands/            # Bot command handlers (GrammY composers)
│   ├── profile/         # Profile handler ("профиль")
│   └── start/           # Welcome handler (/start)
├── generated/           # Generated Prisma Client code
├── lib/                 # Prisma client instance & role weight definitions
├── middlewares/         # Middlewares (Authentication, ban checks, RBAC guards)
├── repositories/        # Data Access Layer (Prisma CRUD operations)
├── services/            # Domain Business Logic (User & Bank services)
├── types/               # Custom GrammY context extensions (services, smartReply)
├── utils/               # Utility functions (ID generation, money formatting, player extraction)
└── index.ts             # Application entrypoint & manual Dependency Injection (DI)
```

---


### 🛠️ Quick Start

#### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/d1oxsnd/true_life_bot.git
cd true_life_bot
npm install
```

#### 2. Environment Setup
Create a `.env` file in the root directory:
```env
# Database connection string (mapped to host port 6000 in docker-compose.yml)
DATABASE_URL="postgresql://postgres_user:postgres_password@localhost:6000/postgres_db?schema=public"

# Telegram Bot Token obtained from @BotFather
BOT_TOKEN="your_telegram_bot_token"

# Telegram ID of the super administrator
ADMIN_TELEGRAM_ID="123456789"
```

#### 3. Start PostgreSQL Database
Spin up the database container:
```bash
docker compose up -d
```

#### 4. Setup Database & Start Bot
```bash
# Apply database migrations & generate Prisma client
npm run db:setup

# Run in development mode (hot-reload via tsx)
npm run dev
```

#### Available `package.json` Scripts:
- `npm run dev` — Run the bot in development mode with live watch/reload.
- `npm run build` — Compile TypeScript to JavaScript (`dist/`).
- `npm run start` — Start the production compiled app.
- `npm run db:setup` — Run Prisma migrations and generate client types.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
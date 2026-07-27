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
**True Life Bot** — это интерактивный текстовый RPG-бот для Telegram. Игроки могут развивать своего персонажа, зарабатывать деньги на работах, играть в казино, грабить других участников, прокачивать социальные и экономические статусы (от Бомжа до Бизнесмена) и управлять банковским балансом.

### 🚀 Технологический стек
- **Язык & Среда:** Node.js (TypeScript, ES Modules)
- **Фреймворк бота:** [GrammY](https://grammy.dev/)
- **ORM:** [Prisma 7](https://www.prisma.io/) (Модульные схемы в `prisma/schemas`, `prisma.config.ts`)
- **База данных:** PostgreSQL 18
- **Драйвер БД:** `@prisma/adapter-pg` / `pg`
- **Контейнеризация:** Docker Compose

---

### 🎮 Команды бота

| Команда | Описание | Пример |
|---|---|---|
| `профиль`, `п` | Просмотр профиля игрока или другого участника | `профиль`, `п @username` |
| `смена`, `работа` | Просмотр информации о смене, стриках и доступных работах | `смена` |
| `смена выйти`, `поработать` | Выход на рабочую смену и заработок денег | `поработать` |
| `слоты [сумма]`, `казино` | Игра в слоты / казино (поддержка `все`, `1.5к`, `2.5м`) | `слоты 500`, `слоты все` |
| `ограбить`, `грабеж` | Попытка ограбить игрока (ответ на его сообщение) | `ограбить` (в ответ) |
| `перевести [ID] [сумма]` | Перевод денег по внутреннему ID игрока (или `перевести [сумма]` в ответ) | `перевести txN-YDx 500`, `перевести 1000` (в ответ) |
| `статус`, `статусы` | Список доступных статусов и их стоимости | `статус` |
| `статус поднять`, `повысить` | Покупка следующего игрового статуса | `статус поднять` |
| `/start` | Регистрация нового игрока в боте | `/start` |

---

### 📂 Архитектура проекта

```text
prisma/
├── migrations/          # История миграций PostgreSQL
└── schemas/             # Модульные схемы Prisma (schema, user, bank, role, robberyStats, workStats)
src/
├── commands/            # Обработчики команд бота (GrammY composers)
│   ├── profile/         # Просмотр профиля игрока
│   ├── robbery/         # Система ограблений пользователей
│   ├── slots/           # Казино / Игровой автомат (слоты)
│   ├── start/           # Команда приветствия (/start)
│   ├── status/          # Покупка и просмотр игровых статусов
│   └── work/            # Рабочие смены, стрики и заработок
├── generated/           # Сгенерированный Prisma Client
├── lib/                 # Клиент Prisma, иерархия ролей и конфигурация работ
├── middlewares/         # Middleware (авторизация, проверка бана, роли)
├── repositories/        # Слой доступа к данным (User, Bank, Robbery, Work repositories)
├── services/            # Слой бизнес-логики (User, Bank, Robbery, Slots, Work services)
├── types/               # Кастомный контекст GrammY (services, smartReply)
├── ui/                  # Оформление и шаблоны сообщений (theme.ts)
├── utils/               # Утилиты (генератор ID, форматирование баланса, экстрактор пользователей)
└── index.ts             # Точка входа и инъекция зависимостей (DI)
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
TELEGRAM_BOT_TOKEN="your_telegram_bot_token"

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
**True Life Bot** is an interactive text-based Telegram RPG game bot. Players can develop their characters, earn money working shifts, play slot machine games, rob other chat participants, upgrade economic/social statuses (from Homeless to Business), and manage their bank account balance.

### 🚀 Tech Stack
- **Language & Runtime:** Node.js (TypeScript, ES Modules)
- **Bot Framework:** [GrammY](https://grammy.dev/)
- **ORM:** [Prisma 7](https://www.prisma.io/) (Modular schema files under `prisma/schemas`, configured in `prisma.config.ts`)
- **Database:** PostgreSQL 18
- **DB Driver:** `@prisma/adapter-pg` / `pg`
- **Infrastructure:** Docker Compose

---

### 🎮 Bot Commands

| Command | Description | Example |
|---|---|---|
| `профиль`, `п` | View your own or another user's profile | `профиль`, `п @username` |
| `смена`, `работа` | View current shift status, streak, and job info | `смена` |
| `смена выйти`, `поработать` | Start a work shift to earn money | `поработать` |
| `слоты [amount]`, `казино` | Play slots / casino game (supports `все`, `1.5к`, `2.5м`) | `слоты 500`, `слоты все` |
| `ограбить`, `грабеж` | Attempt to rob a player (reply to their message) | `ограбить` (in reply) |
| `перевести [ID] [amount]` | Transfer money by user ID (or `перевести [amount]` in reply) | `перевести txN-YDx 500`, `перевести 1000` (in reply) |
| `статус`, `статусы` | View list of available status upgrades and prices | `статус` |
| `статус поднять`, `повысить` | Upgrade to the next status rank | `статус поднять` |
| `/start` | Register a new player account | `/start` |

---

### 📂 Project Architecture

```text
prisma/
├── migrations/          # PostgreSQL migration history
└── schemas/             # Modular Prisma schemas (schema, user, bank, role, robberyStats, workStats)
src/
├── commands/            # Bot command handlers (GrammY composers)
│   ├── profile/         # User profile viewer
│   ├── robbery/         # Player robbery mechanism
│   ├── slots/           # Slot machine game logic & composer
│   ├── start/           # Welcome & user registration (/start)
│   ├── status/          # Status upgrades & status overview
│   └── work/            # Work shifts, streaks, and earnings
├── generated/           # Generated Prisma Client code
├── lib/                 # Prisma instance, role hierarchy, and job definitions
├── middlewares/         # Middlewares (Authentication, ban checks, RBAC guards)
├── repositories/        # Data Access Layer (User, Bank, Robbery, Work repositories)
├── services/            # Domain Business Logic (User, Bank, Robbery, Slots, Work services)
├── types/               # Custom GrammY context extensions (services, smartReply)
├── ui/                  # UI Theme and message presentation layer (theme.ts)
├── utils/               # Utility functions (ID generation, money formatting, player extraction)
└── index.ts             # Application entrypoint & Dependency Injection (DI)
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
TELEGRAM_BOT_TOKEN="your_telegram_bot_token"

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
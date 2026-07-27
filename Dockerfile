# ----------------------------------------------------
# 1. Build Stage
# ----------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Скопировать конфигурационные файлы зависимостей
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma

# Установка всех зависимостей (включая devDependencies для сборки)
RUN npm ci

# Генерация клиента Prisma
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate

# Копирование исходных файлов
COPY src ./src

# Сборка проекта через TypeScript (npm run build -> tsc)
RUN npm run build

# ----------------------------------------------------
# 2. Production Stage
# ----------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Копирование зависимостей и файлов проекта
COPY package*.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma
COPY docker-entrypoint.sh ./

# Установка продакшн зависимостей
RUN npm ci --only=production

# Копирование сгенерированного клиента Prisma и скомпилированного кода dist
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/dist ./dist

# Права на исполнение скрипта входа
RUN chmod +x docker-entrypoint.sh

ENTRYPOINT ["/app/docker-entrypoint.sh"]

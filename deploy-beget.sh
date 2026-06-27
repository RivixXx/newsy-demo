#!/bin/bash
# ============================================================
# Beget Deployment Script for chillenge-russia.ru
# Запускать на сервере Beget через SSH
# ============================================================

set -e

APP_DIR="/var/www/mikhaiaw"
APP_NAME="chillenge-russia"

echo "=== Deploying $APP_NAME ==="

# 1. Клонируем/обновляем репозиторий
if [ ! -d "$APP_DIR" ]; then
    echo "Cloning repository..."
    git clone <YOUR_GIT_REPO_URL> "$APP_DIR"
fi

cd "$APP_DIR"

echo "Pulling latest changes..."
git pull origin main

# 2. Устанавливаем зависимости
echo "Installing dependencies..."
npm ci --production=false

# 3. Генерируем Prisma client
echo "Generating Prisma client..."
npx prisma generate

# 4. Применяем миграции БД
echo "Running database migrations..."
npx prisma migrate deploy

# 5. Заполняем БД начальными данными (только при первом запуске)
echo "Running seed..."
npx tsx prisma/seed.ts

# 6. Собираем приложение
echo "Building Next.js application..."
npm run build

# 7. Останавливаем старый процесс
echo "Stopping existing process..."
pm2 stop "$APP_NAME" 2>/dev/null || true
pm2 delete "$APP_NAME" 2>/dev/null || true

# 8. Запускаем через PM2
echo "Starting application with PM2..."
pm2 start ecosystem.config.js
pm2 save

echo ""
echo "=== Deployment complete ==="
echo ""
echo "Next steps in Beget panel:"
echo "1. Go to Node.js section"
echo "2. Set application root to: $APP_DIR"
echo "3. Set port to: 3000"
echo "4. Enable Node.js application"
echo "5. Configure domain chillenge-russia.ru"
echo "6. Enable SSL certificate"
echo ""
echo "Test: curl http://localhost:3000"

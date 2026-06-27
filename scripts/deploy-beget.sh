#!/bin/bash
# ============================================
# NEWSY — Deploy script for Beget VPS
# ============================================
# Запускать на сервере после подключения по SSH
# bash deploy.sh
# ============================================

set -e

APP_DIR="/var/www/newsy"
NODE_VERSION="22"

echo "🔧 Установка зависимостей..."

# Установка Node.js 22
if ! command -v node &> /dev/null; then
  curl -fsSL https://rpm.nodesource.com/setup_${NODE_VERSION}.x | bash -
  yum install -y nodejs
fi

# Установка PostgreSQL
if ! command -v psql &> /dev/null; then
  yum install -y postgresql-server postgresql
  postgresql-setup initdb
  systemctl enable postgresql
  systemctl start postgresql
fi

# Настройка PostgreSQL — trust для localhost
PG_HBA=$(sudo -u postgres psql -t -c "SHOW hba_file;" | xargs)
sed -i 's/ident$/trust/g; s/peer$/trust/g; s/scram-sha-256$/trust/g' "$PG_HBA"
systemctl restart postgresql

# Создание базы данных
sudo -u postgres psql -c "CREATE USER newsy WITH PASSWORD 'newsy_secret';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE newsy OWNER newsy;" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE newsy TO newsy;" 2>/dev/null || true

echo "📦 Клонирование приложения..."

# Клонирование (замени на свой репозиторий)
if [ ! -d "$APP_DIR" ]; then
  git clone YOUR_REPO_URL $APP_DIR
fi

cd $APP_DIR

# Создание .env
cat > .env << 'EOF'
DATABASE_URL="postgresql://newsy:newsy_secret@localhost:5432/newsy?schema=public"
NEXTAUTH_URL="http://YOUR_DOMAIN"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NODE_ENV="production"
EOF

echo "🏗️ Сборка приложения..."

# Установка зависимостей
npm ci

# Миграция БД
npx prisma migrate deploy

# Сидинг
npx tsx prisma/seed.ts

# Сборка
npm run build

echo "🚀 Настройка systemd сервиса..."

# Создание systemd сервиса
cat > /etc/systemd/system/newsy.service << EOF
[Unit]
Description=NEWSY Next.js App
After=network.target postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=$APP_DIR
ExecStart=$(which node) $APP_DIR/.next/standalone/server.js
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=HOSTNAME=0.0.0.0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable newsy
systemctl restart newsy

echo "🌐 Настройка Nginx..."

# Nginx прокси
cat > /etc/nginx/conf.d/newsy.conf << 'EOF'
server {
    listen 80;
    server_name YOUR_DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

nginx -t && systemctl reload nginx

echo ""
echo "✅ NEWSY развёрнут!"
echo "   URL: http://YOUR_DOMAIN"
echo "   Логин: admin@newsy.ru / Newsy123!"
echo ""
echo "📋 Для SSL:"
echo "   certbot --nginx -d YOUR_DOMAIN"

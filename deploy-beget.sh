#!/bin/bash
# ============================================================
# Beget Deployment Script (Docker + Passenger)
# Запускать внутри Docker контейнера
# ============================================================

set -e

echo "=== Deploying chillenge-russia on Beget ==="

# 1. Устанавливаем Node.js если ещё нет
if ! command -v node &> /dev/null; then
    echo "Installing Node.js 20..."
    mkdir -p ~/.local
    cd ~/.local
    wget -q https://cp.beget.com/shared/bmcys1znnpqt7-csnFitRYB00n0Lnhrm/node-v20.20.2-bionic.tar.xz
    tar xfv node-v20.20.2-bionic.tar.xz --strip 1
    rm node-v20.20.2-bionic.tar.xz
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
    export PATH="$HOME/.local/bin:$PATH"
    echo "Node.js installed: $(node -v)"
fi

cd ~

# 2. Клонируем/обновляем репозиторий
APP_DIR="chillenge-russia"
if [ ! -d "$APP_DIR" ]; then
    echo "Cloning repository..."
    git clone https://github.com/RivixXx/newsy-demo.git "$APP_DIR"
fi

cd "$APP_DIR"
echo "Pulling latest changes..."
git pull origin main

# 3. Устанавливаем зависимости
echo "Installing dependencies..."
npm install

# 4. Генерируем Prisma client
echo "Generating Prisma client..."
npx prisma generate

# 5. Применяем миграции БД
echo "Running database migrations..."
npx prisma migrate deploy

# 6. Seed БД
echo "Running seed..."
npx tsx prisma/seed.ts

# 7. Собираем приложение
echo "Building Next.js..."
npm run build

# 8. Настраиваем .htaccess
echo "Configuring Passenger..."
HTACCESS_PATH="$HOME/public_html/../.htaccess"
cat > "$HTACCESS_PATH" << EOF
PassengerNodejs $(which node)
PassengerAppRoot $(realpath .)
PassengerAppType node
PassengerStartupFile server.js
EOF

echo "Created .htaccess:"
cat "$HTACCESS_PATH"

# 9. Статика через Nginx
echo "Setting up static files..."
rm -rf ~/public_html
ln -s "$(realpath public)" ~/public_html

# 10. Restart
echo "Creating tmp/restart.txt..."
mkdir -p tmp
touch tmp/restart.txt

echo ""
echo "=== Deployment complete ==="
echo "Check: https://chillenge-russia.ru"

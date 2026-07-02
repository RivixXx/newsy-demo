# NEWSY - Interactive Challenge Platform

NEWSY is an interactive digital marketing social platform designed to launch "challenges" (thematic events, business meetings, training, competitions, quests, and online activities). It transforms traditional marketing and daily routines into an engaging, gamified experience.

## Core Features

- **Challenge Constructor:** A universal algorithmic tool for creating complex, multi-stage activities.
- **Gamification Engine:** Integration of rewards, achievements, ratings, and points.
- **Cooperative Mechanics:** Launch joint challenges with partner brands.
- **Interactive Map:** Visualize user activity and local challenges.
- **Advanced Analytics:** Real-time data for organizers and admins.

## Tech Stack

Next.js 15 (фронтенд и серверная логика), TypeScript (типизация), Supabase (база данных PostgreSQL и аутентификация), Prisma (ORM для работы с БД), React 19 (UI-компоненты), Vercel (хостинг и деплой), Three.js (3D-графика), Zod (валидация данных), Lucide React (иконки)

## Getting Started

1.  **Clone and Install:**
    ```bash
    npm install
    ```
2.  **Environment Setup:**
    Copy `.env.example` to `.env` and configure Supabase keys.
3.  **Database Migration:**
    ```bash
    npm run prisma:migrate
    ```
4.  **Seed Data:**
    ```bash
    npm run prisma:seed
    ```
5.  **Run Locally:**
    ```bash
    npm run dev
    ```

## Project Structure

- `src/modules/challenges`: Core logic for challenge creation and discovery.
- `src/modules/identity`: User management and gamified profiles.
- `src/modules/access-control`: RBAC system.
- `src/modules/gamification`: (In progress) Rewards and achievement logic.
- `src/shared`: Reusable components and utilities.

## Documentation

- [Architecture](./docs/Architecture.md)
- [Database Schema](./docs/DatabaseSchema.md)
- [API Reference](./docs/API.md)

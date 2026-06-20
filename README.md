# NEWSY - Interactive Challenge Platform

NEWSY is an interactive digital marketing social platform designed to launch "challenges" (thematic events, business meetings, training, competitions, quests, and online activities). It transforms traditional marketing and daily routines into an engaging, gamified experience.

## Core Features

- **Challenge Constructor:** A universal algorithmic tool for creating complex, multi-stage activities.
- **Gamification Engine:** Integration of rewards, achievements, ratings, and points.
- **Cooperative Mechanics:** Launch joint challenges with partner brands.
- **Interactive Map:** Visualize user activity and local challenges.
- **Advanced Analytics:** Real-time data for organizers and admins.

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Styling:** CSS Modules / `styled-jsx`

## Getting Started

1.  **Clone and Install:**
    ```bash
    npm install
    ```
2.  **Environment Setup:**
    Copy `.env.example` to `.env` and configure your database URL.
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

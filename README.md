# Nexus

An AI-powered business operating platform.

## Setup Instructions

1. Clone the repository and run `pnpm install`.
2. Copy `.env.example` to `.env.local` and fill in the values.
3. Start the Postgres database using Docker Compose:
   ```bash
   docker compose up -d
   ```
4. Start the Inngest dev server (runs natively, not in Docker):
   ```bash
   pnpm dev:inngest
   ```
5. Run the Next.js dev server:
   ```bash
   pnpm dev
   ```

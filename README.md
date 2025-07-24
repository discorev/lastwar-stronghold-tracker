# Stronghold Tracker

A Next.js application for tracking stronghold reset times using Upstash Redis for data storage.

## Features

- Track stronghold reset times with countdown timers
- Add new strongholds with custom duration settings
- Toggle between server time (UTC-2) and local time
- Real-time countdown updates
- Delete completed or unwanted strongholds

## Getting Started

### Prerequisites

1. Create an Upstash Redis database at [https://upstash.com/](https://upstash.com/)
2. Get your Redis REST URL and token from the Upstash dashboard

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```bash
UPSTASH_REDIS_REST_URL=your_redis_rest_url_here
UPSTASH_REDIS_REST_TOKEN=your_redis_rest_token_here
```

### Installation

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Migration

This project has been migrated from SQLite to Upstash Redis for better scalability and cloud deployment. The migration includes:

- Replaced `better-sqlite3` with `@upstash/redis`
- Updated all database functions to be async
- Changed event IDs from numbers to strings
- Implemented Redis sorted sets for efficient ordering by ready time
- Added proper error handling for Redis operations
- Uses composite keys (warzone:coordinate_x:coordinate_y) to prevent duplicate entries for the same location

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

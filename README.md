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

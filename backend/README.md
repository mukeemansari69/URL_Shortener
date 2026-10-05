# URL Shortner Backend

Express API for the frontend. Redis stores users, links, counters, and click activity. Kafka receives link and auth events.

## Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

For Redis and Kafka locally:

```bash
docker run --name url-shortner-redis -p 6379:6379 -d redis:7
```

Set `KAFKA_BROKERS` to your Kafka broker list, for example `localhost:9092`.

The API still starts if Redis or Kafka is unavailable, using in-memory storage and skipping Kafka publishes so frontend development is not blocked.

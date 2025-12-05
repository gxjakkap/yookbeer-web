# syntax=docker/dockerfile:1

FROM oven/bun:latest AS base
WORKDIR /app

RUN apt-get update -y && apt-get install -y --no-install-recommends \
  libc6 libvips curl && \
  rm -rf /var/lib/apt/lists/*

FROM base AS deps

COPY bun.lock package.json ./

RUN bun install --frozen-lockfile

FROM deps AS builder

ENV NEXT_TELEMETRY_DISABLED=1
ARG YB_SHA
ARG YB_COMMIT
ARG YB_BUILDDATE
ENV NEXT_PUBLIC_YB_SHA=${YB_SHA}
ENV NEXT_PUBLIC_YB_COMMIT=${YB_COMMIT}
ENV NEXT_PUBLIC_YB_BUILDDATE=${YB_BUILDDATE}
ENV NODE_ENV=production
COPY . .
RUN bun run build

FROM oven/bun:latest AS runner
WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

RUN addgroup --system --gid 1001 bunuser \
  && adduser --system --uid 1001 --ingroup bunuser bunuser
USER bunuser

EXPOSE 8080
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "server.js"]

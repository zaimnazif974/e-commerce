FROM oven/bun:latest
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install
COPY . .
EXPOSE 3003
CMD bun run seed && bun run index.ts

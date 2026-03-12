FROM oven/bun:latest
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install
COPY . .
EXPOSE 3004
CMD ["bun", "run", "index.ts"]

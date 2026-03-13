FROM oven/bun:latest
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install
COPY . .
EXPOSE 3005
CMD ["bun", "run", "index.ts"]

FROM oven/bun:latest

WORKDIR /app

# Copy dependency files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

EXPOSE 3000

# Run prisma generate at startup (needs DATABASE_URL), then start app
CMD ["sh", "-c", "bunx prisma generate && bun run start"]

FROM oven/bun:latest

WORKDIR /app

# Copy dependency files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client (DATABASE_URL available from Railway env)
RUN bunx prisma generate

EXPOSE 3000

CMD ["bun", "run", "start"]

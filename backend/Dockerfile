FROM oven/bun:latest

WORKDIR /app

# Copy dependency files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Create uploads directory (required by staticPlugin)
RUN mkdir -p uploads

# Generate Prisma client
RUN bunx prisma generate

EXPOSE 3000

CMD ["bun", "run", "start"]

# Imagem reprodutível para rodar a suíte completa sem instalar deps locais.
# Build: docker build -t loomi-qa -f docker/Dockerfile .
# Run:   docker run --rm -v $(pwd)/reports:/app/reports loomi-qa npm run test:smoke

FROM mcr.microsoft.com/playwright:v1.50.0-jammy

WORKDIR /app

# Instala deps primeiro pra cache
COPY package*.json ./
COPY mcp-server/package*.json ./mcp-server/
RUN npm ci --no-audit --no-fund

# Copia o resto
COPY . .

# Build do MCP server
RUN npm run mcp:build

# Defaults — sobrescrever via docker run <args>
CMD ["npm", "run", "test:smoke"]

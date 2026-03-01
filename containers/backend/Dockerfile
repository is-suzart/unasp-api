# Estágio de Desenvolvimento (Hot-reload)
FROM oven/bun:latest AS development

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json bun.lock ./

# Instalar TODAS as dependências (necessário para o Nest CLI)
RUN bun install

# Copiar código fonte
COPY . .

# Comando para desenvolvimento com hot-reload
CMD ["bun", "run", "start:dev"]

# ---

# Estágio de Build
FROM oven/bun:latest AS builder

# Diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json bun.lock ./

# Instalar dependências (incluindo devDependencies para o build)
RUN bun install --frozen-lockfile

# Copiar código fonte
COPY . .

# Build da aplicação
RUN bun run build

# ---

# Estágio de Produção
FROM oven/bun:latest

WORKDIR /app

# Definir ambiente para produção
ENV NODE_ENV=production

# Copiar package.json e instalar apenas dependências de produção
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Copiar o build da etapa anterior
COPY --from=builder /app/dist ./dist

# Usuário não-root por segurança
USER bun

# Expor a porta da aplicação
EXPOSE 3000

# Comando de inicialização
CMD ["bun", "dist/main.js"]

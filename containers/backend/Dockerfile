# Estágio de Desenvolvimento (Hot-reload)
FROM node:20-alpine AS development

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar TODAS as dependências (necessário para o Nest CLI)
RUN npm install

# Copiar código fonte
COPY . .

# Comando para desenvolvimento com hot-reload
CMD ["npm", "run", "start:dev"]

# ---

# Estágio de Build
FROM node:20-alpine AS builder

# Diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências (incluindo devDependencies para o build)
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# ---

# Estágio de Produção
FROM node:20-alpine

WORKDIR /app

# Definir ambiente para produção
ENV NODE_ENV=production

# Copiar package.json e instalar apenas dependências de produção
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copiar o build da etapa anterior
COPY --from=builder /app/dist ./dist

# Usuário não-root por segurança
USER node

# Expor a porta da aplicação
EXPOSE 3000

# Comando de inicialização
CMD ["node", "dist/main"]

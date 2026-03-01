#!/bin/bash

# Script de setup do banco de dados UNASP API
# Uso: ./scripts/setup-db.sh [--with-seeds]
#
# Este script:
# 1. Cria o banco de dados (se não existir)
# 2. Habilita extensões necessárias (uuid-ossp)
# 3. Opcionalmente executa os seeds

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configurações do banco (podem ser sobrescritas por variáveis de ambiente)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USERNAME:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
DB_NAME="${DB_DATABASE:-unasp}"

WITH_SEEDS=false

# Parse argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        --with-seeds)
            WITH_SEEDS=true
            shift
            ;;
        --help)
            echo "Uso: $0 [--with-seeds]"
            echo ""
            echo "Opções:"
            echo "  --with-seeds    Executa os seeds após criar o banco"
            echo "  --help          Mostra esta ajuda"
            exit 0
            ;;
        *)
            echo "Opção desconhecida: $1"
            exit 1
            ;;
    esac
done

echo -e "${YELLOW}======================================${NC}"
echo -e "${YELLOW}  UNASP API - Database Setup${NC}"
echo -e "${YELLOW}======================================${NC}"
echo ""

# Função para executar comando SQL
execute_sql() {
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "$1" 2>/dev/null
}

# Verificar conexão com PostgreSQL
echo -e "${YELLOW}1. Verificando conexão com PostgreSQL...${NC}"
if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${RED}✗ Falha ao conectar no PostgreSQL em $DB_HOST:$DB_PORT${NC}"
    echo "  Verifique se o PostgreSQL está rodando"
    exit 1
fi
echo -e "${GREEN}✓ Conexão estabelecida${NC}"
echo ""

# Criar banco de dados
echo -e "${YELLOW}2. Criando banco de dados '$DB_NAME'...${NC}"
execute_sql "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME"
echo -e "${GREEN}✓ Banco de dados '$DB_NAME' pronto${NC}"
echo ""

# Habilitar extensão UUID
echo -e "${YELLOW}3. Habilitando extensão uuid-ossp...${NC}"
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\""
echo -e "${GREEN}✓ Extensão uuid-ossp habilitada${NC}"
echo ""

# Configurar timezone
echo -e "${YELLOW}4. Configurando timezone...${NC}"
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "ALTER DATABASE $DB_NAME SET timezone TO 'America/Sao_Paulo'"
echo -e "${GREEN}✓ Timezone configurado${NC}"
echo ""

# Verificar se tabelas existem (sincronização TypeORM)
echo -e "${YELLOW}5. Verificando tabelas (TypeORM synchronize)...${NC}"
echo -e "${GREEN}✓ TypeORM Irá criar as tabelas automaticamente ao iniciar a API${NC}"
echo ""

# Executar seeds se solicitado
if [ "$WITH_SEEDS" = true ]; then
    echo -e "${YELLOW}6. Executando seeds...${NC}"
    echo ""
    
    # Verificar se bun está instalado
    if ! command -v bun &> /dev/null; then
        echo -e "${RED}✗ Bun não está instalado${NC}"
        echo "  Execute: curl -fsSL https://bun.sh/install | bash"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Bun encontrado${NC}"
    echo ""
    
    # Instalar dependências se necessário
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}   Instalando dependências...${NC}"
        bun install
    fi
    
    # Executar seeds
    echo -e "${YELLOW}   Executando seed:users...${NC}"
    bun run seed:users
    
    echo -e "${YELLOW}   Executando seed:communities...${NC}"
    bun run seed:communities
    
    echo -e "${YELLOW}   Executando seed:pages...${NC}"
    bun run seed:pages
    
    echo ""
    echo -e "${GREEN}✓ Seeds executados com sucesso${NC}"
else
    echo -e "${YELLOW}6. Seeds (pulados)${NC}"
    echo -e "   Execute '$0 --with-seeds' para executar os seeds"
fi

echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  Setup concluído com sucesso! 🎉${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo "Próximos passos:"
echo "  1. Inicie o banco: docker-compose up -d unasp-api-db"
echo "  2. Inicie a API:  bun run start:dev"
echo "  3. Acesse:       http://localhost:3000/api"
echo ""

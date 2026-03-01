#!/bin/bash
# Script de entrypoint para o Docker
# Este script aguarda o banco de dados estar pronto e executa o setup

set -e

echo "========================================="
echo "🚀 Iniciando UNASP API"
echo "========================================="

# Variáveis de ambiente
DB_HOST=${DB_HOST:-unasp-api-db}
DB_PORT=${DB_PORT:-5432}
DB_DATABASE=${DB_DATABASE:-unasp}
MAX_RETRIES=30
RETRY_INTERVAL=2

echo "⏳ Aguardando banco de dados estar disponível..."

# Função para verificar se o banco de dados está pronto via TCP
wait_for_db() {
    local count=0
    while [ $count -lt $MAX_RETRIES ]; do
        # Tentar conexão TCP ao banco de dados
        if timeout 1 bash -c "cat < /dev/null > /dev/tcp/$DB_HOST/$DB_PORT" 2>/dev/null; then
            echo "✅ Banco de dados está disponível!"
            return 0
        fi
        count=$((count + 1))
        echo "   Tentativa $count/$MAX_RETRIES - Aguardando ${RETRY_INTERVAL}s..."
        sleep $RETRY_INTERVAL
    done
    
    echo "❌ Timeout esperando banco de dados"
    return 1
}

# Aguardar banco de dados
if ! wait_for_db; then
    echo "❌ Falha ao conectar ao banco de dados"
    exit 1
fi

# Pequena pausa adicional para garantir que o PostgreSQL esteja totalmente iniciado
sleep 2

# Executar setup do banco de dados
echo ""
echo "========================================="
echo "🔧 Executando setup do banco de dados"
echo "========================================="

# Verificar se é para fazer setup (apenas em desenvolvimento)
if [ "${NODE_ENV}" = "development" ] || [ -z "${NODE_ENV}" ]; then
    echo "📦 Executando bun run db:setup..."
    bun run db:setup
    SETUP_STATUS=$?
    
    if [ $SETUP_STATUS -ne 0 ]; then
        echo "⚠️  Setup do banco de dados retornou erro: $SETUP_STATUS"
        echo "   Continuando mesmo assim..."
    else
        echo "✅ Setup do banco de dados concluído com sucesso!"
    fi
else
    echo "⏭️  Setup ignorado (NODE_ENV=$NODE_ENV)"
fi

echo ""
echo "========================================="
echo "🌐 Iniciando aplicação"
echo "========================================="

# Executar o comando original (start:dev ou start:prod)
exec "$@"

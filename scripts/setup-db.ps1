# Script de setup do banco de dados UNASP API para Windows
# Uso: .\scripts\setup-db.ps1 [-WithSeeds]
#
# Este script:
# 1. Cria o banco de dados (se não existir)
# 2. Habilita extensões necessárias (uuid-ossp)
# 3. Opcionalmente executa os seeds

param(
    [switch]$WithSeeds
)

$ErrorActionPreference = "Stop"

# Cores para output (Windows Console)
function Write-Green { param($msg) Write-Host $msg -ForegroundColor Green }
function Write-Yellow { param($msg) Write-Host $msg -ForegroundColor Yellow }
function Write-Red { param($msg) Write-Host $msg -ForegroundColor Red }

# Configurações do banco
$DB_HOST = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$DB_PORT = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" }
$DB_USER = if ($env:DB_USERNAME) { $env:DB_USERNAME } else { "postgres" }
$DB_PASSWORD = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "postgres" }
$DB_NAME = if ($env:DB_DATABASE) { $env:DB_DATABASE } else { "unasp" }

Write-Host ""
Write-Yellow "======================================"
Write-Yellow "  UNASP API - Database Setup"
Write-Yellow "======================================"
Write-Host ""

# Verificar se psql está disponível
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    # Tentar caminho padrão do PostgreSQL
    $psqlPaths = @(
        "C:\Program Files\PostgreSQL\16\bin\psql.exe",
        "C:\Program Files\PostgreSQL\15\bin\psql.exe",
        "C:\Program Files\PostgreSQL\14\bin\psql.exe"
    )
    foreach ($path in $psqlPaths) {
        if (Test-Path $path) {
            $psqlPath = $path
            break
        }
    }
}

if (-not $psqlPath) {
    Write-Red "✗ PostgreSQL client (psql) não encontrado"
    Write-Host "  Instale o PostgreSQL ou adicione ao PATH"
    exit 1
}

$psql = $psqlPath
if ($psql -is [System.Management.Automation.CommandInfo]) {
    $psql = $psql.Source
}

# Função para executar SQL
function Invoke-Sql {
    param($sql)
    $env:PGPASSWORD = $DB_PASSWORD
    & $psql -h $DB_PORT -p $DB_PORT -U $DB_USER -d postgres -c $sql 2>$null
    $env:PGPASSWORD = $null
}

# 1. Verificar conexão
Write-Yellow "1. Verificando conexão com PostgreSQL..."
$env:PGPASSWORD = $DB_PASSWORD
$test = & $psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "SELECT 1" 2>$null
$env:PGPASSWORD = $null

if ($LASTEXITCODE -ne 0) {
    Write-Red "✗ Falha ao conectar no PostgreSQL em $DB_HOST`:$DB_PORT"
    Write-Host "  Verifique se o PostgreSQL está rodando"
    exit 1
}
Write-Green "✓ Conexão estabelecida"
Write-Host ""

# 2. Criar banco de dados
Write-Yellow "2. Criando banco de dados '$DB_NAME'..."
$checkDb = & $psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -t -c "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" 2>$null
if ($checkDb -notmatch "1") {
    & $psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME" 2>$null
}
Write-Green "✓ Banco de dados '$DB_NAME' pronto"
Write-Host ""

# 3. Habilitar extensão UUID
Write-Yellow "3. Habilitando extensão uuid-ossp..."
$env:PGPASSWORD = $DB_PASSWORD
& $psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"' 2>$null
$env:PGPASSWORD = $null
Write-Green "✓ Extensão uuid-ossp habilitada"
Write-Host ""

# 4. Configurar timezone
Write-Yellow "4. Configurando timezone..."
$env:PGPASSWORD = $DB_PASSWORD
& $psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "ALTER DATABASE $DB_NAME SET timezone TO 'America/Sao_Paulo'" 2>$null
$env:PGPASSWORD = $null
Write-Green "✓ Timezone configurado"
Write-Host ""

# 5. TypeORM
Write-Yellow "5. Verificando tabelas (TypeORM synchronize)..."
Write-Green "✓ TypeORM Irá criar as tabelas automaticamente ao iniciar a API"
Write-Host ""

# 6. Seeds
if ($WithSeeds) {
    Write-Yellow "6. Executando seeds..."
    Write-Host ""

    # Verificar bun
    $bun = Get-Command bun -ErrorAction SilentlyContinue
    if (-not $bun) {
        Write-Red "✗ Bun não está instalado"
        Write-Host "  Execute: iwr bun.sh/install.ps1 | iex"
        exit 1
    }
    Write-Green "✓ Bun encontrado"
    Write-Host ""

    # Instalar dependências se necessário
    if (-not (Test-Path "node_modules")) {
        Write-Yellow "   Instalando dependências..."
        & bun install
    }

    Write-Yellow "   Executando seed:users..."
    & bun run seed:users

    Write-Yellow "   Executando seed:communities..."
    & bun run seed:communities

    Write-Yellow "   Executando seed:pages..."
    & bun run seed:pages

    Write-Host ""
    Write-Green "✓ Seeds executados com sucesso"
} else {
    Write-Yellow "6. Seeds (pulados)"
    Write-Host "   Execute '.\scripts\setup-db.ps1 -WithSeeds' para executar os seeds"
}

Write-Host ""
Write-Green "======================================"
Write-Green "  Setup concluído com sucesso! 🎉"
Write-Green "======================================"
Write-Host ""
Write-Host "Próximos passos:"
Write-Host "  1. Inicie o banco: docker-compose up -d unasp-api-db"
Write-Host "  2. Inicie a API:  bun run start:dev"
Write-Host "  3. Acesse:       http://localhost:3000/api"
Write-Host ""

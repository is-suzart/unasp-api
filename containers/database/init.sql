-- Script de inicialização do banco de dados UNASP
-- Este script é executado automaticamente pelo PostgreSQL ao criar o banco

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tablespace para dados (opcional, para melhor organização)
-- CREATE TABLESPACE unasp_tablespace LOCATION '/var/lib/postgresql/data';

-- Criar schema para a aplicação
CREATE SCHEMA IF NOT EXISTS public;

-- Configurações de segurança
ALTER DATABASE unasp SET timezone TO 'America/Sao_Paulo';

-- Comentário para documentar
COMMENT ON DATABASE unasp IS 'Banco de dados principal da API UNASP';
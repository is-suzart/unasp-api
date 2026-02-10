# 🚀 Guia de Início Rápido - API UNASP

> **Para começar a desenvolver rapidamente!** ⚡  
> Exemplos práticos de como usar a API.

![Bocchi Coding Fast](https://media.tenor.com/4JoASmF_NKAAAAAC/bocchi-the-rock.gif)

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter:

- ✅ Node.js 18+ instalado
- ✅ PostgreSQL rodando
- ✅ Yarn instalado (`npm install -g yarn`)

---

## 🏁 Setup Inicial

### 1. Instalar Dependências

```bash
cd api
yarn install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=unasp_db

# JWT
JWT_SECRET=seu-secret-super-seguro-aqui
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development
```

### 3. Criar o Banco de Dados

```bash
# Conecte ao PostgreSQL
psql -U postgres

# Crie o banco
CREATE DATABASE unasp_db;

# Habilite a extensão UUID
\c unasp_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### 4. Rodar as Migrations

```bash
yarn typeorm migration:run
```

### 5. Iniciar o Servidor

```bash
yarn start:dev
```

A API estará rodando em `http://localhost:3000` 🎉

---

## 📡 Testando a API

### Swagger UI

Acesse a documentação interativa em:
```
http://localhost:3000/api
```

---

## 🔐 Autenticação

### 1. Registrar um Novo Usuário

**Endpoint:** `POST /auth/register`

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@unasp.com",
    "password": "senha123456",
    "communityId": "uuid-da-comunidade",
    "position": "Aluno"
  }'
```

**Resposta:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "João Silva",
  "email": "joao@unasp.com",
  "admin": false,
  "communityId": "uuid-da-comunidade",
  "position": "Aluno",
  "image": null
}
```

### 2. Fazer Login

**Endpoint:** `POST /auth/login`

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@unasp.com",
    "password": "senha123456"
  }'
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "João Silva",
    "email": "joao@unasp.com",
    "admin": false
  }
}
```

**💡 Dica:** Salve o `access_token` para usar nas próximas requisições!

---

## 🏘️ Gerenciando Comunidades

### 1. Criar uma Comunidade

**Endpoint:** `POST /communities`  
**Auth:** ✅ Requer token de admin

```bash
curl -X POST http://localhost:3000/communities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "Ministério de Recepção",
    "route": "recepcao",
    "type": "ministerios",
    "logoUrl": "https://cdn.unasp.com/logos/recepcao.png",
    "menu": {
      "logo": "https://cdn.unasp.com/logos/recepcao.png",
      "items": [
        {
          "text": "Início",
          "url": "/recepcao",
          "icon": "home"
        },
        {
          "text": "Sobre",
          "url": "/recepcao/sobre"
        }
      ],
      "buttons": [
        {
          "text": "Contato",
          "url": "/recepcao/contato",
          "style": "filled",
          "color": "primary"
        }
      ]
    },
    "visuals": [
      {
        "type": "section",
        "title": "Bem-vindo!",
        "subtitle": "Ministério de Recepção",
        "text": "Estamos felizes em receber você!",
        "backgroundColor": "#7BE8C0",
        "alignment": "center",
        "order": 1,
        "buttons": [
          {
            "text": "Saiba Mais",
            "url": "/recepcao/sobre",
            "style": "filled",
            "color": "primary"
          }
        ]
      }
    ]
  }'
```

### 2. Listar Todas as Comunidades

**Endpoint:** `GET /communities`  
**Auth:** ❌ Público

```bash
curl http://localhost:3000/communities
```

**Resposta:**
```json
[
  {
    "id": "uuid-1",
    "name": "Ministério de Recepção",
    "route": "recepcao",
    "type": "ministerios",
    "logoUrl": "https://cdn.unasp.com/logos/recepcao.png",
    "isActive": true,
    "menu": { ... },
    "visuals": [ ... ]
  },
  {
    "id": "uuid-2",
    "name": "Ministério de Louvor",
    "route": "louvor",
    "type": "ministerios",
    "logoUrl": "https://cdn.unasp.com/logos/louvor.png",
    "isActive": true,
    "menu": { ... },
    "visuals": [ ... ]
  }
]
```

### 3. Buscar Comunidade por Slug

**Endpoint:** `GET /communities/slug/:route`  
**Auth:** ❌ Público

```bash
curl http://localhost:3000/communities/slug/recepcao
```

### 4. Atualizar Comunidade

**Endpoint:** `PATCH /communities/:id`  
**Auth:** ✅ Requer token de admin

```bash
curl -X PATCH http://localhost:3000/communities/uuid-da-comunidade \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "Ministério de Recepção - Atualizado",
    "isActive": true
  }'
```

---

## 📄 Gerenciando Páginas

### 1. Criar uma Página

**Endpoint:** `POST /pages`  
**Auth:** ✅ Requer token

```bash
curl -X POST http://localhost:3000/pages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "Sobre Nós",
    "route": "sobre",
    "communityId": "uuid-da-comunidade",
    "menu": {
      "logo": "https://cdn.unasp.com/logos/recepcao.png",
      "items": [
        {
          "text": "Voltar",
          "url": "/recepcao"
        }
      ],
      "buttons": []
    },
    "visuals": [
      {
        "type": "section",
        "title": "Sobre o Ministério",
        "subtitle": "Nossa História",
        "text": "Conheça mais sobre nós...",
        "alignment": "left",
        "order": 1,
        "buttons": []
      }
    ]
  }'
```

### 2. Listar Páginas de uma Comunidade

**Endpoint:** `GET /communities/:communityId/pages`  
**Auth:** ❌ Público

```bash
curl http://localhost:3000/communities/uuid-da-comunidade/pages
```

---

## 📝 Gerenciando Blog

### 1. Criar uma Postagem

**Endpoint:** `POST /blogs`  
**Auth:** ✅ Requer token

```bash
curl -X POST http://localhost:3000/blogs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "title": "Bem-vindo ao Ministério!",
    "route": "bem-vindo",
    "content": "<h1>Bem-vindo!</h1><p>Esta é nossa primeira postagem...</p>"
  }'
```

**💡 Nota:** O `authorId` é extraído automaticamente do token JWT!

### 2. Listar Todos os Blogs

**Endpoint:** `GET /blogs`  
**Auth:** ❌ Público

```bash
curl http://localhost:3000/blogs
```

### 3. Buscar Blog por Slug

**Endpoint:** `GET /blogs/slug/:route`  
**Auth:** ❌ Público

```bash
curl http://localhost:3000/blogs/slug/bem-vindo
```

**Resposta:**
```json
{
  "id": "uuid-do-blog",
  "title": "Bem-vindo ao Ministério!",
  "route": "bem-vindo",
  "content": "<h1>Bem-vindo!</h1><p>Esta é nossa primeira postagem...</p>",
  "author": {
    "id": "uuid-do-autor",
    "name": "João Silva",
    "email": "joao@unasp.com",
    "position": "Aluno"
  },
  "createdAt": "2024-02-09T12:00:00Z",
  "updatedAt": "2024-02-09T12:00:00Z"
}
```

### 4. Atualizar Blog

**Endpoint:** `PATCH /blogs/:id`  
**Auth:** ✅ Requer token (autor ou admin)

```bash
curl -X PATCH http://localhost:3000/blogs/uuid-do-blog \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "title": "Bem-vindo ao Ministério! (Atualizado)",
    "content": "<h1>Bem-vindo!</h1><p>Conteúdo atualizado...</p>"
  }'
```

### 5. Deletar Blog

**Endpoint:** `DELETE /blogs/:id`  
**Auth:** ✅ Requer token (autor ou admin)

```bash
curl -X DELETE http://localhost:3000/blogs/uuid-do-blog \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 👤 Gerenciando Usuários

### 1. Listar Todos os Usuários

**Endpoint:** `GET /users`  
**Auth:** ✅ Requer token de admin

```bash
curl http://localhost:3000/users \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN"
```

### 2. Buscar Usuário por ID

**Endpoint:** `GET /users/:id`  
**Auth:** ✅ Requer token

```bash
curl http://localhost:3000/users/uuid-do-usuario \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 3. Atualizar Usuário

**Endpoint:** `PATCH /users/:id`  
**Auth:** ✅ Requer token (próprio usuário ou admin)

```bash
curl -X PATCH http://localhost:3000/users/uuid-do-usuario \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "João Silva Santos",
    "position": "Professor",
    "image": "https://cdn.unasp.com/avatars/joao.jpg"
  }'
```

### 4. Listar Usuários de uma Comunidade

**Endpoint:** `GET /users/community/:communityId`  
**Auth:** ✅ Requer token

```bash
curl http://localhost:3000/users/community/uuid-da-comunidade \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 🧪 Testando com Postman/Insomnia

### Coleção de Exemplo

Crie uma coleção com as seguintes variáveis de ambiente:

```json
{
  "base_url": "http://localhost:3000",
  "token": "",
  "community_id": "",
  "user_id": ""
}
```

### Workflow Típico:

1. **Registrar** → Salvar `user_id`
2. **Login** → Salvar `token`
3. **Criar Comunidade** (como admin) → Salvar `community_id`
4. **Criar Página** usando `community_id`
5. **Criar Blog** (autor automático via token)

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"

**Solução:**
```bash
# Verifique se o PostgreSQL está rodando
sudo systemctl status postgresql

# Ou com Docker:
docker ps | grep postgres
```

### Erro: "JWT token is invalid"

**Solução:**
- Verifique se o token está no formato: `Bearer SEU_TOKEN`
- Verifique se o token não expirou (padrão: 7 dias)
- Faça login novamente para obter um novo token

### Erro: "Route already exists"

**Solução:**
- Cada `route` (slug) deve ser único
- Use nomes diferentes como: `recepcao-2`, `recepcao-sp`, etc.

---

## 📚 Próximos Passos

1. ✅ Leia a [Documentação Completa da Arquitetura](./ARCHITECTURE.md)
2. ✅ Explore a [Documentação Swagger](http://localhost:3000/api)
3. ✅ Implemente os módulos `Page` e `Blog` seguindo o padrão
4. ✅ Escreva testes unitários para seus Use Cases
5. ✅ Configure CI/CD para deploy automático

---

## 🎯 Dicas Importantes

### 🔒 Segurança

- **NUNCA** commite o arquivo `.env`
- **SEMPRE** use HTTPS em produção
- **SEMPRE** valide inputs com DTOs
- **SEMPRE** hasheie senhas com bcrypt

### 🚀 Performance

- Use índices no banco para campos `route`, `email`
- Implemente cache com Redis para queries frequentes
- Use paginação em listas grandes

### 📝 Código Limpo

- Siga o padrão de Clean Architecture
- Escreva testes para cada Use Case
- Use nomes descritivos para variáveis e funções
- Documente funções complexas

---

**Feito com 💜 e NestJS! Bora codar!** 🚀

![Bocchi Excited](https://media.tenor.com/Gg0JCOlgCxgAAAAC/bocchi-the-rock-hitori-gotoh.gif)

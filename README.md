# 🔮 UNASP API 🔮

Olá! Bem-vindo(a) ao backend do **UNASP Portal**! (≧◡≦)
Aqui é onde a mágica acontece, processando dados e garantindo que tudo funcione perfeitamente! ✨

![Bocchi Coding](https://media.tenor.com/_Nl-tI3pMQAAAAAi/bocchi-the-rock-hitori-gotoh.gif)

---

## 🏛️ Arquitetura: Clean Architecture

Nossa API foi desenhada para ser robusta, testável e escalável, seguindo os princípios da **Clean Architecture**! 🛡️

> 📖 **[Leia a documentação completa da arquitetura →](./ARCHITECTURE.md)**  
> Tudo sobre modelos, relacionamentos, endpoints e boas práticas!

### 🧩 Estrutura de Módulos

Tudo é organizadinho em módulos (ex: `auth`, `community`). Cada módulo é independente e tem suas próprias camadas:

1.  **Domain**: Entidades e regras de negócio. O núcleo puro! ❤️
2.  **Application**: Casos de uso (`Use Cases`) que orquestram a lógica. 🧠
3.  **Infrastructure**: Implementações concretas (Banco de dados, APIs externas). 🏗️
4.  **Presentation**: Controllers que cuidam das requisições HTTP. 📡

### 🛠️ Tecnologias

- **Bun** 🥟: Runtime JavaScript/TypeScript ultrarrápido.
- **NestJS** 🦁: Framework poderoso para aplicações server-side.
- **TypeORM** 🗺️: Nosso mapa para navegar no banco de dados.
- **PostgreSQL** 🐘: Onde guardamos nossos tesouros (dados).
- **Passport & JWT** 🛂: Segurança máxima! Ninguém passa sem crachá.
- **Scalar** 📜: Documentação interativa e moderna da API (porque ninguém merece adivinhar rotas).

---

## 📚 Documentação

Temos documentação completa para você começar! 🎉

### 📖 Guias Disponíveis

1. **[🏗️ ARCHITECTURE.md](./ARCHITECTURE.md)** - Documentação Completa da Arquitetura
   - Modelos de dados detalhados
   - Relacionamentos entre entidades
   - Estrutura de diretórios
   - Fluxo de dados
   - Endpoints da API
   - Boas práticas

2. **[🚀 QUICKSTART.md](./QUICKSTART.md)** - Guia de Início Rápido
   - Setup inicial passo a passo
   - Exemplos de requisições
   - Testes com curl/Postman
   - Troubleshooting

3. **[✅ IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md)** - Checklist de Implementação
   - Guia passo a passo para implementar módulos Page e Blog
   - Estrutura de cada camada da Clean Architecture
   - Testes e validações
   - Ordem recomendada de implementação

4. **[💻 CODE_EXAMPLES.md](./CODE_EXAMPLES.md)** - Exemplos de Código
   - Templates prontos para copiar e adaptar
   - Exemplos completos de todas as camadas
   - DTOs, Controllers, Use Cases, Repositories
   - Testes unitários e E2E

5. **[📡 Scalar API Reference](http://localhost:3000/api)** - Documentação Interativa
   - Interface moderna com cliente HTTP integrado
   - Teste os endpoints diretamente no navegador
   - (Disponível após rodar a API)

---

## 🚀 Como Rodar

### Pré-requisitos

- [Bun](https://bun.sh) instalado (v1.0+)
- Docker e Docker Compose (para o banco de dados)

### 1. Instale as dependências

```bash
bun install
```

### 2. Suba o banco de dados (com Docker)

```bash
docker-compose up -d unasp-api-db
```

### 3. Rode a API

```bash
bun run start:dev
```

### 4. Ou rode tudo com Docker Compose

```bash
docker-compose up
```

A API estará disponível em `http://localhost:3000` e a documentação Scalar em `http://localhost:3000/api` 🎉

---

### 🌱 Seeds (Dados de Teste)

```bash
bun run seed:users
bun run seed:communities
bun run seed:pages
```

### 🧪 Testes

```bash
bun test              # Rodar todos os testes
bun test --watch      # Modo watch
bun test --coverage   # Com cobertura
```

---

_Feito com muito café e NestJS!_ ☕

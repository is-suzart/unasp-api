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
-   **NestJS** 🦁: Framework poderoso para Node.js.
-   **TypeORM** 🗺️: Nosso mapa para navegar no banco de dados.
-   **PostgreSQL** 🐘: Onde guardamos nossos tesouros (dados).
-   **Passport & JWT** 🛂: Segurança máxima! Ninguém passa sem crachá.
-   **Swagger** 📜: Documentação automática da API (porque ninguém merece adivinhar rotas).

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

5. **[📡 Swagger UI](http://localhost:3000/api)** - Documentação Interativa
   - Teste os endpoints diretamente no navegador
   - (Disponível após rodar a API)

---

## 🚀 Como Rodar

1.  **Instale as dependências**:
    ```bash
    yarn install
    ```

2.  **Suba o banco de dados** (se tiver Docker):
    ```bash
    docker-compose up -d
    ```

3.  **Rode a API**:
    ```bash
    yarn start:dev
    ```

---

*Feito com muito café e NestJS!* ☕

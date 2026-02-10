# 🏗️ Arquitetura da API UNASP

> **Para o desenvolvedor que vai implementar a API** 🚀  
> Este documento contém TUDO que você precisa saber sobre os modelos, arquitetura e estrutura do projeto!

![Bocchi Studying](https://media.tenor.com/4JoASmF_NKAAAAAC/bocchi-the-rock.gif)

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Arquitetura Clean Architecture](#-arquitetura-clean-architecture)
3. [Modelos de Dados (Entities)](#-modelos-de-dados-entities)
4. [Relacionamentos entre Entidades](#-relacionamentos-entre-entidades)
5. [Estrutura de Diretórios](#-estrutura-de-diretórios)
6. [Fluxo de Dados](#-fluxo-de-dados)
7. [Endpoints da API](#-endpoints-da-api)
8. [Autenticação e Autorização](#-autenticação-e-autorização)
9. [Boas Práticas](#-boas-práticas)

---

## 🎯 Visão Geral

O **UNASP Portal** é uma plataforma multi-comunidades onde cada comunidade (ministério, departamento, etc.) pode ter:
- **Páginas personalizadas** com conteúdo dinâmico
- **Blog** para publicações
- **Usuários** com diferentes níveis de acesso
- **Menu e visuais customizáveis**

### Stack Tecnológica

```
┌─────────────────────────────────────┐
│         Frontend (Flutter)          │
│  - Portal (App Principal)           │
│  - Atomic (Design System)           │
│  - Entities (Modelos Compartilhados)│
└─────────────────────────────────────┘
                 ↕️ REST API
┌─────────────────────────────────────┐
│         Backend (NestJS)            │
│  - Clean Architecture               │
│  - TypeORM                          │
│  - PostgreSQL                       │
│  - JWT Authentication               │
└─────────────────────────────────────┘
```

---

## 🏛️ Arquitetura: Clean Architecture

A API segue os princípios da **Clean Architecture**, garantindo:
- ✅ **Testabilidade**: Cada camada pode ser testada isoladamente
- ✅ **Manutenibilidade**: Código organizado e fácil de entender
- ✅ **Escalabilidade**: Fácil adicionar novos módulos
- ✅ **Independência de frameworks**: A lógica de negócio não depende do NestJS

### 📦 Camadas da Arquitetura

```
┌──────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                     │
│  Controllers (HTTP) - Recebem requisições e retornam     │
│  respostas. Validam entrada usando DTOs.                 │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                       │
│  Use Cases - Orquestram a lógica de negócio.            │
│  Ex: CreateCommunityUseCase, GetUserByIdUseCase          │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│                     DOMAIN LAYER                          │
│  Entities - Regras de negócio puras (sem dependências)   │
│  Interfaces - Contratos para repositórios                │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│                 INFRASTRUCTURE LAYER                      │
│  Repositories - Implementação com TypeORM                │
│  ORM Entities - Mapeamento para banco de dados           │
│  External Services - APIs externas, S3, etc.             │
└──────────────────────────────────────────────────────────┘
```

### 📊 Diagrama Visual da Arquitetura

![Diagrama de Arquitetura](../../../.gemini/antigravity/brain/2e197a4b-dd89-4c45-b2dd-76707eb2d57e/api_architecture_diagram_1770683983400.png)

> Este diagrama mostra como as camadas se comunicam e como os módulos são organizados.

---

## 📊 Modelos de Dados (Entities)

### 1️⃣ **User** (Usuário)

Representa um usuário do sistema (aluno, professor, administrador).

```typescript
class UserEntity {
  id: string;              // UUID
  name: string;            // Nome completo
  email: string;           // Email único
  password: string;        // Hash bcrypt
  admin: boolean;          // Se é administrador global
  communityId: string;     // FK para Community
  position: string;        // Cargo/posição (ex: "Aluno", "Professor")
  image?: string;          // URL da foto de perfil (opcional)
  
  // Relacionamentos
  community: CommunityEntity;
  blogs: BlogEntity[];     // Blogs que o usuário escreveu
}
```

**Regras de Negócio:**
- Email deve ser único no sistema
- Password deve ser hasheado com bcrypt (nunca armazenar em texto puro!)
- Admin = true permite acesso total ao sistema
- Cada usuário pertence a UMA comunidade

---

### 2️⃣ **Community** (Comunidade/Ministério)

Representa uma comunidade (ministério, departamento, etc.).

```typescript
enum CommunityType {
  ministerios = 'ministerios',
  other = 'other'
}

class CommunityEntity extends BasePageEntity {
  // Herdados de BasePageEntity:
  id: string;              // UUID
  name: string;            // Nome da comunidade
  route: string;           // Slug/rota (ex: "recepcao")
  menu: MenuEntity;        // Menu de navegação
  visuals: VisualComponent[]; // Cards e seções visuais
  
  // Específicos de Community:
  type: CommunityType;     // Tipo da comunidade
  logoUrl: string;         // URL do logo
  isActive: boolean;       // Se está ativa
  
  // Relacionamentos
  users: UserEntity[];     // Usuários da comunidade
  pages: PageEntity[];     // Páginas da comunidade
}
```

**Regras de Negócio:**
- `route` (slug) deve ser único e URL-friendly (ex: "recepcao", "ministerio-louvor")
- `isActive = false` oculta a comunidade do sistema
- Cada comunidade tem seu próprio menu e visuais customizáveis

---

### 3️⃣ **Page** (Página)

Representa uma página dentro de uma comunidade.

```typescript
class PageEntity extends BasePageEntity {
  // Herdados de BasePageEntity:
  id: string;
  name: string;            // Nome da página
  route: string;           // Rota relativa (ex: "sobre")
  menu: MenuEntity;        // Menu específico da página
  visuals: VisualComponent[]; // Conteúdo visual
  
  // Específicos de Page:
  communityId: string;     // FK para Community
  
  // Relacionamentos
  community: CommunityEntity;
}
```

**Exemplo de Uso:**
- Comunidade "Recepção" (`/recepcao`)
  - Página "Sobre" (`/recepcao/sobre`)
  - Página "Contato" (`/recepcao/contato`)

---

### 4️⃣ **Blog** (Postagem de Blog)

Representa uma postagem de blog.

```typescript
class BlogEntity {
  id: string;              // UUID
  title: string;           // Título da postagem
  route: string;           // Slug (ex: "bem-vindo-ao-ministerio")
  content: string;         // Conteúdo (HTML ou JSON Delta)
  authorId: string;        // FK para User
  
  // Relacionamentos
  author: UserEntity;      // Autor da postagem
}
```

**Formato do Content:**
- Pode ser **HTML** ou **JSON Delta** (formato do Quill/rich text editor)
- Exemplo JSON Delta:
```json
{
  "ops": [
    {"insert": "Bem-vindo ao nosso blog!\n", "attributes": {"bold": true}},
    {"insert": "Este é o primeiro post...\n"}
  ]
}
```

---

### 5️⃣ **BasePageEntity** (Classe Base)

Classe abstrata que compartilha estrutura entre `Community` e `Page`.

```typescript
abstract class BasePageEntity {
  id: string;
  name: string;
  route: string;
  type?: string;           // Opcional em Page, obrigatório em Community
  menu: MenuEntity;
  visuals: VisualComponent[];
}
```

---

### 6️⃣ **MenuEntity** (Menu de Navegação)

Define o menu de navegação de uma página ou comunidade.

```typescript
class MenuEntity {
  logo: string;            // URL do logo principal
  logoIcon?: string;       // URL do ícone (versão pequena)
  items: MenuItemEntity[]; // Itens do menu
  buttons: ButtonEntity[]; // Botões de ação (ex: "Login", "Cadastre-se")
}

class MenuItemEntity {
  text: string;            // Texto do link
  url: string;             // URL de destino
  icon?: string;           // Ícone opcional
}
```

**Exemplo JSON:**
```json
{
  "logo": "https://cdn.unasp.com/logo.png",
  "logoIcon": "https://cdn.unasp.com/icon.png",
  "items": [
    {"text": "Início", "url": "/", "icon": "home"},
    {"text": "Sobre", "url": "/sobre"},
    {"text": "Contato", "url": "/contato"}
  ],
  "buttons": [
    {"text": "Login", "url": "/login", "style": "outlined", "color": "primary"}
  ]
}
```

---

### 7️⃣ **VisualComponent** (Componentes Visuais)

Representa seções visuais (cards, banners, etc.).

```typescript
enum VisualAlignment {
  left = 'left',
  center = 'center',
  right = 'right'
}

abstract class VisualComponent {
  title: string;
  subtitle: string;
  text?: string;
  backgroundColor?: string;  // Hex color
  backgroundImage?: string;  // URL
  buttons: ButtonEntity[];
  alignment: VisualAlignment;
  order: number;             // Ordem de exibição
}

// Tipos específicos:
class CardEntity extends VisualComponent {}
class SectionEntity extends VisualComponent {}
```

**Exemplo de Card:**
```json
{
  "type": "card",
  "title": "Bem-vindo!",
  "subtitle": "Ministério de Recepção",
  "text": "Estamos felizes em ter você aqui.",
  "backgroundColor": "#7BE8C0",
  "buttons": [
    {"text": "Saiba Mais", "url": "/sobre", "style": "filled", "color": "primary"}
  ],
  "alignment": "center",
  "order": 1
}
```

---

### 8️⃣ **ButtonEntity** (Botão de Ação)

```typescript
enum AppButtonStyle {
  filled = 'filled',
  outlined = 'outlined'
}

enum AppButtonColor {
  primary = 'primary',
  secondary = 'secondary',
  danger = 'danger',
  mint = 'mint',
  sunflower = 'sunflower',
  // ... outras cores do design system
}

class ButtonEntity {
  text: string;
  url: string;
  icon?: string;
  style: AppButtonStyle;
  color: AppButtonColor;
}
```

---

### 9️⃣ **PageBlock** (Blocos de Conteúdo Dinâmico)

Sistema de layout flexível para páginas.

```typescript
enum LayoutType {
  grid = 'grid',    // Grade responsiva
  flex = 'flex',    // Linha horizontal
  list = 'list'     // Coluna vertical
}

enum GapSize {
  none = 'none',
  sm = 'sm',        // 8px
  md = 'md',        // 16px
  lg = 'lg',        // 24px
  xl = 'xl'         // 32px
}

class PageBlockProps {
  layout?: LayoutType;
  columns?: number;         // Para layout grid
  gap?: GapSize;
  title?: string;
  description?: string;
  variant?: string;         // 'primary', 'secondary', 'outlined'
  imageUrl?: string;
  extras: Record<string, any>; // Propriedades customizadas
}

class PageBlock {
  id?: string;
  type: string;             // Tipo do componente (ex: 'hero', 'gallery', 'text')
  props: PageBlockProps;
  children: PageBlock[];    // Blocos aninhados
}
```

**Exemplo de Estrutura de Página:**
```json
{
  "type": "section",
  "props": {
    "layout": "list",
    "gap": "lg"
  },
  "children": [
    {
      "type": "hero",
      "props": {
        "title": "Bem-vindo ao Ministério",
        "imageUrl": "https://cdn.unasp.com/hero.jpg"
      }
    },
    {
      "type": "grid",
      "props": {
        "layout": "grid",
        "columns": 3,
        "gap": "md"
      },
      "children": [
        {"type": "card", "props": {"title": "Card 1"}},
        {"type": "card", "props": {"title": "Card 2"}},
        {"type": "card", "props": {"title": "Card 3"}}
      ]
    }
  ]
}
```

---

## 🔗 Relacionamentos entre Entidades

```
┌─────────────────┐
│   Community     │
│  (Comunidade)   │
└────────┬────────┘
         │ 1
         │
         │ N
    ┌────┴─────┬──────────┐
    │          │          │
    ↓          ↓          ↓
┌───────┐  ┌──────┐  ┌──────┐
│ User  │  │ Page │  │ Blog │
└───┬───┘  └──────┘  └───┬──┘
    │                    │
    └────────────────────┘
         1 author N
```

### 📊 Diagrama Visual de Relacionamentos

![Diagrama de Relacionamentos](../../../.gemini/antigravity/brain/2e197a4b-dd89-4c45-b2dd-76707eb2d57e/entity_relationship_diagram_1770684014351.png)

> Este diagrama mostra as tabelas do banco de dados e seus relacionamentos.

### Relacionamentos Detalhados:

1. **Community → User** (1:N)
   - Uma comunidade tem MUITOS usuários
   - Um usuário pertence a UMA comunidade

2. **Community → Page** (1:N)
   - Uma comunidade tem MUITAS páginas
   - Uma página pertence a UMA comunidade

3. **User → Blog** (1:N)
   - Um usuário pode escrever MUITOS blogs
   - Um blog tem UM autor

---

## 📁 Estrutura de Diretórios

```
api/
├── src/
│   ├── modules/
│   │   ├── auth/                    # Módulo de autenticação
│   │   │   ├── application/
│   │   │   │   └── use-cases/
│   │   │   │       ├── login.use-case.ts
│   │   │   │       └── register.use-case.ts
│   │   │   ├── presentation/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   └── dto/
│   │   │   │       ├── login.dto.ts
│   │   │   │       └── register.dto.ts
│   │   │   └── auth.module.ts
│   │   │
│   │   ├── user/                    # Módulo de usuários
│   │   │   ├── domain/
│   │   │   │   ├── user.entity.ts   # Entidade de domínio
│   │   │   │   └── user.repository.interface.ts
│   │   │   ├── application/
│   │   │   │   └── use-cases/
│   │   │   │       ├── create-user.use-case.ts
│   │   │   │       ├── get-user-by-id.use-case.ts
│   │   │   │       └── update-user.use-case.ts
│   │   │   ├── infrastructure/
│   │   │   │   ├── persistence/
│   │   │   │   │   ├── user.orm-entity.ts  # TypeORM entity
│   │   │   │   │   └── user.repository.ts
│   │   │   │   └── user.mapper.ts
│   │   │   ├── presentation/
│   │   │   │   ├── user.controller.ts
│   │   │   │   └── dto/
│   │   │   │       ├── create-user.dto.ts
│   │   │   │       └── update-user.dto.ts
│   │   │   └── user.module.ts
│   │   │
│   │   ├── community/               # Módulo de comunidades
│   │   │   ├── domain/
│   │   │   │   ├── community.entity.ts
│   │   │   │   ├── menu.entity.ts
│   │   │   │   ├── visual-component.entity.ts
│   │   │   │   └── community.repository.interface.ts
│   │   │   ├── application/
│   │   │   │   └── use-cases/
│   │   │   │       ├── create-community.use-case.ts
│   │   │   │       ├── get-all-communities.use-case.ts
│   │   │   │       └── update-community.use-case.ts
│   │   │   ├── infrastructure/
│   │   │   │   ├── persistence/
│   │   │   │   │   ├── community.orm-entity.ts
│   │   │   │   │   └── community.repository.ts
│   │   │   │   └── community.mapper.ts
│   │   │   ├── presentation/
│   │   │   │   ├── community.controller.ts
│   │   │   │   └── dto/
│   │   │   │       ├── create-community.dto.ts
│   │   │   │       └── update-community.dto.ts
│   │   │   └── community.module.ts
│   │   │
│   │   ├── page/                    # Módulo de páginas (A IMPLEMENTAR)
│   │   │   └── ... (mesma estrutura)
│   │   │
│   │   └── blog/                    # Módulo de blog (A IMPLEMENTAR)
│   │       └── ... (mesma estrutura)
│   │
│   ├── common/                      # Código compartilhado
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   └── interceptors/
│   │
│   ├── app.module.ts
│   └── main.ts
│
├── package.json
└── tsconfig.json
```

---

## 🔄 Fluxo de Dados

### Exemplo: Criar uma Comunidade

```
1. Cliente faz POST /communities
   ↓
2. CommunityController recebe a requisição
   ↓
3. Valida o CreateCommunityDto
   ↓
4. Chama CreateCommunityUseCase
   ↓
5. Use Case valida regras de negócio
   ↓
6. Use Case chama CommunityRepository.save()
   ↓
7. Repository persiste no banco via TypeORM
   ↓
8. Retorna a entidade criada
   ↓
9. Controller retorna HTTP 201 com a comunidade
```

### Código Exemplo:

**1. DTO (Data Transfer Object)**
```typescript
// create-community.dto.ts
export class CreateCommunityDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  route: string;

  @IsEnum(CommunityType)
  type: CommunityType;

  @IsString()
  logoUrl: string;

  @ValidateNested()
  @Type(() => MenuDto)
  menu: MenuDto;

  @ValidateNested({ each: true })
  @Type(() => VisualComponentDto)
  visuals: VisualComponentDto[];
}
```

**2. Use Case**
```typescript
// create-community.use-case.ts
@Injectable()
export class CreateCommunityUseCase {
  constructor(
    @Inject('CommunityRepository')
    private readonly communityRepository: ICommunityRepository,
  ) {}

  async execute(dto: CreateCommunityDto): Promise<CommunityEntity> {
    // Validar se o route (slug) já existe
    const existing = await this.communityRepository.findByRoute(dto.route);
    if (existing) {
      throw new ConflictException('Route already exists');
    }

    // Criar a entidade de domínio
    const community = new CommunityEntity({
      id: uuid(),
      name: dto.name,
      route: dto.route,
      type: dto.type,
      logoUrl: dto.logoUrl,
      menu: dto.menu,
      visuals: dto.visuals,
      isActive: true,
    });

    // Persistir
    return await this.communityRepository.save(community);
  }
}
```

**3. Controller**
```typescript
// community.controller.ts
@Controller('communities')
@UseGuards(JwtAuthGuard)
export class CommunityController {
  constructor(
    private readonly createCommunityUseCase: CreateCommunityUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateCommunityDto) {
    return await this.createCommunityUseCase.execute(dto);
  }
}
```

**4. Repository**
```typescript
// community.repository.ts
@Injectable()
export class CommunityRepository implements ICommunityRepository {
  constructor(
    @InjectRepository(CommunityOrmEntity)
    private readonly ormRepository: Repository<CommunityOrmEntity>,
  ) {}

  async save(community: CommunityEntity): Promise<CommunityEntity> {
    const ormEntity = CommunityMapper.toOrm(community);
    const saved = await this.ormRepository.save(ormEntity);
    return CommunityMapper.toDomain(saved);
  }

  async findByRoute(route: string): Promise<CommunityEntity | null> {
    const found = await this.ormRepository.findOne({ where: { route } });
    return found ? CommunityMapper.toDomain(found) : null;
  }
}
```

---

## 🔌 Endpoints da API

### 🔐 Auth

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/auth/login` | Login com email e senha | ❌ |
| POST | `/auth/register` | Registrar novo usuário | ❌ |
| POST | `/auth/refresh` | Renovar token JWT | ✅ |

### 👤 Users

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/users` | Listar todos os usuários | ✅ Admin |
| GET | `/users/:id` | Buscar usuário por ID | ✅ |
| POST | `/users` | Criar novo usuário | ✅ Admin |
| PATCH | `/users/:id` | Atualizar usuário | ✅ |
| DELETE | `/users/:id` | Deletar usuário | ✅ Admin |
| GET | `/users/community/:communityId` | Usuários de uma comunidade | ✅ |

### 🏘️ Communities

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/communities` | Listar todas as comunidades ativas | ❌ |
| GET | `/communities/:id` | Buscar comunidade por ID | ❌ |
| GET | `/communities/slug/:route` | Buscar por slug/route | ❌ |
| POST | `/communities` | Criar nova comunidade | ✅ Admin |
| PATCH | `/communities/:id` | Atualizar comunidade | ✅ Admin |
| DELETE | `/communities/:id` | Deletar comunidade | ✅ Admin |

### 📄 Pages

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/pages` | Listar todas as páginas | ❌ |
| GET | `/pages/:id` | Buscar página por ID | ❌ |
| GET | `/communities/:communityId/pages` | Páginas de uma comunidade | ❌ |
| POST | `/pages` | Criar nova página | ✅ |
| PATCH | `/pages/:id` | Atualizar página | ✅ |
| DELETE | `/pages/:id` | Deletar página | ✅ Admin |

### 📝 Blog

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/blogs` | Listar todos os blogs | ❌ |
| GET | `/blogs/:id` | Buscar blog por ID | ❌ |
| GET | `/blogs/slug/:route` | Buscar por slug | ❌ |
| GET | `/users/:userId/blogs` | Blogs de um autor | ❌ |
| POST | `/blogs` | Criar novo blog | ✅ |
| PATCH | `/blogs/:id` | Atualizar blog | ✅ (autor ou admin) |
| DELETE | `/blogs/:id` | Deletar blog | ✅ (autor ou admin) |

---

## 🔐 Autenticação e Autorização

### JWT (JSON Web Token)

**Payload do Token:**
```json
{
  "sub": "user-uuid-here",
  "email": "usuario@unasp.com",
  "admin": false,
  "communityId": "community-uuid",
  "iat": 1234567890,
  "exp": 1234571490
}
```

### Guards (Guardas de Rota)

1. **JwtAuthGuard**: Valida se o token JWT é válido
2. **AdminGuard**: Valida se o usuário é admin
3. **OwnerGuard**: Valida se o usuário é dono do recurso

**Exemplo de Uso:**
```typescript
@Controller('users')
export class UserController {
  // Apenas usuários autenticados
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getUser(@Param('id') id: string) {
    // ...
  }

  // Apenas administradores
  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async deleteUser(@Param('id') id: string) {
    // ...
  }
}
```

---

## ✅ Boas Práticas

### 1. **Validação de Dados**
- Use `class-validator` em TODOS os DTOs
- Nunca confie em dados do cliente

```typescript
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
```

### 2. **Tratamento de Erros**
- Use exceções do NestJS (`NotFoundException`, `BadRequestException`, etc.)
- Nunca exponha detalhes internos ao cliente

```typescript
async findById(id: string): Promise<UserEntity> {
  const user = await this.repository.findById(id);
  if (!user) {
    throw new NotFoundException(`User with ID ${id} not found`);
  }
  return user;
}
```

### 3. **Segurança**
- SEMPRE hasheie senhas com bcrypt
- NUNCA retorne o campo `password` nas respostas
- Use HTTPS em produção
- Valide e sanitize TODOS os inputs

```typescript
// Hashear senha
const hashedPassword = await bcrypt.hash(password, 10);

// Verificar senha
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

### 4. **Paginação**
- Implemente paginação em endpoints que retornam listas

```typescript
@Get()
async findAll(
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 10,
) {
  return await this.useCase.execute({ page, limit });
}
```

### 5. **Documentação com Swagger**
- Use decorators do `@nestjs/swagger`

```typescript
@ApiTags('users')
@Controller('users')
export class UserController {
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @Post()
  async create(@Body() dto: CreateUserDto) {
    // ...
  }
}
```

### 6. **Testes**
- Escreva testes unitários para Use Cases
- Escreva testes de integração para Controllers

```typescript
describe('CreateUserUseCase', () => {
  it('should create a user successfully', async () => {
    const dto = { name: 'Test', email: 'test@test.com', password: '12345678' };
    const result = await useCase.execute(dto);
    expect(result.email).toBe(dto.email);
  });

  it('should throw error if email already exists', async () => {
    // ...
  });
});
```

---

## 🗄️ Schema do Banco de Dados

### Tabelas Principais

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  admin BOOLEAN DEFAULT FALSE,
  community_id UUID REFERENCES communities(id),
  position VARCHAR(100),
  image VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Communities
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  route VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL,
  logo_url VARCHAR(500) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  menu JSONB NOT NULL,
  visuals JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Pages
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  route VARCHAR(255) NOT NULL,
  community_id UUID REFERENCES communities(id),
  menu JSONB NOT NULL,
  visuals JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(community_id, route)
);

-- Blogs
CREATE TABLE blogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  route VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 Próximos Passos

### Módulos a Implementar:

1. ✅ **Auth** - Autenticação (já implementado)
2. ✅ **User** - Gerenciamento de usuários (já implementado)
3. ✅ **Community** - Gerenciamento de comunidades (já implementado)
4. ⏳ **Page** - Gerenciamento de páginas (A FAZER)
5. ⏳ **Blog** - Sistema de blog (A FAZER)
6. ⏳ **Upload** - Upload de imagens/arquivos (A FAZER)

### Funcionalidades Extras:

- 📧 **Email Service**: Envio de emails (boas-vindas, recuperação de senha)
- 🔍 **Search**: Busca global por conteúdo
- 📊 **Analytics**: Rastreamento de acessos
- 💬 **Comments**: Sistema de comentários nos blogs
- 🔔 **Notifications**: Notificações em tempo real

---

## 📚 Recursos Úteis

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Feito com 💜 e muito café! Se tiver dúvidas, não hesite em perguntar!** ☕

![Bocchi Happy](https://media.tenor.com/Gg0JCOlgCxgAAAAC/bocchi-the-rock-hitori-gotoh.gif)

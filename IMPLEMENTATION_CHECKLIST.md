# ✅ Checklist de Implementação - API UNASP

> **Guia para implementar os módulos faltantes** 📝  
> Use este checklist para garantir que está seguindo todos os passos!

![Bocchi Checklist](https://media.tenor.com/4JoASmF_NKAAAAAC/bocchi-the-rock.gif)

---

## 📊 Status Atual

| Módulo | Status | Prioridade |
|--------|--------|------------|
| ✅ Auth | Implementado | Alta |
| ✅ User | Implementado | Alta |
| ✅ Community | Implementado | Alta |
| ⏳ Page | A Implementar | Alta |
| ⏳ Blog | A Implementar | Alta |
| ⏳ Upload | A Implementar | Média |
| ⏳ Search | A Implementar | Baixa |

---

## 🔨 Módulo: Page (Páginas)

### 1. Domain Layer

- [ ] Criar `page.entity.ts`
  ```typescript
  export class PageEntity {
    id: string;
    name: string;
    route: string;
    communityId: string;
    menu: MenuEntity;
    visuals: VisualComponent[];
    createdAt: Date;
    updatedAt: Date;
  }
  ```

- [ ] Criar `page.repository.interface.ts`
  ```typescript
  export interface IPageRepository {
    save(page: PageEntity): Promise<PageEntity>;
    findById(id: string): Promise<PageEntity | null>;
    findByRoute(communityId: string, route: string): Promise<PageEntity | null>;
    findByCommunityId(communityId: string): Promise<PageEntity[]>;
    update(id: string, data: Partial<PageEntity>): Promise<PageEntity>;
    delete(id: string): Promise<void>;
  }
  ```

### 2. Infrastructure Layer

- [ ] Criar `page.orm-entity.ts` (TypeORM)
  ```typescript
  @Entity('pages')
  export class PageOrmEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    route: string;

    @Column({ name: 'community_id' })
    communityId: string;

    @Column({ type: 'jsonb' })
    menu: object;

    @Column({ type: 'jsonb' })
    visuals: object[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => CommunityOrmEntity, community => community.pages)
    @JoinColumn({ name: 'community_id' })
    community: CommunityOrmEntity;

    @Index(['community_id', 'route'], { unique: true })
  }
  ```

- [ ] Criar `page.repository.ts`
- [ ] Criar `page.mapper.ts` (Domain ↔ ORM)

### 3. Application Layer

- [ ] Criar Use Cases:
  - [ ] `create-page.use-case.ts`
  - [ ] `get-page-by-id.use-case.ts`
  - [ ] `get-pages-by-community.use-case.ts`
  - [ ] `update-page.use-case.ts`
  - [ ] `delete-page.use-case.ts`

### 4. Presentation Layer

- [ ] Criar DTOs:
  - [ ] `create-page.dto.ts`
  - [ ] `update-page.dto.ts`
  - [ ] `page-response.dto.ts`

- [ ] Criar `page.controller.ts`
  ```typescript
  @Controller('pages')
  export class PageController {
    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() dto: CreatePageDto) { }

    @Get(':id')
    async findById(@Param('id') id: string) { }

    @Get('community/:communityId')
    async findByCommunity(@Param('communityId') communityId: string) { }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    async update(@Param('id') id: string, @Body() dto: UpdatePageDto) { }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async delete(@Param('id') id: string) { }
  }
  ```

### 5. Module Configuration

- [ ] Criar `page.module.ts`
- [ ] Registrar no `app.module.ts`

### 6. Testes

- [ ] Testes unitários para Use Cases
- [ ] Testes de integração para Controller
- [ ] Testes de repository

---

## 📝 Módulo: Blog

### 1. Domain Layer

- [ ] Criar `blog.entity.ts`
  ```typescript
  export class BlogEntity {
    id: string;
    title: string;
    route: string;
    content: string;
    authorId: string;
    author?: UserEntity;
    createdAt: Date;
    updatedAt: Date;
  }
  ```

- [ ] Criar `blog.repository.interface.ts`
  ```typescript
  export interface IBlogRepository {
    save(blog: BlogEntity): Promise<BlogEntity>;
    findById(id: string): Promise<BlogEntity | null>;
    findByRoute(route: string): Promise<BlogEntity | null>;
    findByAuthorId(authorId: string): Promise<BlogEntity[]>;
    findAll(page: number, limit: number): Promise<{ data: BlogEntity[], total: number }>;
    update(id: string, data: Partial<BlogEntity>): Promise<BlogEntity>;
    delete(id: string): Promise<void>;
  }
  ```

### 2. Infrastructure Layer

- [ ] Criar `blog.orm-entity.ts`
  ```typescript
  @Entity('blogs')
  export class BlogOrmEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ unique: true })
    route: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ name: 'author_id' })
    authorId: string;

    @ManyToOne(() => UserOrmEntity, user => user.blogs, { eager: true })
    @JoinColumn({ name: 'author_id' })
    author: UserOrmEntity;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  }
  ```

- [ ] Criar `blog.repository.ts`
- [ ] Criar `blog.mapper.ts`

### 3. Application Layer

- [ ] Criar Use Cases:
  - [ ] `create-blog.use-case.ts`
  - [ ] `get-blog-by-id.use-case.ts`
  - [ ] `get-blog-by-route.use-case.ts`
  - [ ] `get-blogs-by-author.use-case.ts`
  - [ ] `get-all-blogs.use-case.ts` (com paginação)
  - [ ] `update-blog.use-case.ts`
  - [ ] `delete-blog.use-case.ts`

### 4. Presentation Layer

- [ ] Criar DTOs:
  - [ ] `create-blog.dto.ts`
  - [ ] `update-blog.dto.ts`
  - [ ] `blog-response.dto.ts`

- [ ] Criar `blog.controller.ts`
  ```typescript
  @Controller('blogs')
  export class BlogController {
    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() dto: CreateBlogDto, @Request() req) {
      // authorId vem do token JWT
      return this.createBlogUseCase.execute({ ...dto, authorId: req.user.id });
    }

    @Get()
    async findAll(@Query('page') page: number, @Query('limit') limit: number) { }

    @Get(':id')
    async findById(@Param('id') id: string) { }

    @Get('slug/:route')
    async findByRoute(@Param('route') route: string) { }

    @Get('author/:authorId')
    async findByAuthor(@Param('authorId') authorId: string) { }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
    async update(@Param('id') id: string, @Body() dto: UpdateBlogDto) { }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
    async delete(@Param('id') id: string) { }
  }
  ```

### 5. Guards Customizados

- [ ] Criar `owner-or-admin.guard.ts`
  ```typescript
  @Injectable()
  export class OwnerOrAdminGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      const resourceId = request.params.id;

      // Buscar o recurso (blog, page, etc.)
      const resource = await this.findResource(resourceId);

      // Permitir se for admin OU dono do recurso
      return user.admin || resource.authorId === user.id;
    }
  }
  ```

### 6. Module Configuration

- [ ] Criar `blog.module.ts`
- [ ] Registrar no `app.module.ts`

### 7. Testes

- [ ] Testes unitários para Use Cases
- [ ] Testes de integração para Controller
- [ ] Testes de autorização (owner/admin)

---

## 📤 Módulo: Upload (Opcional)

### Funcionalidades

- [ ] Upload de imagens (avatares, logos, banners)
- [ ] Validação de tipo de arquivo
- [ ] Redimensionamento de imagens
- [ ] Armazenamento (local ou S3)

### Tecnologias Sugeridas

- **Multer**: Upload de arquivos
- **Sharp**: Processamento de imagens
- **AWS S3** ou **MinIO**: Armazenamento

### Endpoints

- [ ] `POST /upload/image` - Upload de imagem
- [ ] `DELETE /upload/:filename` - Deletar arquivo

---

## 🔍 Módulo: Search (Opcional)

### Funcionalidades

- [ ] Busca global por texto
- [ ] Busca em comunidades, páginas e blogs
- [ ] Filtros avançados

### Tecnologias Sugeridas

- **Elasticsearch** ou **PostgreSQL Full-Text Search**

### Endpoints

- [ ] `GET /search?q=termo` - Busca global

---

## 🗄️ Migrations

### Criar Migrations

```bash
# Gerar migration automaticamente
yarn typeorm migration:generate -n CreatePagesTable

# Criar migration vazia
yarn typeorm migration:create -n AddIndexesToPages

# Rodar migrations
yarn typeorm migration:run

# Reverter última migration
yarn typeorm migration:revert
```

### Checklist de Migrations

- [ ] Migration para tabela `pages`
- [ ] Migration para tabela `blogs`
- [ ] Índices para performance:
  - [ ] `pages.route` + `pages.community_id` (único)
  - [ ] `blogs.route` (único)
  - [ ] `blogs.author_id`

---

## 🧪 Testes

### Estrutura de Testes

```
src/
└── modules/
    └── page/
        ├── application/
        │   └── use-cases/
        │       └── __tests__/
        │           └── create-page.use-case.spec.ts
        ├── infrastructure/
        │   └── persistence/
        │       └── __tests__/
        │           └── page.repository.spec.ts
        └── presentation/
            └── __tests__/
                └── page.controller.spec.ts
```

### Comandos de Teste

```bash
# Rodar todos os testes
yarn test

# Testes em modo watch
yarn test:watch

# Coverage
yarn test:cov

# Testes e2e
yarn test:e2e
```

### Checklist de Testes

#### Page Module
- [ ] Use Cases
  - [ ] CreatePageUseCase
  - [ ] GetPageByIdUseCase
  - [ ] UpdatePageUseCase
  - [ ] DeletePageUseCase
- [ ] Repository
  - [ ] PageRepository.save()
  - [ ] PageRepository.findById()
  - [ ] PageRepository.findByRoute()
- [ ] Controller
  - [ ] POST /pages
  - [ ] GET /pages/:id
  - [ ] PATCH /pages/:id
  - [ ] DELETE /pages/:id

#### Blog Module
- [ ] Use Cases
  - [ ] CreateBlogUseCase
  - [ ] GetBlogByIdUseCase
  - [ ] GetAllBlogsUseCase (paginação)
  - [ ] UpdateBlogUseCase
  - [ ] DeleteBlogUseCase
- [ ] Repository
  - [ ] BlogRepository.save()
  - [ ] BlogRepository.findAll()
  - [ ] BlogRepository.findByAuthorId()
- [ ] Controller
  - [ ] POST /blogs
  - [ ] GET /blogs
  - [ ] GET /blogs/:id
  - [ ] PATCH /blogs/:id (autorização)
  - [ ] DELETE /blogs/:id (autorização)

---

## 📝 Documentação

### Swagger

- [ ] Adicionar decorators `@ApiTags()` em todos os controllers
- [ ] Adicionar `@ApiOperation()` em todos os endpoints
- [ ] Adicionar `@ApiResponse()` para cada status code
- [ ] Documentar DTOs com `@ApiProperty()`

**Exemplo:**
```typescript
@ApiTags('pages')
@Controller('pages')
export class PageController {
  @ApiOperation({ summary: 'Create a new page' })
  @ApiResponse({ status: 201, description: 'Page created successfully', type: PageResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post()
  async create(@Body() dto: CreatePageDto) { }
}
```

### README Updates

- [ ] Atualizar `ARCHITECTURE.md` com novos módulos
- [ ] Atualizar `QUICKSTART.md` com exemplos de Page e Blog
- [ ] Adicionar diagramas atualizados

---

## 🚀 Deploy

### Preparação para Produção

- [ ] Configurar variáveis de ambiente de produção
- [ ] Configurar CORS adequadamente
- [ ] Habilitar rate limiting
- [ ] Configurar logs (Winston/Pino)
- [ ] Configurar monitoramento (Sentry/New Relic)
- [ ] Configurar SSL/HTTPS
- [ ] Otimizar queries do banco (índices)
- [ ] Implementar cache (Redis)

### CI/CD

- [ ] Configurar GitHub Actions ou GitLab CI
- [ ] Testes automáticos em PRs
- [ ] Deploy automático para staging
- [ ] Deploy manual para produção

---

## ✅ Validação Final

Antes de considerar o módulo completo, verifique:

- [ ] ✅ Todas as camadas implementadas (Domain, Application, Infrastructure, Presentation)
- [ ] ✅ DTOs com validação (`class-validator`)
- [ ] ✅ Testes unitários com coverage > 80%
- [ ] ✅ Testes de integração para endpoints principais
- [ ] ✅ Documentação Swagger completa
- [ ] ✅ Guards de autenticação/autorização funcionando
- [ ] ✅ Tratamento de erros adequado
- [ ] ✅ Logs implementados
- [ ] ✅ Code review feito
- [ ] ✅ Migrations criadas e testadas

---

## 🎯 Ordem Recomendada de Implementação

1. **Semana 1**: Módulo Page
   - Dia 1-2: Domain + Infrastructure
   - Dia 3-4: Application + Presentation
   - Dia 5: Testes + Documentação

2. **Semana 2**: Módulo Blog
   - Dia 1-2: Domain + Infrastructure
   - Dia 3-4: Application + Presentation
   - Dia 5: Testes + Documentação

3. **Semana 3**: Upload (se necessário)
   - Dia 1-3: Implementação
   - Dia 4-5: Testes + Integração

4. **Semana 4**: Refinamento
   - Testes e2e
   - Performance optimization
   - Preparação para deploy

---

## 📚 Recursos Úteis

- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [TypeORM Migrations](https://typeorm.io/migrations)
- [Swagger/OpenAPI](https://docs.nestjs.com/openapi/introduction)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

---

**Boa sorte com a implementação! Você consegue!** 💪🚀

![Bocchi Thumbs Up](https://media.tenor.com/Gg0JCOlgCxgAAAAC/bocchi-the-rock-hitori-gotoh.gif)

# 💻 Exemplos de Código - API UNASP

> **Templates prontos para copiar e adaptar!** 🚀  
> Use estes exemplos como base para implementar novos módulos.

![Bocchi Coding](https://media.tenor.com/_Nl-tI3pMQAAAAAi/bocchi-the-rock-hitori-gotoh.gif)

---

## 📋 Índice

1. [Domain Layer](#domain-layer)
2. [Infrastructure Layer](#infrastructure-layer)
3. [Application Layer](#application-layer)
4. [Presentation Layer](#presentation-layer)
5. [Module Configuration](#module-configuration)
6. [Testes](#testes)

---

## 🎯 Domain Layer

### Entity (Entidade de Domínio)

```typescript
// src/modules/page/domain/page.entity.ts

import { MenuEntity } from '@/modules/community/domain/menu.entity';
import { VisualComponent } from '@/modules/community/domain/visual-component.entity';

export class PageEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly route: string,
    public readonly communityId: string,
    public readonly menu: MenuEntity,
    public readonly visuals: VisualComponent[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  // Métodos de domínio (regras de negócio)
  isOwnedBy(communityId: string): boolean {
    return this.communityId === communityId;
  }

  updateName(newName: string): PageEntity {
    return new PageEntity(
      this.id,
      newName,
      this.route,
      this.communityId,
      this.menu,
      this.visuals,
      this.createdAt,
      new Date(),
    );
  }
}
```

### Repository Interface

```typescript
// src/modules/page/domain/page.repository.interface.ts

import { PageEntity } from './page.entity';

export interface IPageRepository {
  save(page: PageEntity): Promise<PageEntity>;
  findById(id: string): Promise<PageEntity | null>;
  findByRoute(communityId: string, route: string): Promise<PageEntity | null>;
  findByCommunityId(communityId: string): Promise<PageEntity[]>;
  update(id: string, data: Partial<PageEntity>): Promise<PageEntity>;
  delete(id: string): Promise<void>;
}

export const PAGE_REPOSITORY = Symbol('PAGE_REPOSITORY');
```

---

## 🏗️ Infrastructure Layer

### ORM Entity (TypeORM)

```typescript
// src/modules/page/infrastructure/persistence/page.orm-entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { CommunityOrmEntity } from '@/modules/community/infrastructure/persistence/community.orm-entity';

@Entity('pages')
@Index(['communityId', 'route'], { unique: true })
export class PageOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  route: string;

  @Column({ name: 'community_id', type: 'uuid' })
  communityId: string;

  @Column({ type: 'jsonb' })
  menu: object;

  @Column({ type: 'jsonb', array: false })
  visuals: object[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relacionamentos
  @ManyToOne(() => CommunityOrmEntity, (community) => community.pages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'community_id' })
  community: CommunityOrmEntity;
}
```

### Repository Implementation

```typescript
// src/modules/page/infrastructure/persistence/page.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPageRepository } from '../../domain/page.repository.interface';
import { PageEntity } from '../../domain/page.entity';
import { PageOrmEntity } from './page.orm-entity';
import { PageMapper } from '../page.mapper';

@Injectable()
export class PageRepository implements IPageRepository {
  constructor(
    @InjectRepository(PageOrmEntity)
    private readonly ormRepository: Repository<PageOrmEntity>,
  ) {}

  async save(page: PageEntity): Promise<PageEntity> {
    const ormEntity = PageMapper.toOrm(page);
    const saved = await this.ormRepository.save(ormEntity);
    return PageMapper.toDomain(saved);
  }

  async findById(id: string): Promise<PageEntity | null> {
    const found = await this.ormRepository.findOne({ where: { id } });
    return found ? PageMapper.toDomain(found) : null;
  }

  async findByRoute(
    communityId: string,
    route: string,
  ): Promise<PageEntity | null> {
    const found = await this.ormRepository.findOne({
      where: { communityId, route },
    });
    return found ? PageMapper.toDomain(found) : null;
  }

  async findByCommunityId(communityId: string): Promise<PageEntity[]> {
    const found = await this.ormRepository.find({
      where: { communityId },
      order: { createdAt: 'DESC' },
    });
    return found.map(PageMapper.toDomain);
  }

  async update(id: string, data: Partial<PageEntity>): Promise<PageEntity> {
    await this.ormRepository.update(id, data as any);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('Page not found after update');
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }
}
```

### Mapper (Domain ↔ ORM)

```typescript
// src/modules/page/infrastructure/page.mapper.ts

import { PageEntity } from '../domain/page.entity';
import { PageOrmEntity } from './persistence/page.orm-entity';
import { MenuMapper } from '@/modules/community/infrastructure/menu.mapper';
import { VisualComponentMapper } from '@/modules/community/infrastructure/visual-component.mapper';

export class PageMapper {
  static toDomain(orm: PageOrmEntity): PageEntity {
    return new PageEntity(
      orm.id,
      orm.name,
      orm.route,
      orm.communityId,
      MenuMapper.toDomain(orm.menu),
      (orm.visuals as any[]).map(VisualComponentMapper.toDomain),
      orm.createdAt,
      orm.updatedAt,
    );
  }

  static toOrm(domain: PageEntity): PageOrmEntity {
    const orm = new PageOrmEntity();
    orm.id = domain.id;
    orm.name = domain.name;
    orm.route = domain.route;
    orm.communityId = domain.communityId;
    orm.menu = MenuMapper.toPlain(domain.menu);
    orm.visuals = domain.visuals.map(VisualComponentMapper.toPlain);
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
```

---

## 🧠 Application Layer

### Use Case - Create

```typescript
// src/modules/page/application/use-cases/create-page.use-case.ts

import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { IPageRepository, PAGE_REPOSITORY } from '../../domain/page.repository.interface';
import { PageEntity } from '../../domain/page.entity';
import { CreatePageDto } from '../../presentation/dto/create-page.dto';

@Injectable()
export class CreatePageUseCase {
  constructor(
    @Inject(PAGE_REPOSITORY)
    private readonly pageRepository: IPageRepository,
  ) {}

  async execute(dto: CreatePageDto): Promise<PageEntity> {
    // Validar se já existe uma página com essa rota na comunidade
    const existing = await this.pageRepository.findByRoute(
      dto.communityId,
      dto.route,
    );

    if (existing) {
      throw new ConflictException(
        `Page with route '${dto.route}' already exists in this community`,
      );
    }

    // Criar a entidade de domínio
    const page = new PageEntity(
      uuid(),
      dto.name,
      dto.route,
      dto.communityId,
      dto.menu,
      dto.visuals,
      new Date(),
      new Date(),
    );

    // Persistir
    return await this.pageRepository.save(page);
  }
}
```

### Use Case - Get By ID

```typescript
// src/modules/page/application/use-cases/get-page-by-id.use-case.ts

import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IPageRepository, PAGE_REPOSITORY } from '../../domain/page.repository.interface';
import { PageEntity } from '../../domain/page.entity';

@Injectable()
export class GetPageByIdUseCase {
  constructor(
    @Inject(PAGE_REPOSITORY)
    private readonly pageRepository: IPageRepository,
  ) {}

  async execute(id: string): Promise<PageEntity> {
    const page = await this.pageRepository.findById(id);

    if (!page) {
      throw new NotFoundException(`Page with ID '${id}' not found`);
    }

    return page;
  }
}
```

### Use Case - Update

```typescript
// src/modules/page/application/use-cases/update-page.use-case.ts

import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IPageRepository, PAGE_REPOSITORY } from '../../domain/page.repository.interface';
import { PageEntity } from '../../domain/page.entity';
import { UpdatePageDto } from '../../presentation/dto/update-page.dto';

@Injectable()
export class UpdatePageUseCase {
  constructor(
    @Inject(PAGE_REPOSITORY)
    private readonly pageRepository: IPageRepository,
  ) {}

  async execute(id: string, dto: UpdatePageDto): Promise<PageEntity> {
    // Verificar se a página existe
    const existing = await this.pageRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Page with ID '${id}' not found`);
    }

    // Atualizar
    return await this.pageRepository.update(id, dto as Partial<PageEntity>);
  }
}
```

### Use Case - Delete

```typescript
// src/modules/page/application/use-cases/delete-page.use-case.ts

import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IPageRepository, PAGE_REPOSITORY } from '../../domain/page.repository.interface';

@Injectable()
export class DeletePageUseCase {
  constructor(
    @Inject(PAGE_REPOSITORY)
    private readonly pageRepository: IPageRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.pageRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Page with ID '${id}' not found`);
    }

    await this.pageRepository.delete(id);
  }
}
```

---

## 📡 Presentation Layer

### DTOs

```typescript
// src/modules/page/presentation/dto/create-page.dto.ts

import { IsString, IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MenuDto } from '@/modules/community/presentation/dto/menu.dto';
import { VisualComponentDto } from '@/modules/community/presentation/dto/visual-component.dto';

export class CreatePageDto {
  @ApiProperty({ example: 'Sobre Nós', description: 'Nome da página' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'sobre', description: 'Rota/slug da página' })
  @IsString()
  @IsNotEmpty()
  route: string;

  @ApiProperty({ example: 'uuid-da-comunidade', description: 'ID da comunidade' })
  @IsUUID()
  @IsNotEmpty()
  communityId: string;

  @ApiProperty({ type: MenuDto, description: 'Menu de navegação' })
  @ValidateNested()
  @Type(() => MenuDto)
  menu: MenuDto;

  @ApiProperty({ type: [VisualComponentDto], description: 'Componentes visuais' })
  @ValidateNested({ each: true })
  @Type(() => VisualComponentDto)
  visuals: VisualComponentDto[];
}
```

```typescript
// src/modules/page/presentation/dto/update-page.dto.ts

import { PartialType } from '@nestjs/swagger';
import { CreatePageDto } from './create-page.dto';

export class UpdatePageDto extends PartialType(CreatePageDto) {}
```

```typescript
// src/modules/page/presentation/dto/page-response.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { MenuEntity } from '@/modules/community/domain/menu.entity';
import { VisualComponent } from '@/modules/community/domain/visual-component.entity';

export class PageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  route: string;

  @ApiProperty()
  communityId: string;

  @ApiProperty()
  menu: MenuEntity;

  @ApiProperty()
  visuals: VisualComponent[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
```

### Controller

```typescript
// src/modules/page/presentation/page.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { AdminGuard } from '@/modules/auth/guards/admin.guard';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PageResponseDto } from './dto/page-response.dto';
import { CreatePageUseCase } from '../application/use-cases/create-page.use-case';
import { GetPageByIdUseCase } from '../application/use-cases/get-page-by-id.use-case';
import { GetPagesByCommunityUseCase } from '../application/use-cases/get-pages-by-community.use-case';
import { UpdatePageUseCase } from '../application/use-cases/update-page.use-case';
import { DeletePageUseCase } from '../application/use-cases/delete-page.use-case';

@ApiTags('pages')
@Controller('pages')
export class PageController {
  constructor(
    private readonly createPageUseCase: CreatePageUseCase,
    private readonly getPageByIdUseCase: GetPageByIdUseCase,
    private readonly getPagesByCommunityUseCase: GetPagesByCommunityUseCase,
    private readonly updatePageUseCase: UpdatePageUseCase,
    private readonly deletePageUseCase: DeletePageUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new page' })
  @ApiResponse({
    status: 201,
    description: 'Page created successfully',
    type: PageResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Page route already exists' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreatePageDto): Promise<PageResponseDto> {
    return await this.createPageUseCase.execute(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get page by ID' })
  @ApiResponse({
    status: 200,
    description: 'Page found',
    type: PageResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Page not found' })
  async findById(@Param('id') id: string): Promise<PageResponseDto> {
    return await this.getPageByIdUseCase.execute(id);
  }

  @Get('community/:communityId')
  @ApiOperation({ summary: 'Get all pages from a community' })
  @ApiResponse({
    status: 200,
    description: 'Pages found',
    type: [PageResponseDto],
  })
  async findByCommunity(
    @Param('communityId') communityId: string,
  ): Promise<PageResponseDto[]> {
    return await this.getPagesByCommunityUseCase.execute(communityId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a page' })
  @ApiResponse({
    status: 200,
    description: 'Page updated successfully',
    type: PageResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Page not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePageDto,
  ): Promise<PageResponseDto> {
    return await this.updatePageUseCase.execute(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a page' })
  @ApiResponse({ status: 204, description: 'Page deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Page not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.deletePageUseCase.execute(id);
  }
}
```

---

## 📦 Module Configuration

```typescript
// src/modules/page/page.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PageOrmEntity } from './infrastructure/persistence/page.orm-entity';
import { PageRepository } from './infrastructure/persistence/page.repository';
import { PAGE_REPOSITORY } from './domain/page.repository.interface';
import { CreatePageUseCase } from './application/use-cases/create-page.use-case';
import { GetPageByIdUseCase } from './application/use-cases/get-page-by-id.use-case';
import { GetPagesByCommunityUseCase } from './application/use-cases/get-pages-by-community.use-case';
import { UpdatePageUseCase } from './application/use-cases/update-page.use-case';
import { DeletePageUseCase } from './application/use-cases/delete-page.use-case';
import { PageController } from './presentation/page.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PageOrmEntity])],
  controllers: [PageController],
  providers: [
    // Repository
    {
      provide: PAGE_REPOSITORY,
      useClass: PageRepository,
    },
    // Use Cases
    CreatePageUseCase,
    GetPageByIdUseCase,
    GetPagesByCommunityUseCase,
    UpdatePageUseCase,
    DeletePageUseCase,
  ],
  exports: [PAGE_REPOSITORY],
})
export class PageModule {}
```

```typescript
// src/app.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CommunityModule } from './modules/community/community.module';
import { PageModule } from './modules/page/page.module'; // ← Adicionar

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    UserModule,
    CommunityModule,
    PageModule, // ← Adicionar
  ],
})
export class AppModule {}
```

---

## 🧪 Testes

### Use Case Test

```typescript
// src/modules/page/application/use-cases/__tests__/create-page.use-case.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CreatePageUseCase } from '../create-page.use-case';
import { IPageRepository, PAGE_REPOSITORY } from '../../../domain/page.repository.interface';
import { PageEntity } from '../../../domain/page.entity';

describe('CreatePageUseCase', () => {
  let useCase: CreatePageUseCase;
  let repository: jest.Mocked<IPageRepository>;

  beforeEach(async () => {
    const mockRepository: jest.Mocked<IPageRepository> = {
      save: jest.fn(),
      findById: jest.fn(),
      findByRoute: jest.fn(),
      findByCommunityId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePageUseCase,
        {
          provide: PAGE_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreatePageUseCase>(CreatePageUseCase);
    repository = module.get(PAGE_REPOSITORY);
  });

  it('should create a page successfully', async () => {
    const dto = {
      name: 'Test Page',
      route: 'test',
      communityId: 'community-uuid',
      menu: {} as any,
      visuals: [],
    };

    repository.findByRoute.mockResolvedValue(null);
    repository.save.mockResolvedValue({
      id: 'page-uuid',
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as PageEntity);

    const result = await useCase.execute(dto);

    expect(result.name).toBe(dto.name);
    expect(repository.findByRoute).toHaveBeenCalledWith(
      dto.communityId,
      dto.route,
    );
    expect(repository.save).toHaveBeenCalled();
  });

  it('should throw ConflictException if route already exists', async () => {
    const dto = {
      name: 'Test Page',
      route: 'test',
      communityId: 'community-uuid',
      menu: {} as any,
      visuals: [],
    };

    repository.findByRoute.mockResolvedValue({
      id: 'existing-page-uuid',
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as PageEntity);

    await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
  });
});
```

### Controller Test (E2E)

```typescript
// src/modules/page/presentation/__tests__/page.controller.e2e.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';

describe('PageController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let communityId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Login para obter token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'password123',
      });

    authToken = loginResponse.body.access_token;

    // Criar uma comunidade para testes
    const communityResponse = await request(app.getHttpServer())
      .post('/communities')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Community',
        route: 'test-community',
        type: 'other',
        logoUrl: 'https://example.com/logo.png',
        menu: { logo: 'https://example.com/logo.png', items: [], buttons: [] },
        visuals: [],
      });

    communityId = communityResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /pages', () => {
    it('should create a page', async () => {
      const response = await request(app.getHttpServer())
        .post('/pages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Page',
          route: 'test-page',
          communityId,
          menu: { logo: 'https://example.com/logo.png', items: [], buttons: [] },
          visuals: [],
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test Page');
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .post('/pages')
        .send({
          name: 'Test Page',
          route: 'test-page',
          communityId,
          menu: {},
          visuals: [],
        })
        .expect(401);
    });
  });

  describe('GET /pages/:id', () => {
    it('should get a page by id', async () => {
      // Criar página primeiro
      const createResponse = await request(app.getHttpServer())
        .post('/pages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Get Test Page',
          route: 'get-test-page',
          communityId,
          menu: { logo: 'https://example.com/logo.png', items: [], buttons: [] },
          visuals: [],
        });

      const pageId = createResponse.body.id;

      // Buscar página
      const response = await request(app.getHttpServer())
        .get(`/pages/${pageId}`)
        .expect(200);

      expect(response.body.id).toBe(pageId);
      expect(response.body.name).toBe('Get Test Page');
    });

    it('should return 404 for non-existent page', async () => {
      await request(app.getHttpServer())
        .get('/pages/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });
});
```

---

## 🎯 Dicas Finais

### 1. **Validação Customizada**

```typescript
// src/common/validators/is-slug.validator.ts

import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsSlug(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isSlug',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && /^[a-z0-9-]+$/.test(value);
        },
        defaultMessage() {
          return 'Route must be a valid slug (lowercase, numbers, and hyphens only)';
        },
      },
    });
  };
}

// Uso:
export class CreatePageDto {
  @IsSlug()
  route: string;
}
```

### 2. **Exception Filter Global**

```typescript
// src/common/filters/http-exception.filter.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}

// Registrar em main.ts:
app.useGlobalFilters(new AllExceptionsFilter());
```

### 3. **Logging Interceptor**

```typescript
// src/common/interceptors/logging.interceptor.ts

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const delay = Date.now() - now;
        this.logger.log(
          `${method} ${url} ${response.statusCode} - ${delay}ms`,
        );
      }),
    );
  }
}

// Registrar em main.ts:
app.useGlobalInterceptors(new LoggingInterceptor());
```

---

**Pronto para codar! Use estes templates como base!** 🚀💻

![Bocchi Coding Fast](https://media.tenor.com/Gg0JCOlgCxgAAAAC/bocchi-the-rock-hitori-gotoh.gif)

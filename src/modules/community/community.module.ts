import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityController } from './presentation/community.controller';
import { CommunityRepositoryImpl } from './infrastructure/repositories/community.repository.impl';
import { CreateCommunityUseCase } from './application/use-cases/create-community.use-case';
import { GetCommunityDetailUseCase } from './application/use-cases/get-community-detail.use-case';
import { GetAllCommunitiesUseCase } from './application/use-cases/get-all-communities.use-case';
import { TenantService } from './infrastructure/services/tenant.service';
import { TenantInterceptor } from './infrastructure/interceptors/tenant.interceptor';
import { CommunityOrmEntity } from './infrastructure/persistence/entities/community.orm-entity';
import { MenuOrmEntity } from './infrastructure/persistence/entities/menu.orm-entity';
import { PageOrmEntity } from './infrastructure/persistence/entities/page.orm-entity';

import { PageController } from './presentation/page.controller';
import { PageRepositoryImpl } from './infrastructure/repositories/page.repository.impl';
import { CreatePageUseCase } from './application/use-cases/create-page.use-case';
import { GetPageDetailUseCase } from './application/use-cases/get-page-detail.use-case';
import { UpdatePageUseCase } from './application/use-cases/update-page.use-case';
import { GetAllPagesByCommunityUseCase } from './application/use-cases/get-all-pages-by-community.use-case';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CommunityOrmEntity,
            MenuOrmEntity,
            PageOrmEntity
        ])
    ],
    controllers: [CommunityController, PageController],
    providers: [
        {
            provide: 'CommunityRepository',
            useClass: CommunityRepositoryImpl,
        },
        {
            provide: 'PageRepository',
            useClass: PageRepositoryImpl,
        },
        CreateCommunityUseCase,
        GetCommunityDetailUseCase,
        GetAllCommunitiesUseCase,
        CreatePageUseCase,
        GetPageDetailUseCase,
        UpdatePageUseCase,
        GetAllPagesByCommunityUseCase,
        TenantService,
        TenantInterceptor,
    ],
    exports: [
        'CommunityRepository',
        'PageRepository',
        TenantService,
        TenantInterceptor
    ],
})
export class CommunityModule { }

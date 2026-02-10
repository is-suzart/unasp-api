import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunityRepository } from '../../domain/community.repository';
import { Community, Menu, Page } from '../../domain/entities';
import { CommunityOrmEntity } from '../persistence/entities/community.orm-entity';
import { MenuOrmEntity } from '../persistence/entities/menu.orm-entity';
import { PageOrmEntity } from '../persistence/entities/page.orm-entity';
import { randomUUID } from 'crypto';

@Injectable()
export class CommunityRepositoryImpl implements CommunityRepository {
    constructor(
        @InjectRepository(CommunityOrmEntity)
        private readonly ormRepository: Repository<CommunityOrmEntity>,
    ) { }

    async create(community: Community): Promise<Community> {
        const ormEntity = this.toOrm(community);
        const saved = await this.ormRepository.save(ormEntity);
        return this.toDomain(saved);
    }

    async findBySlug(slug: string): Promise<Community | null> {
        const ormEntity = await this.ormRepository.findOne({
            where: { slug },
            relations: ['menu', 'pages'],
        });
        return ormEntity ? this.toDomain(ormEntity) : null;
    }

    async findById(id: string): Promise<Community | null> {
        const ormEntity = await this.ormRepository.findOne({
            where: { id },
            relations: ['menu', 'pages'],
        });
        return ormEntity ? this.toDomain(ormEntity) : null;
    }

    async findAll(): Promise<Community[]> {
        const ormEntities = await this.ormRepository.find();
        return ormEntities.map((entity) => this.toDomain(entity));
    }

    private toDomain(ormEntity: CommunityOrmEntity): Community {
        return new Community({
            id: ormEntity.id,
            name: ormEntity.name,
            slug: ormEntity.slug,
            type: ormEntity.type,
            logoUrl: ormEntity.logoUrl,
            isActive: ormEntity.isActive,
            seo: ormEntity.seo,
            menu: ormEntity.menu
                ? new Menu({
                    id: ormEntity.menu.id,
                    communityId: ormEntity.menu.communityId,
                    items: ormEntity.menu.items,
                })
                : undefined,
            pages: ormEntity.pages?.map(
                (page) =>
                    new Page({
                        id: page.id,
                        communityId: page.communityId,
                        title: page.title,
                        slug: page.slug,
                        content: page.content,
                    }),
            ),
        });
    }

    private toOrm(domain: Community): CommunityOrmEntity {
        const entity = new CommunityOrmEntity();
        entity.id = domain.id;
        entity.name = domain.name;
        entity.slug = domain.slug;
        entity.type = domain.type;
        entity.logoUrl = domain.logoUrl;
        entity.isActive = domain.isActive;
        entity.seo = domain.seo;

        if (domain.menu) {
            const menu = new MenuOrmEntity();
            menu.id = domain.menu.id;
            menu.communityId = domain.id; // Ensure FK
            menu.items = domain.menu.items;
            entity.menu = menu;
        }

        if (domain.pages) {
            entity.pages = domain.pages.map((p) => {
                const page = new PageOrmEntity();
                page.id = p.id;
                page.communityId = domain.id;
                page.title = p.title;
                page.slug = p.slug;
                page.content = p.content;
                return page;
            });
        }

        return entity;
    }
}

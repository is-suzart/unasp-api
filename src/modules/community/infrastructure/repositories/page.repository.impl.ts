import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PageRepository } from '../../domain/page.repository';
import { Page } from '../../domain/entities';
import { PageOrmEntity } from '../persistence/entities/page.orm-entity';

@Injectable()
export class PageRepositoryImpl implements PageRepository {
    constructor(
        @InjectRepository(PageOrmEntity)
        private readonly ormRepository: Repository<PageOrmEntity>,
    ) { }

    async create(page: Page): Promise<Page> {
        const ormEntity = this.toOrm(page);
        const saved = await this.ormRepository.save(ormEntity);
        return this.toDomain(saved);
    }

    async update(id: string, page: Partial<Page>): Promise<Page> {
        await this.ormRepository.update(id, page);
        const updated = await this.ormRepository.findOne({ where: { id } });
        if (!updated) throw new Error('Page not found after update');
        return this.toDomain(updated);
    }

    async findBySlug(communityId: string, slug: string): Promise<Page | null> {
        const ormEntity = await this.ormRepository.findOne({
            where: { communityId, slug },
        });
        return ormEntity ? this.toDomain(ormEntity) : null;
    }

    async findById(communityId: string, id: string): Promise<Page | null> {
        const ormEntity = await this.ormRepository.findOne({
            where: { communityId, id },
        });
        return ormEntity ? this.toDomain(ormEntity) : null;
    }

    async findAll(communityId: string): Promise<Page[]> {
        const ormEntities = await this.ormRepository.find({
            where: { communityId },
        });
        return ormEntities.map((entity) => this.toDomain(entity));
    }

    async delete(id: string): Promise<void> {
        await this.ormRepository.delete(id);
    }

    private toDomain(ormEntity: PageOrmEntity): Page {
        return new Page({
            id: ormEntity.id,
            communityId: ormEntity.communityId,
            title: ormEntity.title,
            slug: ormEntity.slug,
            content: ormEntity.content,
        });
    }

    private toOrm(domain: Page): PageOrmEntity {
        const entity = new PageOrmEntity();
        entity.id = domain.id;
        entity.communityId = domain.communityId;
        entity.title = domain.title;
        entity.slug = domain.slug;
        entity.content = domain.content;
        return entity;
    }
}

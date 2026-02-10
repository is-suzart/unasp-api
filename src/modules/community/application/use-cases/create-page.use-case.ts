import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { PageRepository } from '../../domain/page.repository';
import { Page } from '../../domain/entities';
import { CreatePageDto } from '../../presentation/dto/page.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class CreatePageUseCase {
    constructor(
        @Inject('PageRepository')
        private readonly pageRepository: PageRepository,
    ) { }

    async execute(communityId: string, input: CreatePageDto): Promise<Page> {
        const existing = await this.pageRepository.findBySlug(communityId, input.slug);
        if (existing) {
            throw new ConflictException(`Page with slug ${input.slug} already exists in this community`);
        }

        const page = new Page({
            id: randomUUID(),
            communityId: communityId,
            title: input.title,
            slug: input.slug,
            content: input.content || {},
        });

        return await this.pageRepository.create(page);
    }
}

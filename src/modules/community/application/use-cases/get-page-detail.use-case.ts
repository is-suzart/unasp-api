import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PageRepository } from '../../domain/page.repository';
import { Page } from '../../domain/entities';

@Injectable()
export class GetPageDetailUseCase {
    constructor(
        @Inject('PageRepository')
        private readonly pageRepository: PageRepository,
    ) { }

    async execute(communityId: string, slug: string): Promise<Page> {
        const page = await this.pageRepository.findBySlug(communityId, slug);

        if (!page) {
            throw new NotFoundException(`Page not found for slug: ${slug}`);
        }

        return page;
    }
}

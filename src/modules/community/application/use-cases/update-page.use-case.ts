import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { PageRepository } from '../../domain/page.repository';
import { Page } from '../../domain/entities';
import { UpdatePageDto } from '../../presentation/dto/page.dto';

@Injectable()
export class UpdatePageUseCase {
    constructor(
        @Inject('PageRepository')
        private readonly pageRepository: PageRepository,
    ) { }

    async execute(communityId: string, pageId: string, input: UpdatePageDto): Promise<Page> {
        const existingPage = await this.pageRepository.findById(communityId, pageId);
        if (!existingPage) {
            throw new NotFoundException(`Page with ID ${pageId} not found`);
        }

        if (input.slug && input.slug !== existingPage.slug) {
            const slugExists = await this.pageRepository.findBySlug(communityId, input.slug);
            if (slugExists) {
                throw new ConflictException(`Page with slug ${input.slug} already exists in this community`);
            }
        }

        return await this.pageRepository.update(pageId, input as Partial<Page>);
    }
}

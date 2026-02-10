import { Injectable, Inject } from '@nestjs/common';
import { PageRepository } from '../../domain/page.repository';
import { Page } from '../../domain/entities';

@Injectable()
export class GetAllPagesByCommunityUseCase {
    constructor(
        @Inject('PageRepository')
        private readonly pageRepository: PageRepository,
    ) { }

    async execute(communityId: string): Promise<Page[]> {
        return await this.pageRepository.findAll(communityId);
    }
}

import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CommunityRepository } from '../../domain/community.repository';
import { Community } from '../../domain/entities';

@Injectable()
export class GetCommunityDetailUseCase {
    constructor(
        @Inject('CommunityRepository')
        private readonly communityRepository: CommunityRepository,
    ) { }

    async execute(slug: string): Promise<Community> {
        const community = await this.communityRepository.findBySlug(slug);

        if (!community) {
            throw new NotFoundException(`Community not found for slug: ${slug}`);
        }

        return community;
    }
}

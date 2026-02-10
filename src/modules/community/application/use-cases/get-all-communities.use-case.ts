import { Injectable, Inject } from '@nestjs/common';
import { CommunityRepository } from '../../domain/community.repository';
import { Community } from '../../domain/entities';

@Injectable()
export class GetAllCommunitiesUseCase {
    constructor(
        @Inject('CommunityRepository')
        private readonly communityRepository: CommunityRepository,
    ) { }

    async execute(): Promise<Community[]> {
        return await this.communityRepository.findAll();
    }
}

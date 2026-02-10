import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { CommunityRepository } from '../../domain/community.repository';
import { Community, Menu } from '../../domain/entities';
import { CreateCommunityDto } from '../../presentation/dto/create-community.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class CreateCommunityUseCase {
    constructor(
        @Inject('CommunityRepository')
        private readonly communityRepository: CommunityRepository,
    ) { }

    async execute(input: CreateCommunityDto): Promise<Community> {
        const existing = await this.communityRepository.findBySlug(input.slug);
        if (existing) {
            throw new ConflictException(`Community with slug ${input.slug} already exists`);
        }

        const startId = randomUUID();

        // Create Default Menu
        const defaultMenu = new Menu({
            id: randomUUID(),
            communityId: startId,
            items: [
                { label: 'Início', url: '/', order: 1 },
                { label: 'Sobre', url: '/sobre', order: 2 },
            ],
        });

        const community = new Community({
            id: startId,
            name: input.name,
            slug: input.slug,
            type: input.type,
            logoUrl: input.logoUrl,
            isActive: true,
            seo: input.seo || {
                title: input.name,
                description: `Bem-vindo à ${input.name}`,
            },
            menu: defaultMenu,
            pages: [],
        });

        return await this.communityRepository.create(community);
    }
}

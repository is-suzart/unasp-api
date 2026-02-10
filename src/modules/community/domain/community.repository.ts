import { Community } from './entities';

export interface CommunityRepository {
    create(community: Community): Promise<Community>;
    findBySlug(slug: string): Promise<Community | null>;
    findById(id: string): Promise<Community | null>;
    findAll(): Promise<Community[]>;
}

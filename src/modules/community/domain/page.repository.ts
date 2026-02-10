import { Page } from './entities';

export interface PageRepository {
    create(page: Page): Promise<Page>;
    update(id: string, page: Partial<Page>): Promise<Page>;
    findBySlug(communityId: string, slug: string): Promise<Page | null>;
    findById(communityId: string, id: string): Promise<Page | null>;
    findAll(communityId: string): Promise<Page[]>;
    delete(id: string): Promise<void>;
}

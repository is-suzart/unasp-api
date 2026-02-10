import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CommunityOrmEntity } from './community.orm-entity';
import { PageVisuals } from '../../../domain/entities';

@Entity('pages')
export class PageOrmEntity {
    @PrimaryColumn('uuid')
    id: string;

    @Column({ name: 'community_id' })
    communityId: string;

    @Column()
    title: string;

    @Column()
    slug: string;

    @Column({ type: 'jsonb', default: {} })
    content: PageVisuals;

    @ManyToOne(() => CommunityOrmEntity, (community) => community.pages)
    @JoinColumn({ name: 'community_id' })
    community: CommunityOrmEntity;
}

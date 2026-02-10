import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { CommunityOrmEntity } from './community.orm-entity';
import { MenuItem } from '../../../domain/entities';

@Entity('menus')
export class MenuOrmEntity {
    @PrimaryColumn('uuid')
    id: string;

    @Column({ name: 'community_id' })
    communityId: string;

    @Column({ type: 'jsonb', default: [] })
    items: MenuItem[];

    @OneToOne(() => CommunityOrmEntity, (community) => community.menu)
    @JoinColumn({ name: 'community_id' })
    community: CommunityOrmEntity;
}

import { Entity, Column, PrimaryColumn, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { MenuOrmEntity } from './menu.orm-entity';
import { PageOrmEntity } from './page.orm-entity';

@Entity('communities')
export class CommunityOrmEntity {
    @PrimaryColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    slug: string;

    @Column()
    type: string;

    @Column({ nullable: true })
    logoUrl: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'jsonb', default: {} })
    seo: {
        title: string;
        description: string;
        ogImage?: string;
    };

    @OneToOne(() => MenuOrmEntity, (menu: MenuOrmEntity) => menu.community, { cascade: true, eager: true })
    menu: MenuOrmEntity;

    @OneToMany(() => PageOrmEntity, (page: PageOrmEntity) => page.community, { cascade: true })
    pages: PageOrmEntity[];
}

import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class UserOrmEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 255 })
    password: string;

    @Column({ type: 'boolean', default: false })
    admin: boolean;

    @Column({ type: 'uuid', name: 'community_id' })
    communityId: string;

    @Column({ type: 'varchar', length: 255 })
    position: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    image: string | null;
}

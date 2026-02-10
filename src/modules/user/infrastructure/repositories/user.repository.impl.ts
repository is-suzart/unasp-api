import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepository } from '../../domain/user.repository';
import { User } from '../../domain/user.entity';
import { UserOrmEntity } from '../persistence/entities/user.orm-entity';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
    constructor(
        @InjectRepository(UserOrmEntity)
        private readonly ormRepository: Repository<UserOrmEntity>,
    ) { }

    async findById(id: string): Promise<User | null> {
        const ormEntity = await this.ormRepository.findOne({ where: { id } });
        return ormEntity ? this.toDomain(ormEntity) : null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const ormEntity = await this.ormRepository.findOne({ where: { email } });
        return ormEntity ? this.toDomain(ormEntity) : null;
    }

    async findAll(): Promise<User[]> {
        const ormEntities = await this.ormRepository.find();
        return ormEntities.map(entity => this.toDomain(entity));
    }

    async update(id: string, user: Partial<User>): Promise<User> {
        await this.ormRepository.update(id, user);
        const updated = await this.ormRepository.findOne({ where: { id } });
        if (!updated) {
            // Isso teoricamente não deveria acontecer se o use case garantir que o user existe antes
            throw new Error(`User with id ${id} not found after update`);
        }
        return this.toDomain(updated);
    }

    async save(user: User): Promise<User> {
        const ormEntity = this.toOrm(user);
        const saved = await this.ormRepository.save(ormEntity);
        return this.toDomain(saved);
    }

    async delete(id: string): Promise<void> {
        await this.ormRepository.delete(id);
    }

    private toDomain(ormEntity: UserOrmEntity): User {
        return new User({
            id: ormEntity.id,
            name: ormEntity.name,
            email: ormEntity.email,
            password: ormEntity.password,
            admin: ormEntity.admin,
            communityId: ormEntity.communityId,
            position: ormEntity.position,
            image: ormEntity.image || undefined,
        });
    }

    private toOrm(user: User): UserOrmEntity {
        const ormEntity = new UserOrmEntity();
        ormEntity.id = user.id;
        ormEntity.name = user.name;
        ormEntity.email = user.email;
        ormEntity.password = user.password;
        ormEntity.admin = user.admin;
        ormEntity.communityId = user.communityId;
        ormEntity.position = user.position;
        ormEntity.image = user.image || null;
        return ormEntity;
    }
}

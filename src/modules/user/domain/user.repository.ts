import { User } from '../domain/user.entity';

export interface UserRepository {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findAll(): Promise<User[]>;
    update(id: string, user: Partial<User>): Promise<User>;
    save(user: User): Promise<User>;
    delete(id: string): Promise<void>;
}

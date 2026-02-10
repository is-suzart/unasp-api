import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { User } from '../../domain/user.entity';
import { HashingService } from '../../../../common/services/hashing.service';
import { randomUUID } from 'crypto';

export interface CreateUserInput {
    name: string;
    email: string;
    password: string; // Plain text password
    admin: boolean;
    communityId: string;
    position: string;
    image?: string;
}

@Injectable()
export class CreateUserUseCase {
    constructor(
        @Inject('UserRepository')
        private readonly userRepository: UserRepository,
        @Inject('HashingService')
        private readonly hashingService: HashingService,
    ) { }

    async execute(input: CreateUserInput): Promise<User> {
        // Check if user with email already exists
        const existingUser = await this.userRepository.findByEmail(input.email);

        if (existingUser) {
            throw new ConflictException(`User with email ${input.email} already exists`);
        }

        // Hash the password
        const hashedPassword = await this.hashingService.hash(input.password);

        // Create new user with hashed password
        const user = new User({
            id: randomUUID(),
            ...input,
            password: hashedPassword,
        });

        return await this.userRepository.save(user);
    }
}

import { Injectable, Inject } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { User } from '../../domain/user.entity';

@Injectable()
export class GetAllUsersUseCase {
    constructor(
        @Inject('UserRepository')
        private readonly userRepository: UserRepository,
    ) { }

    async execute(): Promise<User[]> {
        // For now, we'll implement this in the repository
        // In a real app, you might want pagination
        return await this.userRepository.findAll();
    }
}

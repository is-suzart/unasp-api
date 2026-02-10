import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { User } from '../../domain/user.entity';
import { UpdateUserDto } from '../../presentation/dto/update-user.dto';

@Injectable()
export class UpdateUserUseCase {
    constructor(
        @Inject('UserRepository')
        private readonly userRepository: UserRepository,
    ) { }

    async execute(id: string, updateData: UpdateUserDto): Promise<User> {
        // 1. Verify if user exists
        const existingUser = await this.userRepository.findById(id);
        if (!existingUser) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        // 2. If email is being updated, check for conflicts
        if (updateData.email && updateData.email !== existingUser.email) {
            const userWithEmail = await this.userRepository.findByEmail(updateData.email);
            if (userWithEmail) {
                throw new ConflictException(`Email ${updateData.email} is already in use`);
            }
        }

        // 3. Update the user
        // We pass only the fields that were actually sent
        return await this.userRepository.update(id, updateData as Partial<User>);
    }
}

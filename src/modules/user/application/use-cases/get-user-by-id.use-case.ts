import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { User } from '../../domain/user.entity';

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) { }

  async execute(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }
}

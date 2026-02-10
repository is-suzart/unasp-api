import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../../../user/domain/user.repository';
import { HashingService } from '../../../../common/services/hashing.service';
import { LoginDto } from '../../presentation/dto/login.dto';

export interface LoginResponse {
    user: {
        id: string;
        name: string;
        email: string;
        admin: boolean;
        communityId: string;
        position: string;
        image?: string;
    };
    access_token: string;
}

@Injectable()
export class LoginUseCase {
    constructor(
        @Inject('UserRepository')
        private readonly userRepository: UserRepository,
        @Inject('HashingService')
        private readonly hashingService: HashingService,
        private readonly jwtService: JwtService,
    ) { }

    async execute(input: LoginDto): Promise<LoginResponse> {
        // 1. Find user by email
        const user = await this.userRepository.findByEmail(input.email);

        // 2. Validate user existence and password
        if (!user) {
            throw new UnauthorizedException('Usuário não encontrado com este e-mail');
        }

        const isPasswordValid = await this.hashingService.compare(
            input.password,
            user.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Senha incorreta');
        }

        // 3. Generate JWT payload with support for multi-tenancy
        const payload = {
            sub: user.id,
            email: user.email,
            communityId: user.communityId, // Critical for tenant separation
            admin: user.admin
        };

        // 4. Return user info (without password) and token
        const { password, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            access_token: this.jwtService.sign(payload),
        };
    }
}

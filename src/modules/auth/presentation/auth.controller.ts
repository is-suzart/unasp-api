import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginUseCase, LoginResponse } from '../application/use-cases/login.use-case';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly loginUseCase: LoginUseCase) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Autenticar usuário' })
    @ApiResponse({
        status: 200,
        description: 'Login realizado com sucesso',
        schema: {
            example: {
                user: {
                    id: 'uuid',
                    name: 'Nome',
                    email: 'email@example.com',
                    communityId: 'uuid',
                    position: 'Cargo'
                },
                access_token: 'jwt_token_string'
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
    async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
        return this.loginUseCase.execute(loginDto);
    }
}

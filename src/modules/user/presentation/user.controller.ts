import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { GetUserByIdUseCase } from '../application/use-cases/get-user-by-id.use-case';
import { GetAllUsersUseCase } from '../application/use-cases/get-all-users.use-case';
import { CreateUserUseCase } from '../application/use-cases/create-user.use-case';
import { UpdateUserUseCase } from '../application/use-cases/update-user.use-case';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
    constructor(
        private readonly getUserByIdUseCase: GetUserByIdUseCase,
        private readonly getAllUsersUseCase: GetAllUsersUseCase,
        private readonly createUserUseCase: CreateUserUseCase,
        private readonly updateUserUseCase: UpdateUserUseCase,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Listar todos os usuários' })
    @ApiResponse({ status: 200, description: 'Lista de usuários retornada com sucesso' })
    async getAllUsers() {
        const users = await this.getAllUsersUseCase.execute();

        // Don't expose passwords in response
        return users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar usuário por ID' })
    @ApiParam({ name: 'id', description: 'ID do usuário (UUID)', example: '515d12e9-10cb-404b-8e88-dce5c7156ff0' })
    @ApiResponse({ status: 200, description: 'Usuário encontrado' })
    @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
    async getUserById(@Param('id') id: string) {
        const user = await this.getUserByIdUseCase.execute(id);

        // Don't expose password in response
        const { password, ...userWithoutPassword } = user;

        return userWithoutPassword;
    }

    @Post()
    @ApiOperation({ summary: 'Criar novo usuário' })
    @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
    @ApiResponse({ status: 400, description: 'Dados inválidos' })
    @ApiResponse({ status: 409, description: 'Email já existe' })
    async createUser(@Body() createUserDto: CreateUserDto) {
        const user = await this.createUserUseCase.execute(createUserDto);

        // Don't expose password in response
        const { password, ...userWithoutPassword } = user;

        return userWithoutPassword;
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Atualizar usuário' })
    @ApiParam({ name: 'id', description: 'ID do usuário (UUID)' })
    @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
    @ApiResponse({ status: 400, description: 'Dados inválidos' })
    @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
    @ApiResponse({ status: 409, description: 'Email já existe' })
    async updateUser(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        const user = await this.updateUserUseCase.execute(id, updateUserDto);

        // Don't expose password in response
        const { password, ...userWithoutPassword } = user;

        return userWithoutPassword;
    }
}

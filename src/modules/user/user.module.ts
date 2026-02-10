import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from './infrastructure/persistence/entities/user.orm-entity';
import { UserRepositoryImpl } from './infrastructure/repositories/user.repository.impl';
import { GetUserByIdUseCase } from './application/use-cases/get-user-by-id.use-case';
import { GetAllUsersUseCase } from './application/use-cases/get-all-users.use-case';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { UserController } from './presentation/user.controller';

@Module({
    imports: [TypeOrmModule.forFeature([UserOrmEntity])],
    providers: [
        {
            provide: 'UserRepository',
            useClass: UserRepositoryImpl,
        },
        GetUserByIdUseCase,
        GetAllUsersUseCase,
        CreateUserUseCase,
        UpdateUserUseCase,
    ],
    controllers: [UserController],
    exports: ['UserRepository'],
})
export class UserModule { }

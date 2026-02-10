import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'user@example.com', description: 'Email do usuário' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password123', description: 'Senha do usuário' })
    @IsString()
    @MinLength(6)
    password: string;
}

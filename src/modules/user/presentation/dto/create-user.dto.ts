import { IsString, IsEmail, IsBoolean, IsUUID, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: 'João Silva', description: 'Nome completo do usuário' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'joao@example.com', description: 'Email único do usuário' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'senha123456', description: 'Senha do usuário (mínimo 6 caracteres)', minLength: 6 })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({ example: false, description: 'Se o usuário é administrador' })
    @IsBoolean()
    admin: boolean;

    @ApiProperty({ example: 'c0e0d178-01e9-4a15-9aa4-c6162f5eb83e', description: 'ID da comunidade do usuário' })
    @IsUUID()
    communityId: string;

    @ApiProperty({ example: 'Developer', description: 'Cargo/posição do usuário' })
    @IsString()
    position: string;

    @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg', description: 'URL da imagem de perfil' })
    @IsOptional()
    @IsString()
    image?: string;
}

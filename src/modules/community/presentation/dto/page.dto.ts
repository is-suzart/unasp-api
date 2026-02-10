import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePageDto {
    @ApiProperty({ example: 'Home Page', description: 'Title of the page' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ example: 'home', description: 'URL slug for the page' })
    @IsString()
    @IsNotEmpty()
    slug: string;

    @ApiProperty({ example: { type: 'section', children: [] }, description: 'JSONB content for visual components' })
    @IsObject()
    @IsOptional()
    content?: Record<string, any>;
}

export class UpdatePageDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    slug?: string;

    @ApiProperty({ required: false })
    @IsObject()
    @IsOptional()
    content?: Record<string, any>;
}

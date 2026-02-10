import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommunityDto {
    @ApiProperty({ example: 'Igreja Central', description: 'Name of the community' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'igreja-central', description: 'Unique slug for the community' })
    @IsString()
    @IsNotEmpty()
    slug: string;

    @ApiProperty({ example: 'church', description: 'Type of community' })
    @IsString()
    @IsNotEmpty()
    type: string;

    @ApiProperty({ required: false, example: 'https://logo.url/img.png' })
    @IsString()
    @IsOptional()
    logoUrl?: string;

    @ApiProperty({ required: false, example: { title: 'SEO Title', description: 'SEO Desc' } })
    @IsObject()
    @IsOptional()
    seo?: {
        title: string;
        description: string;
        ogImage?: string;
    };
}

import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateCommunityUseCase } from '../application/use-cases/create-community.use-case';
import { GetCommunityDetailUseCase } from '../application/use-cases/get-community-detail.use-case';
import { GetAllCommunitiesUseCase } from '../application/use-cases/get-all-communities.use-case';
import { CreateCommunityDto } from './dto/create-community.dto';

@ApiTags('communities')
@Controller('communities')
export class CommunityController {
    constructor(
        private readonly createCommunityUseCase: CreateCommunityUseCase,
        private readonly getCommunityDetailUseCase: GetCommunityDetailUseCase,
        private readonly getAllCommunitiesUseCase: GetAllCommunitiesUseCase,
    ) { }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new community (Admin)' })
    @ApiResponse({ status: 201, description: 'Community created successfully' })
    @ApiResponse({ status: 409, description: 'Community slug already exists' })
    async create(@Body() createCommunityDto: CreateCommunityDto) {
        return this.createCommunityUseCase.execute(createCommunityDto);
    }

    @Get(':slug')
    @ApiOperation({ summary: 'Get community details by slug (Public)' })
    @ApiParam({ name: 'slug', description: 'Community slug (e.g. igreja-central)' })
    @ApiResponse({ status: 200, description: 'Community details returned' })
    @ApiResponse({ status: 404, description: 'Community not found' })
    async getBySlug(@Param('slug') slug: string) {
        return this.getCommunityDetailUseCase.execute(slug);
    }

    @Get()
    @ApiOperation({ summary: 'Get all communities' })
    @ApiResponse({ status: 200, description: 'List of communities' })
    async getAll() {
        return this.getAllCommunitiesUseCase.execute();
    }
}

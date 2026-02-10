import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreatePageUseCase } from '../application/use-cases/create-page.use-case';
import { GetPageDetailUseCase } from '../application/use-cases/get-page-detail.use-case';
import { UpdatePageUseCase } from '../application/use-cases/update-page.use-case';
import { GetAllPagesByCommunityUseCase } from '../application/use-cases/get-all-pages-by-community.use-case';
import { CreatePageDto, UpdatePageDto } from './dto/page.dto';

@ApiTags('pages')
@Controller('communities/:communityId/pages')
export class PageController {
    constructor(
        private readonly createPageUseCase: CreatePageUseCase,
        private readonly getPageDetailUseCase: GetPageDetailUseCase,
        private readonly updatePageUseCase: UpdatePageUseCase,
        private readonly getAllPagesByCommunityUseCase: GetAllPagesByCommunityUseCase,
    ) { }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new page in a community' })
    @ApiParam({ name: 'communityId', description: 'ID of the community' })
    @ApiResponse({ status: 201, description: 'Page created successfully' })
    @ApiResponse({ status: 409, description: 'Page slug already exists' })
    async create(
        @Param('communityId') communityId: string,
        @Body() createPageDto: CreatePageDto,
    ) {
        return this.createPageUseCase.execute(communityId, createPageDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all pages for a community' })
    @ApiParam({ name: 'communityId', description: 'ID of the community' })
    @ApiResponse({ status: 200, description: 'List of pages returned' })
    async getAll(@Param('communityId') communityId: string) {
        return this.getAllPagesByCommunityUseCase.execute(communityId);
    }

    @Get(':slug')
    @ApiOperation({ summary: 'Get page details by slug (Public)' })
    @ApiParam({ name: 'communityId', description: 'ID of the community' })
    @ApiParam({ name: 'slug', description: 'Page slug' })
    @ApiResponse({ status: 200, description: 'Page details returned' })
    @ApiResponse({ status: 404, description: 'Page not found' })
    async getBySlug(
        @Param('communityId') communityId: string,
        @Param('slug') slug: string,
    ) {
        return this.getPageDetailUseCase.execute(communityId, slug);
    }

    @Patch(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a page' })
    @ApiParam({ name: 'communityId', description: 'ID of the community' })
    @ApiParam({ name: 'id', description: 'ID of the page' })
    @ApiResponse({ status: 200, description: 'Page updated successfully' })
    @ApiResponse({ status: 404, description: 'Page not found' })
    async update(
        @Param('communityId') communityId: string,
        @Param('id') id: string,
        @Body() updatePageDto: UpdatePageDto,
    ) {
        return this.updatePageUseCase.execute(communityId, id, updatePageDto);
    }
}

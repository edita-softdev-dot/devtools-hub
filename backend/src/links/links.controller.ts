import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { Public } from '../auth/decorators/public.decorator';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { LinksService } from './links.service';

interface AuthenticatedRequest extends ExpressRequest {
  user: { id: string; email: string; role: string };
}

@ApiTags('Links')
@Controller('links')
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all active links (public)' })
  @ApiResponse({
    status: 200,
    description: 'Returns active links grouped by category',
  })
  async getPublicLinks() {
    return this.linksService.getPublicLinks();
  }

  @Get('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all links including inactive (admin)' })
  @ApiResponse({ status: 200, description: 'Returns all links' })
  async getAllLinks() {
    return this.linksService.getAllLinks();
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single link by ID' })
  @ApiResponse({ status: 200, description: 'Returns the link' })
  @ApiResponse({ status: 404, description: 'Link not found' })
  async getLinkById(@Param('id') id: string) {
    return this.linksService.getLinkById(id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new link' })
  @ApiResponse({ status: 201, description: 'Link created successfully' })
  async createLink(
    @Body() dto: CreateLinkDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.linksService.createLink(dto, req.user.id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing link' })
  @ApiResponse({ status: 200, description: 'Link updated successfully' })
  @ApiResponse({ status: 404, description: 'Link not found' })
  async updateLink(@Param('id') id: string, @Body() dto: UpdateLinkDto) {
    return this.linksService.updateLink(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a link' })
  @ApiResponse({ status: 204, description: 'Link deleted successfully' })
  @ApiResponse({ status: 404, description: 'Link not found' })
  async deleteLink(@Param('id') id: string) {
    return this.linksService.deleteLink(id);
  }
}

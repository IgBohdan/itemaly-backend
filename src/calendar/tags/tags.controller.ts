import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateTagDto, UpdateTagDto } from '../dto/tag.dto';
import { TagsService } from './tags.service';

@ApiBearerAuth()
@ApiTags('Tags')
@UseGuards(JwtAuthGuard)
@Controller('calendar/tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiResponse({
    status: 201,
    description: 'The tag has been successfully created.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({ type: CreateTagDto })
  async create(@Body() createTagDto: CreateTagDto, @Req() req) {
    // req.user from JWT strategy contains { userId, email }
    // We need to get the full User entity
    const user = await this.tagsService.getUserById(req.user.userId);
    return this.tagsService.create(createTagDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tags for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Return all tags.' })
  findAll(@Req() req) {
    return this.tagsService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a single tag by ID for the authenticated user',
  })
  @ApiParam({ name: 'id', description: 'ID of the tag to retrieve' })
  @ApiResponse({ status: 200, description: 'Return the tag.' })
  @ApiResponse({ status: 404, description: 'Tag not found.' })
  findOne(@Param('id') id: string, @Req() req) {
    return this.tagsService.findOne(+id, req.user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a tag by ID for the authenticated user' })
  @ApiParam({ name: 'id', description: 'ID of the tag to update' })
  @ApiBody({ type: UpdateTagDto })
  @ApiResponse({
    status: 200,
    description: 'The tag has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Tag not found.' })
  update(
    @Param('id') id: string,
    @Body() updateTagDto: UpdateTagDto,
    @Req() req,
  ) {
    return this.tagsService.update(+id, updateTagDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tag by ID for the authenticated user' })
  @ApiParam({ name: 'id', description: 'ID of the tag to delete' })
  @ApiResponse({
    status: 204,
    description: 'The tag has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Tag not found.' })
  remove(@Param('id') id: string, @Req() req) {
    return this.tagsService.remove(+id, req.user.userId);
  }
}

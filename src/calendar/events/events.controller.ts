import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from '../dto/event.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Events')
@UseGuards(JwtAuthGuard)
@Controller('calendar/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({ status: 201, description: 'The event has been successfully created.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({ type: CreateEventDto })
  async create(@Body() createEventDto: CreateEventDto, @Req() req) {
    // req.user from JWT strategy contains { userId, email }
    // We need to get the full User entity
    const user = await this.eventsService.getUserById(req.user.userId);
    return this.eventsService.create(createEventDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all events for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Return all events.' })
  findAll(@Req() req) {
    return this.eventsService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single event by ID for the authenticated user' })
  @ApiParam({ name: 'id', description: 'ID of the event to retrieve' })
  @ApiResponse({ status: 200, description: 'Return the event.' })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  findOne(@Param('id') id: string, @Req() req) {
    return this.eventsService.findOne(+id, req.user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an event by ID for the authenticated user' })
  @ApiParam({ name: 'id', description: 'ID of the event to update' })
  @ApiBody({ type: UpdateEventDto })
  @ApiResponse({ status: 200, description: 'The event has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  @ApiResponse({ status: 409, description: 'Conflict with an existing event.' })
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Req() req,
  ) {
    return this.eventsService.update(+id, updateEventDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an event by ID for the authenticated user' })
  @ApiParam({ name: 'id', description: 'ID of the event to delete' })
  @ApiResponse({ status: 204, description: 'The event has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  remove(@Param('id') id: string, @Req() req) {
    return this.eventsService.remove(+id, req.user.userId);
  }
}

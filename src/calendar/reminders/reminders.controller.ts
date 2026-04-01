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
import { CreateReminderDto, UpdateReminderDto } from '../dto/event.dto';
import { RemindersService } from './reminders.service';

@ApiBearerAuth()
@ApiTags('Reminders')
@UseGuards(JwtAuthGuard)
@Controller('calendar/events/:eventId/reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new reminder for an event' })
  @ApiParam({ name: 'eventId', description: 'ID of the event' })
  @ApiResponse({
    status: 201,
    description: 'The reminder has been successfully created.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({ type: CreateReminderDto })
  async create(
    @Param('eventId') eventId: string,
    @Body() createReminderDto: CreateReminderDto,
    @Req() req,
  ) {
    // req.user from JWT strategy contains { userId, email }
    // We need to get the full User entity
    const user = await this.remindersService.getUserById(req.user.userId);
    return this.remindersService.create(+eventId, createReminderDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reminders for a specific event' })
  @ApiParam({ name: 'eventId', description: 'ID of the event' })
  @ApiResponse({
    status: 200,
    description: 'Return all reminders for the event.',
  })
  findAll(@Param('eventId') eventId: string, @Req() req) {
    return this.remindersService.findAll(+eventId, req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single reminder by ID for a specific event' })
  @ApiParam({ name: 'eventId', description: 'ID of the event' })
  @ApiParam({ name: 'id', description: 'ID of the reminder to retrieve' })
  @ApiResponse({ status: 200, description: 'Return the reminder.' })
  @ApiResponse({ status: 404, description: 'Reminder not found.' })
  findOne(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Req() req,
  ) {
    return this.remindersService.findOne(+id, +eventId, req.user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a reminder by ID for a specific event' })
  @ApiParam({ name: 'eventId', description: 'ID of the event' })
  @ApiParam({ name: 'id', description: 'ID of the reminder to update' })
  @ApiBody({ type: UpdateReminderDto })
  @ApiResponse({
    status: 200,
    description: 'The reminder has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Reminder not found.' })
  update(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Body() updateReminderDto: UpdateReminderDto,
    @Req() req,
  ) {
    return this.remindersService.update(
      +id,
      +eventId,
      updateReminderDto,
      req.user.userId,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a reminder by ID for a specific event' })
  @ApiParam({ name: 'eventId', description: 'ID of the event' })
  @ApiParam({ name: 'id', description: 'ID of the reminder to delete' })
  @ApiResponse({
    status: 204,
    description: 'The reminder has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Reminder not found.' })
  remove(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Req() req,
  ) {
    return this.remindersService.remove(+id, +eventId, req.user.userId);
  }
}

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
import { CreateRecurrenceDto, UpdateRecurrenceDto } from '../dto/event.dto';
import { RecurrenceService } from './recurrence.service';

@ApiBearerAuth()
@ApiTags('Recurrence')
@UseGuards(JwtAuthGuard)
@Controller('calendar/events/:eventId/recurrence')
export class RecurrenceController {
  constructor(private readonly recurrenceService: RecurrenceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a recurrence rule for an event' })
  @ApiParam({ name: 'eventId', description: 'ID of the event' })
  @ApiResponse({
    status: 201,
    description: 'The recurrence rule has been successfully created.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({ type: CreateRecurrenceDto })
  async create(
    @Param('eventId') eventId: string,
    @Body() createRecurrenceDto: CreateRecurrenceDto,
    @Req() req,
  ) {
    // req.user from JWT strategy contains { userId, email }
    // We need to get the full User entity
    const user = await this.recurrenceService.getUserById(req.user.userId);
    return this.recurrenceService.create(+eventId, createRecurrenceDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get the recurrence rule for a specific event' })
  @ApiParam({ name: 'eventId', description: 'ID of the event' })
  @ApiResponse({ status: 200, description: 'Return the recurrence rule.' })
  @ApiResponse({ status: 404, description: 'Recurrence rule not found.' })
  findOne(@Param('eventId') eventId: string, @Req() req) {
    return this.recurrenceService.findOne(+eventId, req.user.userId);
  }

  @Put()
  @ApiOperation({ summary: 'Update the recurrence rule for a specific event' })
  @ApiParam({ name: 'eventId', description: 'ID of the event' })
  @ApiBody({ type: UpdateRecurrenceDto })
  @ApiResponse({
    status: 200,
    description: 'The recurrence rule has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Recurrence rule not found.' })
  update(
    @Param('eventId') eventId: string,
    @Body() updateRecurrenceDto: UpdateRecurrenceDto,
    @Req() req,
  ) {
    return this.recurrenceService.update(
      +eventId,
      updateRecurrenceDto,
      req.user.userId,
    );
  }

  @Delete()
  @ApiOperation({ summary: 'Delete the recurrence rule for a specific event' })
  @ApiParam({ name: 'eventId', description: 'ID of the event' })
  @ApiResponse({
    status: 204,
    description: 'The recurrence rule has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Recurrence rule not found.' })
  remove(@Param('eventId') eventId: string, @Req() req) {
    return this.recurrenceService.remove(+eventId, req.user.userId);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateEventDto } from 'src/calendar/dto/event.dto';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/')
  create(@Req() req, @Body() body: any) {
    console.log(body);
    return this.eventsService.create(
      req.user.userId,
      body.title,
      new Date(body.startDateTime),
      new Date(body.endDateTime),
      body.categoryId,
      body.description,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req) {
    return this.eventsService.findAll(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    return this.eventsService.findById(req.user.userId, +id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Req() req, @Param('id') id: string, @Body() data: UpdateEventDto) {
    return this.eventsService.update(+id, data, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    return this.eventsService.remove(req.user.userId, +id);
  }
}

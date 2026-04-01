import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req) {
    return this.notificationsService.findAll(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/read')
  markAsRead(@Req() req, @Param('id') id: string) {
    return this.notificationsService.markAsRead(+id, req.user.userId);
  }
}

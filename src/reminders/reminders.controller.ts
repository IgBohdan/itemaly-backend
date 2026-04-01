import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RemindersService } from './reminders.service';

@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @UseGuards(JwtAuthGuard)
  @Post('send-test')
  async sendTest(@Req() req, @Body('message') message: string) {
    const user = req.user;
    await this.remindersService.sendEmail(user.email, 'Test Reminder', message);
    return { message: 'Test email sent' };
  }
}

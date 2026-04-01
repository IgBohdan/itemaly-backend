import { Module } from '@nestjs/common';
import { EventsModule } from 'src/events/events.module';
import { RemindersController } from './reminders.controller';
import { RemindersService } from './reminders.service';

@Module({
  imports: [EventsModule],
  providers: [RemindersService],
  controllers: [RemindersController],
})
export class RemindersModule {}

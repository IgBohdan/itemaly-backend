// src/calendar/dto/tag.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ description: 'Назва тегу' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Колір тегу у HEX' })
  @IsOptional()
  @IsString()
  color?: string;
}

export class UpdateTagDto extends CreateTagDto {}

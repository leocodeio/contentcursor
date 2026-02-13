import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class BaseDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @IsDateString()
  @IsOptional()
  createdAt?: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @IsDateString()
  @IsOptional()
  updatedAt?: Date;
}

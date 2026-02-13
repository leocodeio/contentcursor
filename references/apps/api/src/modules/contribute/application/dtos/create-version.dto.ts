import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVersionDto {
  @ApiProperty({
    description: 'Title of the contribution version',
    example: 'Updated Gaming Montage v2',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Description of the contribution version',
    example: 'This is an updated version with better transitions...',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Tags for the video (comma-separated)',
    example: 'gaming,montage,entertainment,updated',
  })
  @IsString()
  @IsNotEmpty()
  tags: string;
}

import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadVideoDto {
  @ApiProperty({
    description: 'The name of the Drive folder to upload the video to.',
    example: 'my-video-folder',
  })
  @IsString()
  @IsNotEmpty()
  folderName: string;

  @ApiProperty({
    description: 'The subfolder path within the main folder (optional).',
    required: false,
    example: 'users/videos',
  })
  @IsString()
  @IsOptional()
  folder?: string;

  @ApiProperty({
    description:
      'The desired file name (optional). If not provided, a unique name will be generated.',
    required: false,
    example: 'video-123.mp4',
  })
  @IsString()
  @IsOptional()
  fileName?: string;
}

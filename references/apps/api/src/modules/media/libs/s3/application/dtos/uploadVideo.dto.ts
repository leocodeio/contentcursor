import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadVideoDto {
  @ApiProperty({
    description: 'The name of the S3 bucket to upload the video to.',
    example: 'my-video-bucket',
  })
  @IsString()
  @IsNotEmpty()
  bucketName: string; // Make bucketName required

  @ApiProperty({
    description: 'The folder path within the bucket (optional).',
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
    example: 'my-awesome-video.mp4',
  })
  @IsString()
  @IsOptional()
  fileName?: string;
}

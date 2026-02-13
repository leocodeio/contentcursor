import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadImageDto {
  @ApiProperty({
    description: 'The name of the S3 bucket to upload the image to.',
    example: 'my-image-bucket',
  })
  @IsString()
  @IsNotEmpty()
  bucketName: string;

  @ApiProperty({
    description: 'The folder path within the bucket (optional).',
    required: false,
    example: 'users/profile-pictures',
  })
  @IsString()
  @IsOptional()
  folder?: string;

  @ApiProperty({
    description:
      'The desired file name (optional). If not provided, a unique name will be generated.',
    required: false,
    example: 'profile-picture.jpg',
  })
  @IsString()
  @IsOptional()
  fileName?: string;
}

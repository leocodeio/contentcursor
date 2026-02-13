import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadImageDto {
  @ApiProperty({
    description: 'The name of the Drive folder to upload the image to.',
    example: 'my-image-folder',
  })
  @IsString()
  @IsNotEmpty()
  folderName: string;

  @ApiProperty({
    description: 'The subfolder path within the main folder (optional).',
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

import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateFolderDto {
  @ApiProperty({
    description: 'Folder name',
    example: 'My Updated Videos',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Editor user ID',
    example: 'user_789',
    required: false,
  })
  @IsOptional()
  @IsString()
  editorId?: string;
}

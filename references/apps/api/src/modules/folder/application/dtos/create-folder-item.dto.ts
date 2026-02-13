import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateFolderItemDto {
  @ApiProperty({ description: 'Folder ID', required: true })
  @IsString()
  @IsNotEmpty()
  folderId: string;

  @ApiProperty({ description: 'Media ID', required: true })
  @IsString()
  @IsNotEmpty()
  mediaId: string;
}

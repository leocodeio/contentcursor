import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class GetFolderItemsDto {
  @ApiProperty({
    description: 'Creator ID',
    example: 'cln1234567890',
  })
  @IsString()
  @IsNotEmpty()
  creatorId: string;

  @ApiProperty({
    description: 'Editor ID',
    example: 'cln0987654321',
  })
  @IsString()
  @IsNotEmpty()
  editorId: string;

  @ApiProperty({
    description: 'Account ID',
    example: 'cln1111222233',
  })
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @ApiProperty({
    description: 'Folder name',
    example: 'my-folder',
  })
  @IsString()
  @IsNotEmpty()
  folderName: string;
}

export class FolderItemResponseDto {
  @ApiProperty({
    description: 'Folder item ID',
    example: 'cln1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'Folder ID',
    example: 'cln0987654321',
  })
  folderId: string;

  @ApiProperty({
    description: 'Media ID',
    example: 'cln1111222233',
  })
  mediaId: string;

  @ApiProperty({
    description: 'Media details',
  })
  media: {
    id: string;
    type: string;
    integrationUrl?: string | null;
    integrationKey?: string | null;
    createdAt: Date;
    updatedAt: Date;
  };

  @ApiProperty({
    description: 'Created at timestamp',
    example: '2024-01-01T00:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Updated at timestamp',
    example: '2024-01-01T00:00:00Z',
  })
  updatedAt: Date;
}

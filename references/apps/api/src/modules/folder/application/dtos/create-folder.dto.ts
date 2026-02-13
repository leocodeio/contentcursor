import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFolderDto {
  name: string;
  editorId: string;
  creatorId: string;
  accountId: string;
}

export class CreateFolderByCreatorDto {
  @ApiProperty({
    description: 'Folder name',
    example: 'My Videos',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Editor user ID',
    example: 'user_456',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  editorId: string;

  @ApiProperty({
    description: 'Account ID',
    example: 'account_123',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  accountId: string;
}

export class CreateFolderByEditorDto {
  @ApiProperty({
    description: 'Folder name',
    example: 'My Videos',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Creator user ID',
    example: 'user_123',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  creatorId: string;

  @ApiProperty({
    description: 'Account ID',
    example: 'account_123',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  accountId: string;
}

import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetFoldersByEditorDto {
  @ApiProperty({
    description: 'Account ID to get folders for',
    example: 'account_123',
  })
  @IsString()
  @IsNotEmpty()
  accountId: string;
}

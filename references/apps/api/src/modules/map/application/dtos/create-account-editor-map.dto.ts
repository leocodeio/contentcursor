import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { xAccountEditorMapStatusType } from '@spectral/types';

export class CreateAccountEditorMapDto {
  @ApiProperty({ description: 'Account ID', required: true })
  @IsNotEmpty()
  @IsString()
  accountId: string;

  @ApiProperty({ description: 'Editor ID', required: true })
  @IsNotEmpty()
  @IsString()
  editorId: string;

  @ApiProperty({
    description: 'Status of the mapping',
    required: false,
  })
  status?: xAccountEditorMapStatusType = 'ACTIVE';
}

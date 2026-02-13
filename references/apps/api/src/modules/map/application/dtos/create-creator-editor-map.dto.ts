import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { xCreatorEditorMapStatusType } from '@spectral/types';

export class CreateCreatorEditorMapDto {
  @ApiProperty({ description: 'Creator ID', required: true })
  @IsNotEmpty()
  @IsString()
  creatorId: string;

  @ApiProperty({ description: 'Editor ID', required: true })
  @IsNotEmpty()
  @IsString()
  editorId: string;

  @ApiProperty({
    description: 'Status of the mapping',
    required: false,
  })
  status?: xCreatorEditorMapStatusType = 'ACTIVE';
}

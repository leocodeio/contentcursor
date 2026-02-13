import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { xAccountEditorMapStatusType } from '@spectral/types';

export class UpdateAccountEditorMapDto {
  @ApiProperty({
    description: 'Status of the mapping',
    required: false,
  })
  @IsOptional()
  status?: xAccountEditorMapStatusType;
}

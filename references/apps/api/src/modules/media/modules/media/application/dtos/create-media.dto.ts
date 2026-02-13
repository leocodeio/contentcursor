import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { xMediaType } from '../../domain/enums/media-type.enum';

export class CreateMediaDto {
  @ApiProperty({ description: 'Media type', required: true })
  @IsString()
  @IsNotEmpty()
  type: xMediaType;

  @ApiProperty({
    description: 'Folder ID to associate media with',
    required: false,
  })
  @IsOptional()
  @IsString()
  folderId: string;
}

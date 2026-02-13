import { IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { xContributionVersionStatusType } from '@spectral/types';

export class UpdateVersionStatusDto {
  @ApiProperty({
    description: 'Status of the contribution version',
    enum: ['PENDING', 'COMPLETED', 'REJECTED'],
    example: 'COMPLETED',
  })
  @IsEnum(['PENDING', 'COMPLETED', 'REJECTED'])
  @IsNotEmpty()
  status: xContributionVersionStatusType;
}

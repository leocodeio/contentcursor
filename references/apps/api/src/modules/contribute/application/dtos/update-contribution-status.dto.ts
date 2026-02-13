import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum } from 'class-validator';
import { xContributeStatusType } from '@spectral/types';

export class UpdateContributionStatusDto {
  @ApiProperty({
    description: 'New status for the contribution',
    example: 'COMPLETED',
    enum: ['PENDING', 'COMPLETED', 'REJECTED'],
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(['PENDING', 'COMPLETED', 'REJECTED'])
  status: xContributeStatusType;
}

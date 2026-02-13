import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray } from 'class-validator';
import { xContributeStatusType } from '@spectral/types';

export class CreateContributionDto {
  @ApiProperty({
    description: 'Account ID where contribution is made',
    example: 'account_123',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  accountId: string;

  @ApiProperty({
    description: 'Video title',
    example: 'Amazing Gaming Montage',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Video description',
    example: 'This is an amazing gaming montage featuring...',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Video tags',
    example: 'gaming,montage,entertainment',
    required: true,
    type: String,
  })
  @IsString()
  tags: string;
}

import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVersionCommentDto {
  @ApiProperty({
    description: 'Content of the comment',
    example: 'This version looks much better than the previous one!',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}

import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Req,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiSecurity,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { ContributeService } from '../../application/services/contribute.service';
import {
  CreateContributionDto,
  UpdateContributionStatusDto,
  CreateVersionDto,
  UpdateVersionStatusDto,
  CreateVersionCommentDto,
} from '../../application/dtos';
import { Roles } from 'src/utilities/auth/decorator/role/role.decorator';
import {
  xDomainContribute,
  xDomainContributionVersion,
  xDomainVersionComment,
} from '@spectral/types';

@ApiTags('contributions')
@ApiSecurity('x-api-key')
@ApiSecurity('Authorization')
@Controller('contributions')
export class ContributeController {
  constructor(private readonly contributeService: ContributeService) {}

  @Post()
  @Roles('editor')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'video', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create a new contribution with video and thumbnail upload',
    description:
      'Uploads video and thumbnail files using resumable upload and creates a contribution entry',
  })
  @ApiResponse({
    status: 201,
    description: 'Contribution created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid input data or missing files',
  })
  @ApiBody({
    description: 'Create a contribution with video and thumbnail files',
    schema: {
      type: 'object',
      properties: {
        video: {
          type: 'string',
          format: 'binary',
          description: 'Video file to upload',
        },
        thumbnail: {
          type: 'string',
          format: 'binary',
          description: 'Thumbnail image file to upload',
        },
        accountId: {
          type: 'string',
          example: 'account_123',
          description: 'Account ID where contribution is made',
        },
        title: {
          type: 'string',
          example: 'Amazing Gaming Montage',
          description: 'Video title',
        },
        description: {
          type: 'string',
          example: 'This is an amazing gaming montage featuring...',
          description: 'Video description',
        },
        tags: {
          type: 'string',
          example: 'gaming,montage,entertainment',
          description: 'Video tags',
        },
      },
      required: [
        'video',
        'thumbnail',
        'accountId',
        'title',
        'description',
        'tags',
      ],
    },
  })
  async createContribution(
    @UploadedFiles()
    files: { video?: Express.Multer.File[]; thumbnail?: Express.Multer.File[] },
    @Body() createContributionDto: CreateContributionDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<xDomainContribute> {
    // console.log('Controller: Received file upload request');
    // console.log(
    // `Video file: ${files.video?.[0]?.originalname} (${files.video?.[0]?.size} bytes)`,
    // );
    // console.log(
    // `Thumbnail file: ${files.thumbnail?.[0]?.originalname} (${files.thumbnail?.[0]?.size} bytes)`,
    // );

    if (!files.video || !files.video[0]) {
      throw new BadRequestException('Video file is required');
    }
    if (!files.thumbnail || !files.thumbnail[0]) {
      throw new BadRequestException('Thumbnail file is required');
    }

    // console.log('Controller: Files validated, forwarding to service');
    const videoFile = files.video[0];
    const thumbnailFile = files.thumbnail[0];
    const editorId = req.user.id;

    try {
      const contribution = await this.contributeService.createContribution(
        videoFile,
        thumbnailFile,
        createContributionDto,
        editorId,
      );
      // console.log(
      //   'Controller: Contribution created successfully',
      //   contribution.id,
      // );
      return contribution;
    } catch (error) {
      console.error('Controller: Error creating contribution:', error);
      throw error;
    }
  }

  @Get('account/:accountId')
  @Roles('creator', 'editor')
  @ApiOperation({ summary: 'Get all contributions for an account' })
  @ApiResponse({
    status: 200,
    description: 'Contributions retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Contributions not found',
  })
  async getContributionsByAccountId(
    @Param('accountId') accountId: string,
  ): Promise<xDomainContribute[]> {
    const contributions =
      await this.contributeService.getContributionsByAccountId(accountId);
    return contributions;
  }


  @Get(':id')
  @Roles('creator', 'editor')
  @ApiOperation({ summary: 'Get contribution by ID' })
  @ApiResponse({
    status: 200,
    description: 'Contribution retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Contribution not found',
  })
  async getContributionById(
    @Param('id') id: string,
  ): Promise<xDomainContribute> {
    const contribution = await this.contributeService.getContributionById(id);
    return contribution;
  }

  // Versioning endpoints
  @Post(':id/versions')
  @Roles('editor')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'video', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create a new version of a contribution',
    description:
      'Upload new video and thumbnail files and create a new version',
  })
  @ApiResponse({
    status: 201,
    description: 'Version created successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Contribution not found',
  })
  @ApiBody({
    description: 'Create a version with video and thumbnail files',
    schema: {
      type: 'object',
      properties: {
        video: {
          type: 'string',
          format: 'binary',
          description: 'Video file to upload',
        },
        thumbnail: {
          type: 'string',
          format: 'binary',
          description: 'Thumbnail image file to upload',
        },
        title: {
          type: 'string',
          example: 'Updated Gaming Montage v2',
          description: 'Version title',
        },
        description: {
          type: 'string',
          example: 'This version has better transitions...',
          description: 'Version description',
        },
        tags: {
          type: 'string',
          example: 'gaming,montage,updated',
          description: 'Version tags',
        },
      },
      required: ['video', 'thumbnail', 'title', 'description', 'tags'],
    },
  })
  async createVersion(
    @Param('id') contributeId: string,
    @UploadedFiles()
    files: { video?: Express.Multer.File[]; thumbnail?: Express.Multer.File[] },
    @Body() createVersionDto: CreateVersionDto,
  ): Promise<xDomainContributionVersion> {
    if (!files.video || !files.video[0]) {
      throw new BadRequestException('Video file is required');
    }
    if (!files.thumbnail || !files.thumbnail[0]) {
      throw new BadRequestException('Thumbnail file is required');
    }

    const videoFile = files.video[0];
    const thumbnailFile = files.thumbnail[0];

    const version = await this.contributeService.createVersion(
      contributeId,
      videoFile,
      thumbnailFile,
      createVersionDto,
    );
    return version;
  }

  @Get(':id/versions')
  @Roles('creator', 'editor')
  @ApiOperation({ summary: 'Get all versions of a contribution' })
  @ApiResponse({
    status: 200,
    description: 'Versions retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Contribution not found',
  })
  async getVersionsByContributionId(
    @Param('id') contributeId: string,
  ): Promise<xDomainContributionVersion[]> {
    return await this.contributeService.getVersionsByContributionId(
      contributeId,
    );
  }

  @Put('versions/:versionId/status')
  @Roles('creator')
  @ApiOperation({
    summary: 'Update version status (accept, reject)',
    description:
      'When accepting a version, all other versions will be automatically rejected',
  })
  @ApiBody({ type: UpdateVersionStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Version status updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Version not found',
  })
  async updateVersionStatus(
    @Param('versionId') versionId: string,
    @Body() updateStatusDto: UpdateVersionStatusDto,
  ): Promise<xDomainContributionVersion> {
    return await this.contributeService.updateVersionStatus(
      versionId,
      updateStatusDto,
    );
  }

  @Get('versions/:versionId')
  @Roles('creator', 'editor')
  @ApiOperation({ summary: 'Get version by ID' })
  @ApiResponse({
    status: 200,
    description: 'Version retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Version not found',
  })
  async getVersionById(
    @Param('versionId') versionId: string,
  ): Promise<xDomainContributionVersion> {
    return await this.contributeService.getVersionById(versionId);
  }

  @Post('versions/:versionId/comments')
  @Roles('creator', 'editor')
  @ApiOperation({ summary: 'Add comment to a version' })
  @ApiBody({ type: CreateVersionCommentDto })
  @ApiResponse({
    status: 201,
    description: 'Comment created successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Version not found',
  })
  async createVersionComment(
    @Param('versionId') versionId: string,
    @Body() createCommentDto: CreateVersionCommentDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<xDomainVersionComment> {
    const authorId = req.user.id;
    return await this.contributeService.createVersionComment(
      versionId,
      createCommentDto,
      authorId,
    );
  }

  @Get('versions/:versionId/comments')
  @Roles('creator', 'editor')
  @ApiOperation({ summary: 'Get comments for a version' })
  @ApiResponse({
    status: 200,
    description: 'Comments retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Version not found',
  })
  async getVersionComments(
    @Param('versionId') versionId: string,
  ): Promise<xDomainVersionComment[]> {
    return await this.contributeService.getVersionComments(versionId);
  }
}

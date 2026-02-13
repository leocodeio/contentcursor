import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  IContributePort,
  CreateContributeData,
  CreateVersionData,
  UpdateVersionStatusData,
  CreateVersionCommentData,
} from '../../domain/ports/contribute.port';
import {
  xDomainContribute,
  xDomainContributionVersion,
  xDomainVersionComment,
} from '@spectral/types';
import {
  CreateContributionDto,
  UpdateContributionStatusDto,
  CreateVersionDto,
  UpdateVersionStatusDto,
  CreateVersionCommentDto,
} from '../dtos';
import { MediaService } from '../../../media/modules/media/application/services/media.service';
import { xContributeStatusType } from '@spectral/types';
import { YtAuthService } from 'src/modules/yt_int/modules/youtube/application/services/yt-auth.service';

@Injectable()
export class ContributeService {
  constructor(
    private readonly contributePort: IContributePort,
    private readonly mediaService: MediaService,
    private readonly ytAuthService: YtAuthService,
  ) {}

  async createContribution(
    videoFile: Express.Multer.File,
    thumbnailFile: Express.Multer.File,
    createContributionDto: CreateContributionDto,
    editorId: string,
  ): Promise<xDomainContribute> {
    console.log('Service: Starting contribution creation process');

    try {
      // Create video media entry using media service
      // console.log(
      //   `Service: Uploading video file (${videoFile.size} bytes) to media service`,
      // );
      const videoMedia = await this.mediaService.createWithoutFolder(
        { type: 'VIDEO' },
        videoFile,
      );
      // console.log(`Service: Video media created with ID: ${videoMedia.id}`);

      // Create thumbnail media entry using media service
      // console.log(
      //   `Service: Uploading thumbnail file (${thumbnailFile.size} bytes) to media service`,
      // );
      const thumbnailMedia = await this.mediaService.createWithoutFolder(
        { type: 'IMAGE' },
        thumbnailFile,
      );
      // console.log(
      //   `Service: Thumbnail media created with ID: ${thumbnailMedia.id}`,
      // );

      const duration = this.mediaService.getDuration(videoFile);
      console.log(`Service: Video duration calculated: ${duration}`);

      // Create contribution entry
      const contributionData: CreateContributeData = {
        accountId: createContributionDto.accountId,
        editorId: editorId,
        videoId: videoMedia.id,
        thumbnailId: thumbnailMedia.id,
        title: createContributionDto.title,
        description: createContributionDto.description,
        tags: createContributionDto.tags.split(','),
        duration: duration,
      };

      // console.log('Service: Creating contribution database entry');
      const contribution =
        await this.contributePort.createContribution(contributionData);
      // console.log(
      //   `Service: Contribution creation completed successfully with ID: ${contribution.id}`,
      // );
      return contribution;
    } catch (error) {
      console.error('Service: Error during contribution creation:', error);
      throw error;
    }
  }

  async getContributionsByAccountId(
    accountId: string,
  ): Promise<xDomainContribute[]> {
    try {
      const contributions =
        await this.contributePort.getContributionsByAccountId(accountId);
      return contributions;
    } catch {
      throw new NotFoundException(
        'Contributions not found for the given account',
      );
    }
  }

  async getContributionById(id: string): Promise<xDomainContribute> {
    const contribution = await this.contributePort.getContributionById(id);
    if (!contribution) {
      throw new NotFoundException('Contribution not found');
    }
    return contribution;
  }

  // Versioning methods
  async createVersion(
    contributeId: string,
    videoFile: Express.Multer.File,
    thumbnailFile: Express.Multer.File,
    createVersionDto: CreateVersionDto,
  ): Promise<xDomainContributionVersion> {
    // Check if contribution exists
    const contribution =
      await this.contributePort.getContributionById(contributeId);
    if (!contribution) {
      throw new NotFoundException('Contribution not found');
    }

    try {
      // Create video media entry using media service
      const videoMedia = await this.mediaService.createWithoutFolder(
        { type: 'VIDEO' },
        videoFile,
      );

      // Create thumbnail media entry using media service
      const thumbnailMedia = await this.mediaService.createWithoutFolder(
        { type: 'IMAGE' },
        thumbnailFile,
      );

      const duration = this.mediaService.getDuration(videoFile);

      // Create version entry
      const versionData: CreateVersionData = {
        contributeId: contributeId,
        title: createVersionDto.title,
        description: createVersionDto.description,
        tags: createVersionDto.tags.split(','),
        videoId: videoMedia.id,
        thumbnailId: thumbnailMedia.id,
        duration: duration,
      };

      const version = await this.contributePort.createVersion(versionData);
      return version;
    } catch (error) {
      console.error('Service: Error during version creation:', error);
      throw error;
    }
  }

  async getVersionsByContributionId(
    contributeId: string,
  ): Promise<xDomainContributionVersion[]> {
    // Check if contribution exists
    const contribution =
      await this.contributePort.getContributionById(contributeId);
    if (!contribution) {
      throw new NotFoundException('Contribution not found');
    }

    return await this.contributePort.getVersionsByContributionId(contributeId);
  }

  async updateVersionStatus(
    versionId: string,
    updateStatusDto: UpdateVersionStatusDto,
  ): Promise<xDomainContributionVersion> {
    // Check if version exists
    const version = await this.contributePort.getVersionById(versionId);
    if (!version) {
      throw new NotFoundException('Version not found');
    }

    // 1) If contribution gets accepted, we should upload it to the creators youtube
    if (updateStatusDto.status === ('COMPLETED' as xContributeStatusType)) {
      console.log('1. creator accepted shit');
      // 1.1) We should upload it to the creators youtube
      console.log('version', version);
      const ytCreatorId = version.contribute?.account?.id;
      console.log('creator id', ytCreatorId);
      if (!ytCreatorId) {
        throw new NotFoundException('Creator not found');
      }
      console.log('1.1 video url', version.video?.integrationKey);
      const driveVideoId = version.video?.integrationKey;
      if (!driveVideoId) {
        throw new NotFoundException('Video not found');
      }
      console.log('1.2 thumbnail url', version.thumbnail?.integrationKey);
      const driveThumbnailId = version.thumbnail?.integrationKey;
      if (!driveThumbnailId) {
        throw new NotFoundException('Thumbnail not found');
      }
      console.log('1.3 title', version.title);
      const title = version.title;
      const description = version.description;
      const tags = version.tags;
      if (
        !title ||
        !description ||
        !tags ||
        !driveVideoId ||
        !driveThumbnailId
      ) {
        throw new NotFoundException(
          'Title, description, tags, video, or thumbnail not found',
        );
      }

      const privacyStatus = 'public';
      console.log('1.4 privacy status', privacyStatus);
      const uploadResponse =
        await this.ytAuthService.uploadVideoThroughContribution(
          ytCreatorId,
          driveVideoId,
          driveThumbnailId,
          title,
          description,
          tags,
          privacyStatus,
        );
      console.log('1.5 uploadResponse', uploadResponse);

      if (!uploadResponse) {
        // 2) We should update the contribution status to accepted and contiue else,
        throw new InternalServerErrorException(
          'Failed to upload video to youtube',
        );
      }
    }

    const updateData: UpdateVersionStatusData = {
      status: updateStatusDto.status,
    };

    return await this.contributePort.updateVersionStatus(versionId, updateData);
  }

  async getVersionById(versionId: string): Promise<xDomainContributionVersion> {
    const version = await this.contributePort.getVersionById(versionId);
    if (!version) {
      throw new NotFoundException('Version not found');
    }
    return version;
  }

  async createVersionComment(
    versionId: string,
    createCommentDto: CreateVersionCommentDto,
    authorId: string,
  ): Promise<xDomainVersionComment> {
    // Check if version exists
    const version = await this.contributePort.getVersionById(versionId);
    if (!version) {
      throw new NotFoundException('Version not found');
    }

    const commentData: CreateVersionCommentData = {
      versionId: versionId,
      authorId: authorId,
      content: createCommentDto.content,
    };

    return await this.contributePort.createVersionComment(commentData);
  }

  async getVersionComments(
    versionId: string,
  ): Promise<xDomainVersionComment[]> {
    // Check if version exists
    const version = await this.contributePort.getVersionById(versionId);
    if (!version) {
      throw new NotFoundException('Version not found');
    }

    return await this.contributePort.getVersionComments(versionId);
  }
}

export const JOB_TYPES = {
  VIDEO_UPLOAD: 'video_upload',
  VIDEO_PROCESSING: 'video_processing',
  CONTRIBUTION_PROCESSING: 'contribution_processing',
} as const;

export type JobType = (typeof JOB_TYPES)[keyof typeof JOB_TYPES];

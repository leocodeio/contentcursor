/**
 * This file contains the server-side logic for creators to manage contributions.
 */

import { ActionResult } from "~/types/action-result";
import { makeApiRequest } from "../common/common.server";
import { getAccessToken } from "../auth/db.server";
import {
  xDomainContribute,
  xContributeStatusType,
  xDomainContributionVersion,
  xContributionVersionStatusType,
  xDomainVersionComment,
} from "@spectral/types";

const creatorContributeEndpoints = {
  getContributionsByAccount: {
    url: "/contributions/account/:accountId",
    method: "GET",
  },
  getContributionById: {
    url: "/contributions/:id",
    method: "GET",
  },
  getVersionsByContribution: {
    url: "/contributions/:id/versions",
    method: "GET",
  },
  getVersionById: {
    url: "/contributions/versions/:versionId",
    method: "GET",
  },
  updateVersionStatus: {
    url: "/contributions/versions/:versionId/status",
    method: "PUT",
  },
  getVersionComments: {
    url: "/contributions/versions/:versionId/comments",
    method: "GET",
  },
  addVersionComment: {
    url: "/contributions/versions/:versionId/comments",
    method: "POST",
  },
};

// start ------------------------------ getContributionsByAccount ------------------------------
export const getContributionsByAccount = async (
  request: Request,
  accountId: string,
): Promise<ActionResult<xDomainContribute[]>> => {
  const response = await makeApiRequest<any, any>(
    creatorContributeEndpoints.getContributionsByAccount.url,
    {
      method: creatorContributeEndpoints.getContributionsByAccount.method,
      access_token: await getAccessToken(request),
      request: request,
      pathParams: {
        accountId: accountId,
      },
    },
  );

  if (response?.status === 401 || response?.status === 403) {
    return {
      success: false,
      origin: "creator",
      message: "Failed to get contributions due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 404) {
    return {
      success: false,
      origin: "creator",
      message: "Contributions not found",
      data: null,
    };
  } else if (response?.status === 400) {
    return {
      success: false,
      origin: "creator",
      message: "Failed to get contributions due to invalid request",
      data: null,
    };
  } else if (response?.status === 500) {
    return {
      success: false,
      origin: "creator",
      message: "Failed to get contributions due to backend server error",
      data: null,
    };
  }

  const responseData = await response?.json();
  const result: ActionResult<xDomainContribute[]> = {
    success: true,
    origin: "creator",
    message: "Contributions retrieved successfully",
    data: responseData.data,
  };
  return result;
};
// end ------------------------------ getContributionsByAccount ------------------------------

// start ------------------------------ getContributionById ------------------------------
export const getContributionById = async (
  request: Request,
  contributionId: string,
): Promise<ActionResult<xDomainContribute>> => {
  const response = await makeApiRequest<any, any>(
    creatorContributeEndpoints.getContributionById.url,
    {
      method: creatorContributeEndpoints.getContributionById.method,
      access_token: await getAccessToken(request),
      request: request,
      pathParams: {
        id: contributionId,
      },
    },
  );

  if (response?.status === 401 || response?.status === 403) {
    return {
      success: false,
      origin: "creator",
      message: "Failed to get contribution due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 404) {
    return {
      success: false,
      origin: "creator",
      message: "Contribution not found",
      data: null,
    };
  } else if (response?.status === 400) {
    return {
      success: false,
      origin: "creator",
      message: "Failed to get contribution due to invalid request",
      data: null,
    };
  } else if (response?.status === 500) {
    return {
      success: false,
      origin: "creator",
      message: "Failed to get contribution due to backend server error",
      data: null,
    };
  }

  const responseData = await response?.json();
  const result: ActionResult<xDomainContribute> = {
    success: true,
    origin: "creator",
    message: "Contribution retrieved successfully",
    data: responseData.data,
  };
  return result;
};
// end ------------------------------ getContributionById ------------------------------

// start ------------------------------ getVersionsByContribution ------------------------------
export const getVersionsByContribution = async (
  request: Request,
  contributionId: string,
): Promise<ActionResult<xDomainContributionVersion[]>> => {
  const response = await makeApiRequest<any, any>(
    creatorContributeEndpoints.getVersionsByContribution.url,
    {
      method: creatorContributeEndpoints.getVersionsByContribution.method,
      access_token: await getAccessToken(request),
      request: request,
      pathParams: {
        id: contributionId,
      },
    },
  );

  if (response?.status === 401 || response?.status === 403) {
    return {
      success: false,
      origin: "creator",
      message: "Failed to get versions due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 404) {
    return {
      success: false,
      origin: "creator",
      message: "Versions not found",
      data: null,
    };
  } else if (response?.status === 400) {
    return {
      success: false,
      origin: "creator",
      message: "Failed to get versions due to invalid request",
      data: null,
    };
  } else if (response?.status === 500) {
    return {
      success: false,
      origin: "creator",
      message: "Failed to get versions due to backend server error",
      data: null,
    };
  }

  const responseData = await response?.json();
  const result: ActionResult<xDomainContributionVersion[]> = {
    success: true,
    origin: "creator",
    message: "Versions retrieved successfully",
    data: responseData.data,
  };
  return result;
};
// end ------------------------------ getVersionsByContribution ------------------------------

// start ------------------------------ updateVersionStatus ------------------------------
export const updateVersionStatus = async (
  request: Request,
  versionId: string,
  status: xContributionVersionStatusType,
): Promise<ActionResult<xDomainContributionVersion>> => {
  const response = await makeApiRequest<any, any>(
    creatorContributeEndpoints.updateVersionStatus.url,
    {
      method: creatorContributeEndpoints.updateVersionStatus.method,
      access_token: await getAccessToken(request),
      request: request,
      pathParams: {
        versionId: versionId,
      },
      body: { status },
    },
  );

  if (response?.status === 401 || response?.status === 403) {
    return {
      success: false,
      origin: "creator",
      message: "Failed to update version status due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 404) {
    return {
      success: false,
      origin: "creator",
      message: "Version not found",
      data: null,
    };
  } else if (response?.status === 400) {
    return {
      success: false,
      origin: "creator",
      message: "Failed to update version status due to invalid request",
      data: null,
    };
  } else if (response?.status === 500) {
    return {
      success: false,
      origin: "creator",
      message: "Failed to update version status due to backend server error",
      data: null,
    };
  }

  const responseData = await response?.json();
  const result: ActionResult<xDomainContributionVersion> = {
    success: true,
    origin: "creator",
    message: "Version status updated successfully",
    data: responseData.data,
  };
  return result;
};
// end ------------------------------ updateVersionStatus ------------------------------

// start ------------------------------ getVersionComments ------------------------------
export const getVersionComments = async (
  request: Request,
  versionId: string,
): Promise<ActionResult<xDomainVersionComment[]>> => {
  const response = await makeApiRequest<any, any>(
    creatorContributeEndpoints.getVersionComments.url,
    {
      method: creatorContributeEndpoints.getVersionComments.method,
      access_token: await getAccessToken(request),
      request: request,
      pathParams: {
        versionId: versionId,
      },
    },
  );

  if (response?.status === 401 || response?.status === 403) {
    return {
      success: false,
      origin: "creator",
      message: "Failed to get comments due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 404) {
    return {
      success: false,
      origin: "creator",
      message: "Comments not found",
      data: null,
    };
  } else if (response?.status === 400) {
    return {
      success: false,
      origin: "creator",
      message: "Failed to get comments due to invalid request",
      data: null,
    };
  } else if (response?.status === 500) {
    return {
      success: false,
      origin: "creator",
      message: "Failed to get comments due to backend server error",
      data: null,
    };
  }

  const responseData = await response?.json();
  const result: ActionResult<xDomainVersionComment[]> = {
    success: true,
    origin: "creator",
    message: "Comments retrieved successfully",
    data: responseData.data,
  };
  return result;
};
// end ------------------------------ getVersionComments ------------------------------

// start ------------------------------ addVersionComment ------------------------------
export const addVersionComment = async (
  request: Request,
  versionId: string,
  content: string,
): Promise<ActionResult<xDomainVersionComment>> => {
  const response = await makeApiRequest<any, any>(
    creatorContributeEndpoints.addVersionComment.url,
    {
      method: creatorContributeEndpoints.addVersionComment.method,
      access_token: await getAccessToken(request),
      request: request,
      pathParams: {
        versionId: versionId,
      },
      body: { content },
    },
  );

  if (response?.status === 401 || response?.status === 403) {
    return {
      success: false,
      origin: "creator",
      message: "Failed to add comment due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 404) {
    return {
      success: false,
      origin: "creator",
      message: "Version not found",
      data: null,
    };
  } else if (response?.status === 400) {
    return {
      success: false,
      origin: "creator",
      message: "Failed to add comment due to invalid request",
      data: null,
    };
  } else if (response?.status === 500) {
    return {
      success: false,
      origin: "creator",
      message: "Failed to add comment due to backend server error",
      data: null,
    };
  }

  const responseData = await response?.json();
  const result: ActionResult<xDomainVersionComment> = {
    success: true,
    origin: "creator",
    message: "Comment added successfully",
    data: responseData.data,
  };
  return result;
};
// end ------------------------------ addVersionComment ------------------------------

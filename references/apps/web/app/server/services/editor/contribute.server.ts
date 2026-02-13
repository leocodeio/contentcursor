/**
 * This file contains the server-side logic for editors to manage contributions.
 */

import { ActionResult } from "~/types/action-result";
import { makeApiRequest } from "../common/common.server";
import { getAccessToken } from "../auth/db.server";
import {
  xContributionVersionStatusType,
  xDomainContribute,
  xDomainContributionVersion,
  xDomainVersionComment,
} from "@spectral/types";

const editorContributeEndpoints = {
  createContribution: {
    url: "/contributions",
    method: "POST",
  },
  getContributionsByAccount: {
    url: "/contributions/account/:accountId",
    method: "GET",
  },
  getContributionById: {
    url: "/contributions/:id",
    method: "GET",
  },
  createVersion: {
    url: "/contributions/:id/versions",
    method: "POST",
  },
  getVersionsByContribution: {
    url: "/contributions/:id/versions",
    method: "GET",
  },
  getVersionById: {
    url: "/contributions/versions/:versionId",
    method: "GET",
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

// start ------------------------------ createContribution ------------------------------
export const createContribution = async (
  request: Request,
  formData: FormData
): Promise<ActionResult<xDomainContribute>> => {
  try {
    const response = await makeApiRequestWithFiles(
      editorContributeEndpoints.createContribution.url,
      {
        method: editorContributeEndpoints.createContribution.method,
        access_token: await getAccessToken(request),
        request: request,
        formData: formData,
      }
    );

    if (response?.status === 401 || response?.status === 403) {
      return {
        success: false,
        origin: "editor",
        message: "Failed to create contribution due to invalid authorization",
        data: null,
      };
    } else if (response?.status === 400) {
      return {
        success: false,
        origin: "editor",
        message: "Failed to create contribution due to invalid request",
        data: null,
      };
    } else if (response?.status === 500) {
      return {
        success: false,
        origin: "editor",
        message: "Failed to create contribution due to backend server error",
        data: null,
      };
    }

    const responseData = await response?.json();
    const result: ActionResult<xDomainContribute> = {
      success: true,
      origin: "editor",
      message: "Contribution created successfully",
      data: responseData.data,
    };
    return result;
  } catch (error) {
    console.error("Error creating contribution:", error);
    return {
      success: false,
      origin: "editor",
      message: "Failed to create contribution",
      data: null,
    };
  }
};
// end ------------------------------ createContribution ------------------------------

// start ------------------------------ getContributionsByAccount ------------------------------
export const getContributionsByAccount = async (
  request: Request,
  accountId: string
): Promise<ActionResult<xDomainContribute[]>> => {
  const response = await makeApiRequest<any, any>(
    editorContributeEndpoints.getContributionsByAccount.url,
    {
      method: editorContributeEndpoints.getContributionsByAccount.method,
      access_token: await getAccessToken(request),
      request: request,
      pathParams: {
        accountId: accountId,
      },
    }
  );

  if (response?.status === 401 || response?.status === 403) {
    return {
      success: false,
      origin: "editor",
      message: "Failed to get contributions due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 404) {
    return {
      success: false,
      origin: "editor",
      message: "Contributions not found",
      data: null,
    };
  } else if (response?.status === 400) {
    return {
      success: false,
      origin: "editor",
      message: "Failed to get contributions due to invalid request",
      data: null,
    };
  } else if (response?.status === 500) {
    return {
      success: false,
      origin: "editor",
      message: "Failed to get contributions due to backend server error",
      data: null,
    };
  }

  const responseData = await response?.json();
  const result: ActionResult<xDomainContribute[]> = {
    success: true,
    origin: "editor",
    message: "Contributions retrieved successfully",
    data: responseData.data,
  };
  return result;
};
// end ------------------------------ getContributionsByAccount ------------------------------

// start ------------------------------ getContributionById ------------------------------
export const getContributionById = async (
  request: Request,
  contributionId: string
): Promise<ActionResult<xDomainContribute>> => {
  const response = await makeApiRequest<any, any>(
    editorContributeEndpoints.getContributionById.url,
    {
      method: editorContributeEndpoints.getContributionById.method,
      access_token: await getAccessToken(request),
      request: request,
      pathParams: {
        id: contributionId,
      },
    }
  );

  if (response?.status === 401 || response?.status === 403) {
    return {
      success: false,
      origin: "editor",
      message: "Failed to get contribution due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 404) {
    return {
      success: false,
      origin: "editor",
      message: "Contribution not found",
      data: null,
    };
  } else if (response?.status === 400) {
    return {
      success: false,
      origin: "editor",
      message: "Failed to get contribution due to invalid request",
      data: null,
    };
  } else if (response?.status === 500) {
    return {
      success: false,
      origin: "editor",
      message: "Failed to get contribution due to backend server error",
      data: null,
    };
  }

  const responseData = await response?.json();
  const result: ActionResult<xDomainContribute> = {
    success: true,
    origin: "editor",
    message: "Contribution retrieved successfully",
    data: responseData.data,
  };
  return result;
};
// end ------------------------------ getContributionById ------------------------------

// start ------------------------------ createVersion ------------------------------
export const createVersion = async (
  request: Request,
  contributionId: string,
  formData: FormData
): Promise<ActionResult<xDomainContributionVersion>> => {
  try {
    const response = await makeApiRequestWithFiles(
      editorContributeEndpoints.createVersion.url,
      {
        method: editorContributeEndpoints.createVersion.method,
        access_token: await getAccessToken(request),
        request: request,
        formData: formData,
        pathParams: {
          id: contributionId,
        },
      }
    );

    if (response?.status === 401 || response?.status === 403) {
      return {
        success: false,
        origin: "editor",
        message: "Failed to create version due to invalid authorization",
        data: null,
      };
    } else if (response?.status === 400) {
      return {
        success: false,
        origin: "editor",
        message: "Failed to create version due to invalid request",
        data: null,
      };
    } else if (response?.status === 500) {
      return {
        success: false,
        origin: "editor",
        message: "Failed to create version due to backend server error",
        data: null,
      };
    }

    const responseData = await response?.json();
    const result: ActionResult<xDomainContributionVersion> = {
      success: true,
      origin: "editor",
      message: "Version created successfully",
      data: responseData.data,
    };
    return result;
  } catch (error) {
    console.error("Error creating version:", error);
    return {
      success: false,
      origin: "editor",
      message: "Failed to create version",
      data: null,
    };
  }
};
// end ------------------------------ createVersion ------------------------------

// start ------------------------------ getVersionsByContribution ------------------------------
export const getVersionsByContribution = async (
  request: Request,
  contributionId: string
): Promise<ActionResult<xDomainContributionVersion[]>> => {
  const response = await makeApiRequest<any, any>(
    editorContributeEndpoints.getVersionsByContribution.url,
    {
      method: editorContributeEndpoints.getVersionsByContribution.method,
      access_token: await getAccessToken(request),
      request: request,
      pathParams: {
        id: contributionId,
      },
    }
  );

  if (response?.status === 401 || response?.status === 403) {
    return {
      success: false,
      origin: "editor",
      message: "Failed to get versions due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 404) {
    return {
      success: false,
      origin: "editor",
      message: "Versions not found",
      data: null,
    };
  } else if (response?.status === 400) {
    return {
      success: false,
      origin: "editor",
      message: "Failed to get versions due to invalid request",
      data: null,
    };
  } else if (response?.status === 500) {
    return {
      success: false,
      origin: "editor",
      message: "Failed to get versions due to backend server error",
      data: null,
    };
  }

  const responseData = await response?.json();
  const result: ActionResult<xDomainContributionVersion[]> = {
    success: true,
    origin: "editor",
    message: "Versions retrieved successfully",
    data: responseData.data,
  };
  return result;
};
// end ------------------------------ getVersionsByContribution ------------------------------

// start ------------------------------ getVersionById ------------------------------
export const getVersionById = async (
  request: Request,
  versionId: string
): Promise<ActionResult<xDomainContributionVersion>> => {
  const response = await makeApiRequest<any, any>(
    editorContributeEndpoints.getVersionById.url,
    {
      method: editorContributeEndpoints.getVersionById.method,
      access_token: await getAccessToken(request),
      request: request,
      pathParams: {
        versionId: versionId,
      },
    }
  );

  if (response?.status === 401 || response?.status === 403) {
    return {
      success: false,
      origin: "editor",
      message: "Failed to get version due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 404) {
    return {
      success: false,
      origin: "editor",
      message: "Version not found",
      data: null,
    };
  } else if (response?.status === 400) {
    return {
      success: false,
      origin: "editor",
      message: "Failed to get version due to invalid request",
      data: null,
    };
  } else if (response?.status === 500) {
    return {
      success: false,
      origin: "editor",
      message: "Failed to get version due to backend server error",
      data: null,
    };
  }

  const responseData = await response?.json();
  const result: ActionResult<xDomainContributionVersion> = {
    success: true,
    origin: "editor",
    message: "Version retrieved successfully",
    data: responseData.data,
  };
  return result;
};
// end ------------------------------ getVersionById ------------------------------

// start ------------------------------ getVersionComments ------------------------------
export const getVersionComments = async (
  request: Request,
  versionId: string
): Promise<ActionResult<xDomainVersionComment[]>> => {
  const response = await makeApiRequest<any, any>(
    editorContributeEndpoints.getVersionComments.url,
    {
      method: editorContributeEndpoints.getVersionComments.method,
      access_token: await getAccessToken(request),
      request: request,
      pathParams: {
        versionId: versionId,
      },
    }
  );

  if (response?.status === 401 || response?.status === 403) {
    return {
      success: false,
      origin: "editor",
      message: "Failed to get version comments due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 404) {
    return {
      success: false,
      origin: "editor",
      message: "Version comments not found",
      data: null,
    };
  } else if (response?.status === 400) {
    return {
      success: false,
      origin: "editor",
      message: "Failed to get version comments due to invalid request",
      data: null,
    };
  } else if (response?.status === 500) {
    return {
      success: false,
      origin: "editor",
      message: "Failed to get version comments due to backend server error",
      data: null,
    };
  }

  const responseData = await response?.json();
  const result: ActionResult<xDomainVersionComment[]> = {
    success: true,
    origin: "editor",
    message: "Version comments retrieved successfully",
    data: responseData.data,
  };
  return result;
};
// end ------------------------------ getVersionComments ------------------------------

// start ------------------------------ addVersionComment ------------------------------
export const addVersionComment = async (
  request: Request,
  versionId: string,
  content: string
): Promise<ActionResult<xDomainVersionComment>> => {
  const response = await makeApiRequest<any, any>(
    editorContributeEndpoints.addVersionComment.url,
    {
      method: editorContributeEndpoints.addVersionComment.method,
      access_token: await getAccessToken(request),
      request: request,
      pathParams: {
        versionId: versionId,
      },
      body: {
        content: content,
      },
    }
  );

  if (response?.status === 401 || response?.status === 403) {
    return {
      success: false,
      origin: "editor",
      message: "Failed to add version comment due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 404) {
    return {
      success: false,
      origin: "editor",
      message: "Version not found",
      data: null,
    };
  } else if (response?.status === 400) {
    return {
      success: false,
      origin: "editor",
      message: "Failed to add version comment due to invalid request",
      data: null,
    };
  } else if (response?.status === 500) {
    return {
      success: false,
      origin: "editor",
      message: "Failed to add version comment due to backend server error",
      data: null,
    };
  }

  const responseData = await response?.json();
  const result: ActionResult<xDomainVersionComment> = {
    success: true,
    origin: "editor",
    message: "Version comment added successfully",
    data: responseData.data,
  };
  return result;
};
// end ------------------------------ addVersionComment ------------------------------

// Helper function for multipart form data requests
async function makeApiRequestWithFiles(
  endpoint: string,
  options: {
    method: string;
    request: Request;
    access_token?: string;
    formData: FormData;
    pathParams?: Record<string, string>;
  }
): Promise<Response | undefined> {
  const { access_token, method, formData, pathParams } = options;

  // Replace path parameters if any
  let url = endpoint;
  if (pathParams) {
    Object.entries(pathParams).forEach(([key, value]) => {
      url = url.replace(`:${key}`, value);
    });
  }

  const fullUrl = `${process.env.BACKEND_API_URL}/${process.env.BACKEND_VERSION}${url}`;

  try {
    const response = await fetch(fullUrl, {
      method,
      headers: {
        ...(access_token && { Authorization: `Bearer ${access_token}` }),
        "x-api-key": process.env.BACKEND_API_KEY as string,
        "x-correlation-id": "FRONTEND-CORRELATION-ID",
        // Don't set Content-Type for FormData - let fetch set it automatically
      },
      body: formData,
    });

    return response;
  } catch (error) {
    console.error(`Error in API request to ${endpoint}:`, error);
    throw error;
  }
}

export interface CreateContributionDto {
  accountId: string;
  title: string;
  description: string;
  tags: string;
}

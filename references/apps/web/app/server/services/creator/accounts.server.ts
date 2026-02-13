import { ActionResult } from "~/types/action-result";
import { getAccessToken } from "../auth/db.server";
import { makeApiRequest } from "../common/common.server";
import { xDomainAccountEditorMap, xDomainYtCreator } from "@spectral/types";

const creatorEndpoints = {
  getLinkedAccounts: { url: "/youtube/creator", method: "GET" },
  getLinkAccountUrl: { url: "/youtube/api/auth", method: "GET" },
  linkAccount: { url: "/youtube/api/oauth2callback", method: "POST" },
  unlinkAccount: { url: "/youtube/creator", method: "PUT" },
};

// start ------------------------------ getLinkedAccounts ------------------------------
export const getLinkedAccounts = async (
  request: Request,
  creatorId: string
): Promise<ActionResult<xDomainYtCreator[]>> => {
  const response = await makeApiRequest<any, any>(
    creatorEndpoints.getLinkedAccounts.url,
    {
      method: creatorEndpoints.getLinkedAccounts.method,
      request: request,
      access_token: await getAccessToken(request),
      params: {
        creatorId: creatorId,
        status: "ACTIVE",
      },
    }
  );
  const responseData = await response?.json();
  const result: ActionResult<xDomainYtCreator[]> = {
    success: true,
    origin: "map",
    message: "Linked accounts fetched successfully",
    data: responseData.data,
  };
  return result;
};
// end ------------------------------ getLinkedAccounts ------------------------------
// start ------------------------------ getLinkAccountUrl ------------------------------
export const getLinkAccountUrl = async (
  request: Request
): Promise<ActionResult<string>> => {
  const response = await makeApiRequest<any, any>(
    creatorEndpoints.getLinkAccountUrl.url,
    {
      method: creatorEndpoints.getLinkAccountUrl.method,
      access_token: await getAccessToken(request),
      request: request,
    }
  );
  const responseData = await response?.json();
  console.log("responseData", responseData);
  const result: ActionResult<string> = {
    success: true,
    origin: "map",
    message: "Link account url fetched successfully",
    data: responseData.data,
  };
  console.log("result", result);
  return result;
};
// end ------------------------------ getLinkAccountUrl ------------------------------
// start ------------------------------ linkAccount ------------------------------
export const linkAccount = async (
  request: Request,
  slugCallbackDataDto: SlugCallbackDataDto
): Promise<ActionResult<xDomainAccountEditorMap>> => {
  const response = await makeApiRequest<any, any>(
    creatorEndpoints.linkAccount.url,
    {
      method: creatorEndpoints.linkAccount.method,
      request: request,
      access_token: await getAccessToken(request),
      body: slugCallbackDataDto,
    }
  );
  if (response?.status === 401 || response?.status === 403) {
    // 401
    return {
      success: false,
      origin: "callback",
      message: "Failed to link account due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 404) {
    // 404
    return {
      success: false,
      origin: "callback",
      message: "Failed to link account due to invalid request",
      data: null,
    };
  } else if (response?.status === 400) {
    // 400
    return {
      success: false,
      origin: "callback",
      message: "Failed to link account due to invalid request",
      data: null,
    };
  } else if (response?.status === 409) {
    console.log("response", await response.clone().json());
    // 409
    return {
      success: false,
      origin: "callback",
      message:
        ((await response.clone().json()) as any).message ||
        "Failed to link account due to conflict",
      data: null,
    };
  } else if (response?.status === 500) {
    // 500
    return {
      success: false,
      origin: "callback",
      message: "Failed to link account due to backend server error",
      data: null,
    };
  }

  const responseData = await response?.json();
  const result: ActionResult<xDomainAccountEditorMap> = {
    success: true,
    origin: "map",
    message: "Callback successful, account linked successfully",
    data: responseData.data,
  };
  return result;
};
// end ------------------------------ linkAccount ------------------------------
// start ------------------------------ unlinkAccount ------------------------------
export const unlinkAccount = async (
  request: Request,
  accountId: string
): Promise<ActionResult<xDomainAccountEditorMap>> => {
  const response = await makeApiRequest<any, any>(
    creatorEndpoints.unlinkAccount.url,
    {
      method: creatorEndpoints.unlinkAccount.method,
      request: request,
      access_token: await getAccessToken(request),
      params: {
        id: accountId,
      },
      body: {
        status: "INACTIVE",
      },
    }
  );
  const responseData = await response?.json();
  const result: ActionResult<xDomainAccountEditorMap> = {
    success: true,
    origin: "map",
    message: "Account unlinked successfully",
    data: responseData.data,
  };
  return result;
};
// end ------------------------------ unlinkAccount ------------------------------

export interface SlugCallbackDataDto {
  code: string;
  creatorId: string;
}

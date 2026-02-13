/**
 * This file contains the server-side logic for editors to fetch their linked accounts.
 */

import { ActionResult } from "~/types/action-result";
import { makeApiRequest } from "../common/common.server";
import { getAccessToken } from "../auth/db.server";
import { xDomainAccountEditorMap } from "@spectral/types";

const editorAccountEndpoints = {
  getEditorLinkedAccountsByCreator: {
    url: "/account-editor-map/find-accounts-by-editor",
    method: "GET",
  },
};

export const getEditorLinkedAccountsByCreator = async (
  request: Request
): Promise<ActionResult<xDomainAccountEditorMap[]>> => {
  const response = await makeApiRequest<any, any>(
    editorAccountEndpoints.getEditorLinkedAccountsByCreator.url,
    {
      method: editorAccountEndpoints.getEditorLinkedAccountsByCreator.method,
      access_token: await getAccessToken(request),
      request: request,
    }
  );

  if (response?.status === 401 || response?.status === 403) {
    return {
      success: false,
      origin: "map",
      message:
        "Failed to get editor linked accounts by creator due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 404) {
    return {
      success: false,
      origin: "map",
      message: "Editor not found",
      data: null,
    };
  } else if (response?.status === 400) {
    return {
      success: false,
      origin: "map",
      message:
        "Failed to get editor linked accounts by creator due to invalid request",
      data: null,
    };
  } else if (response?.status === 500) {
    return {
      success: false,
      origin: "map",
      message:
        "Failed to get editor linked accounts by creator due to backend server error",
      data: null,
    };
  }

  const responseData = await response?.json();
  const result: ActionResult<xDomainAccountEditorMap[]> = {
    success: true,
    origin: "map",
    message: "Editor linked to account successfully",
    data: responseData.data,
  };
  console.log("result", result);
  return result;
};

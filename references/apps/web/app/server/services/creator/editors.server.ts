import { ActionResult } from "~/types/action-result";
import { makeApiRequest } from "../common/common.server";
import { getAccessToken } from "../auth/db.server";
import {
  xDomainCreatorEditorMap,
  xCreatorEditorMapStatusType,
} from "@spectral/types";

const creatorEndpoints = {
  searchCreatorEditorMap: {
    url: "/creator-editor-map/find-map/:email",
    method: "GET",
  },
  getEditorsMaps  : {
    url: "/creator-editor-map/find-maps-by-creator",
    method: "GET",
  },
  connectEditor: {
    url: "/creator-editor-map/request-editor/:editorId",
    method: "POST",
  },
  updateMapStatus: {
    url: "/creator-editor-map/update-status/:mapId/:status",
    method: "PUT",
  },
};

// start ------------------------------ searchForEditor ------------------------------
// export const searchForEditor = async (
//   request: Request,
//   email: string
// ): Promise<ActionResult<any>> => {
//   const session = await getSession(request);
//   const creatorId = session?.user?.id!;
//   const response = await makeApiRequest<any, any>(
//     creatorEndpoints.searchForEditor.url,
//     {
//       method: creatorEndpoints.searchForEditor.method,
//       access_token: await getAccessToken(request),
//       request: request,
//       pathParams: {
//         email: email,
//       },
//     }
//   );
//   if (response?.status === 401 || response?.status === 403) {
//     // 401
//     return {
//       success: false,
//       origin: "email",
//       message: "Failed to search editor due to invalid authorization",
//       data: null,
//     };
//   } else if (response?.status === 404) {
//     // 404
//     return {
//       success: false,
//       origin: "email",
//       message: "Editor not found",
//       data: null,
//     };
//   } else if (response?.status === 400) {
//     // 400
//     return {
//       success: false,
//       origin: "email",
//       message: "Failed to search editor due to invalid request",
//       data: null,
//     };
//   } else if (response?.status === 500) {
//     // 500
//     return {
//       success: false,
//       origin: "email",
//       message: "Failed to search editor due to backend server error",
//       data: null,
//     };
//   }
//   const data = await response?.json();
//   const result: ActionResult<any> = {
//     success: true,
//     origin: "email",
//     message: "Editor found",
//     data: data,
//   };
//   return result;
// };

// start ------------------------------ searchEditor ------------------------------
export const searchCreatorEditorMap = async (
  request: Request,
  email: string
): Promise<ActionResult<xDomainCreatorEditorMap>> => {
  const response = await makeApiRequest<any, any>(
    creatorEndpoints.searchCreatorEditorMap.url,
    {
      method: creatorEndpoints.searchCreatorEditorMap.method,
      access_token: await getAccessToken(request),
      request: request,
      pathParams: {
        email: email,
      },
    }
  );
  if (response?.status === 401 || response?.status === 403) {
    // 401
    return {
      success: false,
      origin: "email",
      message: "Failed to search editor due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 404) {
    // 404
    return {
      success: false,
      origin: "email",
      message: "Editor not found",
      data: null,
    };
  } else if (response?.status === 400) {
    // 400
    return {
      success: false,
      origin: "email",
      message: "Failed to search editor due to invalid request",
      data: null,
    };
  } else if (response?.status === 500) {
    // 500
    return {
      success: false,
      origin: "email",
      message: "Failed to search editor due to backend server error",
      data: null,
    };
  }

  const responseData = await response?.json();
  const result: ActionResult<xDomainCreatorEditorMap> = {
    success: true,
    origin: "email",
    message: "Editor found",
    data: responseData.data,
  };
  return result;
};
// end ------------------------------ searchEditor ------------------------------
// start ------------------------------ connectEditor ------------------------------
export const connectEditor = async (request: Request, editorId: string) => {
  const response = await makeApiRequest<any, any>(
    creatorEndpoints.connectEditor.url,
    {
      method: creatorEndpoints.connectEditor.method,
      request: request,
      access_token: await getAccessToken(request),
      pathParams: {
        editorId: editorId,
      },
    }
  );
  if (response?.status === 401 || response?.status === 403) {
    // 401
    return {
      success: false,
      origin: "email",
      message: "Failed to connect editor due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 404) {
    // 404
    return {
      success: false,
      origin: "email",
      message: "Failed to connect editor due to invalid request",
      data: null,
    };
  } else if (response?.status === 500) {
    // 500
    return {
      success: false,
      origin: "email",
      message: "Failed to connect editor due to backend server error",
      data: null,
    };
  }

  const responseData = await response?.json();
  const result: ActionResult<xDomainCreatorEditorMap> = {
    success: true,
    origin: "email",
    message: "Editor connected",
    data: responseData.data,
  };
  return result;
};
// end ------------------------------ connectEditor ------------------------------
// start ------------------------------ getEditors ------------------------------
export const getEditorsMaps = async (request: Request) => {
  const response = await makeApiRequest<any, any>(
    creatorEndpoints.getEditorsMaps.url,
    {
      method: creatorEndpoints.getEditorsMaps.method,
      request: request,
      access_token: await getAccessToken(request),
    }
  );
  if (response?.status === 401 || response?.status === 403) {
    return {
      success: false,
      origin: "email",
      message: "Failed to get editors due to invalid authorization",
      data: null,
    };
  }
  const responseData = await response?.json();
  const result: ActionResult<xDomainCreatorEditorMap[]> = {
    success: true,
    origin: "email",
    message: "Editors fetched successfully",
    data: responseData.data,
  };
  return result;
};
// end ------------------------------ getEditors ------------------------------
// start ------------------------------ unlinkEditor ------------------------------
export const updateMapStatusFunction = async (
  request: Request,
  mapId: string,
  status: xCreatorEditorMapStatusType
): Promise<ActionResult<xDomainCreatorEditorMap>> => {
  const response = await makeApiRequest<any, any>(
    creatorEndpoints.updateMapStatus.url,
    {
      method: creatorEndpoints.updateMapStatus.method,
      access_token: await getAccessToken(request),
      request: request,
      pathParams: {
        mapId: mapId,
        status: status,
      },
    }
  );
  if (response?.status === 401 || response?.status === 403) {
    // 401
    return {
      success: false,
      origin: "email",
      message: "Failed to unlink editor due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 404) {
    // 404
    return {
      success: false,
      origin: "email",
      message: "Failed to unlink editor due to invalid request",
      data: null,
    };
  } else if (response?.status === 500) {
    // 500
    return {
      success: false,
      origin: "email",
      message: "Failed to unlink editor due to backend server error",
      data: null,
    };
  }

  const responseData = await response?.json();
  const result: ActionResult<xDomainCreatorEditorMap> = {
    success: true,
    origin: "email",
    message: "Editor unlinked",
    data: responseData.data,
  };
  return result;
};
// end ------------------------------ unlinkEditor ------------------------------

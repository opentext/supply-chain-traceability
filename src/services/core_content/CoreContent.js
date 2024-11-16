import axios from 'axios';

import {
  CCM_WS_TEMPLATE,
  CCM_WS_TYPE,
  CCM_WS_TYPE_ATTR_BATCH,
  CCM_WS_TYPE_ATTR_DATE,
  CCM_WS_TYPE_ATTR_DESCR,
  CCM_WS_TYPE_ATTR_LOCATION,
  CCM_WS_TYPE_ATTR_NAME,
} from './CoreContentConstants';
import { LOCATION_OPTIONS } from '../../components/inspection_form/InspectionConstants';
import { moveDocumentToWS } from '../content_metadata/ContentMetadata';

const APP_BASE_URL = process.env.REACT_APP_BASE_URL;
const CCM_SUBSCRIPTION_NAME = process.env.REACT_APP_CCM_SUBSCRIPTION_NAME;
const CCM_WS_ROOT_NODE_ID = process.env.REACT_APP_CCM_WORKSPACE_ROOT_NODE;

async function getContentAccessTokens(accessToken) {
  const headers = {
    'Content-Type': 'application/json', // Specify the content type
    Authorization: `Bearer ${accessToken}`, // Example of an authorization header
  };

  const apiUrl = '/getContentToken';
  try {
    const response = await fetch(apiUrl, {
      method: 'get', // Specify the request method
      headers,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data?.token;
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

function createCCMWorkspace(
  user,
  cmAccessToken,
  formData,
  callBackForCreateReport,
) {
  const locationoptions = LOCATION_OPTIONS;
  const data = {
    root_name: formData.name,
    root_display_name: formData.name,
    case_display_name: formData.name,
    parent_folder_id: CCM_WS_ROOT_NODE_ID,
    properties: {
      [CCM_WS_TYPE_ATTR_BATCH]: formData.batch,
      [CCM_WS_TYPE_ATTR_DATE]: formData.date,
      [CCM_WS_TYPE_ATTR_DESCR]: formData.description,
      [CCM_WS_TYPE_ATTR_LOCATION]: locationoptions.filter(
        (state) => state.key === formData.location,
      )[0]?.label,
      [CCM_WS_TYPE_ATTR_NAME]: formData.name,
    },
  };
  const config = {
    method: 'post',
    url: `${APP_BASE_URL}/ccws/api/v1/workspace/types/${
      CCM_WS_TYPE
    }/templates/${CCM_WS_TEMPLATE}/instances`,
    headers: {
      Authorization: `Bearer ${user.access_token}`,
      'Content-Type': 'application/hal+json',
      Accept: 'application/json, text/plain, */*',
    },
    data,
  };

  axios(config)
    .then((response) => {
      const workspaceRootNodeId = response.data?.root_folder?.id;
      formData.rowData.workSpace_node_id = workspaceRootNodeId;
      enableAviator(
        user,
        cmAccessToken,
        workspaceRootNodeId,
        formData.rowData,
        callBackForCreateReport,
      );
      callBackForCreateReport();
    })
    .catch((error) => {
      console.error('Error while creating the workspace: ', error);
      formData.name += '_1';
      if (error?.response?.status === 409) {
        createCCMWorkspace(
          user,
          cmAccessToken,
          formData,
          callBackForCreateReport,
        );
      }
    });
}

function enableAviator(
  user,
  cmAccessToken,
  workspaceRootNodeId,
  files,
  callBackForCreateReport,
) {
  const config = {
    method: 'post',
    url: `/ccm/subscriptions/${
      CCM_SUBSCRIPTION_NAME
    }/cm/v1/aviator/assignment/${workspaceRootNodeId}`,
    headers: {
      Authorization: `Bearer ${cmAccessToken}`,
      'Content-Type': 'application/hal+json',
      Accept: 'application/json, text/plain, */*',
    },
  };

  axios(config)
    .then(() => {
      files.forEach((file) => {
        moveDocumentToWS(user, workspaceRootNodeId, file.id);
      });
      callBackForCreateReport();
    })
    .catch((error) => {
      console.error('Error while enabling Aviator for the workspace: ', error);
    });
}

export { getContentAccessTokens, createCCMWorkspace };

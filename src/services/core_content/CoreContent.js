import axios from "axios";

import { CCM_WS_TEMPLATE, CCM_WS_TYPE, CCM_WS_TYPE_ATTR_BATCH, CCM_WS_TYPE_ATTR_DATE, CCM_WS_TYPE_ATTR_DESCR, CCM_WS_TYPE_ATTR_LOCATION, CCM_WS_TYPE_ATTR_NAME} from "./CoreContentConstants";
import { LOCATION_OPTIONS } from "../../components/inspection_form/InspectionConstants";
import { moveDocumentToWS } from "../content_metadata/ContentMetadata";

const APP_BASE_URL = process.env.REACT_APP_BASE_URL;
const CCM_SUBSCRIPTION_NAME = process.env.REACT_APP_CCM_SUBSCRIPTION_NAME;
const CCM_WS_ROOT_NODE_ID = process.env.REACT_APP_CCM_WORKSPACE_ROOT_NODE;



async function getCaptureAccessTokens() {

    const apiUrl = '/getCapToken';
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data?.token;
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

async function getContentAccessTokens() {

    const apiUrl = '/getContentToken';
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data?.token;
    } catch (error) {
        console.error('Fetch error:', error);
    }
    
}

function createCCMWorkspace(user, cmAccessToken, form_data, callBackForCreateReport) {

const locationoptions = LOCATION_OPTIONS;
    var data = {
        "root_name": form_data.name,
        "root_display_name": form_data.name,
        "case_display_name": form_data.name,
        "parent_folder_id": CCM_WS_ROOT_NODE_ID,
        "properties": {
            [CCM_WS_TYPE_ATTR_BATCH]: form_data.batch,
            [CCM_WS_TYPE_ATTR_DATE] : form_data.date,
            [CCM_WS_TYPE_ATTR_DESCR] : form_data.description,
            [CCM_WS_TYPE_ATTR_LOCATION] : locationoptions.filter(state => state.key === form_data.location)[0]?.['label'],
            [CCM_WS_TYPE_ATTR_NAME] : form_data.name
        }
    };
    var config = {
      method: "post",
      url:
        APP_BASE_URL +
        "/ccws/api/v1/workspace/types/" +
        CCM_WS_TYPE +
        "/templates/" +
        CCM_WS_TEMPLATE +
        "/instances",
      headers: {
        Authorization: `Bearer ${user.access_token}`,
        "Content-Type": "application/hal+json",
        Accept: "application/json, text/plain, */*",
      },
      data: data,
    };

    axios(config)
        .then(function (response) {
            let workspace_root_node_id = response.data?.root_folder?.id;
            form_data.rowData["workSpace_node_id"] = workspace_root_node_id;
            enableAviator(user, cmAccessToken, workspace_root_node_id, form_data.rowData, callBackForCreateReport );
            callBackForCreateReport();
        })
        .catch(function (error) {
            console.error("Error while creating the workspace: ",error);
            form_data.name = form_data.name + "_1"
            if(error?.response?.status === 409){
                createCCMWorkspace(user, cmAccessToken, form_data, callBackForCreateReport)
            }
        });
}

async function enableAviator(user,cmAccessToken, workspace_root_node_id, files, callBackForCreateReport){

    var config = {
        method: "post",
        url: "/ccm/subscriptions/" + CCM_SUBSCRIPTION_NAME + "/cm/v1/aviator/assignment/"+ workspace_root_node_id,
        headers: {
            Authorization: `Bearer ${cmAccessToken}`,
            "Content-Type": "application/hal+json",
            'Accept': 'application/json, text/plain, */*'
        },
    };

    axios(config)
        .then(function (_response) {
            files.forEach(file => {
                moveDocumentToWS(user, workspace_root_node_id, file.id);
            });
            callBackForCreateReport();
        })
        .catch(function (error) {
            console.error("Error while enabling Aviator for the workspace: ",error);
        });
}

export {
    getCaptureAccessTokens,
    getContentAccessTokens,
    createCCMWorkspace,
};

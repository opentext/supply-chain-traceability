import axios from "axios";

import Publications from "../publications/publications";
import { CCM_DOC_TYPE_UPLOADED_DOC, CCM_DOC_TYPE_ATTR_EXTRACTED_DATA, CCM_DOC_TYPE_ATTR_PUBLICATION_DATA } from "../core_content/CoreContentConstants";

const APP_BASE_URL = process.env.REACT_APP_BASE_URL;
const CCM_UPLOAD_NODE_ID = process.env.REACT_APP_CCM_TEMP_UPLOAD_ROOT_NODE;
var CCM_UPLOAD_TEMP_NODE = '';

export async function updatePublicationDataToFile(id,user,pubdata){
    let data = {
        "properties": {
            [CCM_DOC_TYPE_ATTR_PUBLICATION_DATA] : pubdata.id
        }
    }
    var config = {
        method: "patch",
        url: APP_BASE_URL + "/cms/instances/file/" + CCM_DOC_TYPE_UPLOADED_DOC + "/" + id,
        headers: {
            Authorization: `Bearer ${user.access_token}`,
            "Content-Type": "application/hal+json",
            'Accept': 'application/json, text/plain, */*'
        },
        data
    };

    axios(config);

}

export async function updateExtractionDataToFile(id,user,extractdata){
    let data = {
                "properties":{
                    [CCM_DOC_TYPE_ATTR_EXTRACTED_DATA] : JSON.stringify(extractdata)
                }}
    var config = {
        method: "patch",
        url: APP_BASE_URL + "/cms/instances/file/" + CCM_DOC_TYPE_UPLOADED_DOC + "/" + id,
        headers: {
            Authorization: `Bearer ${user.access_token}`,
            "Content-Type": "application/hal+json",
            'Accept': 'application/json, text/plain, */*'
        },
        data
    };

    axios(config);

}

function deleteFileToCoreContent_v3(
    user, fileId, callback
) {
    fetch(APP_BASE_URL + "/cms/instances/file/cms_file/"+fileId,{
        method: "delete",
        headers: {
            Authorization: `Bearer ${user.access_token}`
        }
    }).then(async (_response) => {
            callback();
        })
        .catch(async (error) => {
            console.error(`Error while deleting file: ${fileId}. ${error}`);
        });
}

function createDocumentInCMS(blob_id, mimeType, size, fileName, callBackForFileUpload,user, updatePublicationData) {
    const publicationService = new Publications(user);
    var data ={
        "content_size": size,
        "mime_type": mimeType,
        "version_label": [
            "INITIAL"
        ],
        "blob_id": blob_id,
        "name": fileName,
        "crude_op": "create",
        "parent_folder_id": CCM_UPLOAD_TEMP_NODE,
        "cms_type": CCM_DOC_TYPE_UPLOADED_DOC,
        "cms_category": "file",
        "description": "",
        "properties":{[CCM_DOC_TYPE_ATTR_PUBLICATION_DATA] :"", [CCM_DOC_TYPE_ATTR_EXTRACTED_DATA]:""},
        "renditions": [
            {
            "name": fileName,
            "rendition_type": "PRIMARY",
            "blob_id": blob_id,
            "source":"FILE_ID",
            "mime_type": mimeType,
            "content_size": size
            }
        ]
    };
    var config = {
        method: "post",
        url: APP_BASE_URL + "/cms/instances/file/" + CCM_DOC_TYPE_UPLOADED_DOC,
        headers: {
            Authorization: `Bearer ${user.access_token}`,
            "Content-Type": "application/hal+json",
            'Accept': 'application/json, text/plain, */*'
        },
        data: data,
    };

    axios(config)
        .then(function (response) {
           
            publicationService.getPublicationData(response.data.id, "cms_file", updatePublicationData);
            
            callBackForFileUpload();
        })
        .catch(function (error) {
            console.error(`Error while creating file in CM: ${fileName}. Error: ${error}`);
        });
}


async function moveDocumentToWS(user, workspace_root_node_id, source_node_id){
    var data = {
        "id": workspace_root_node_id
    };
    var config = {
        method: "put",
        url: APP_BASE_URL + "/cms/instances/file/cms_file/" + source_node_id + "/parent",
        headers: {
            Authorization: `Bearer ${user.access_token}`,
            "Content-Type": "application/hal+json",
            'Accept': 'application/json, text/plain, */*'
        },
        data: data,
    };

    axios(config)
        .then(function (_response) {
        })
        .catch(function (_error) {
            console.error(`Error while moving file ${source_node_id} in to WS ${workspace_root_node_id}`);
        });

}


function getCMWSNode(user, nodeId){
    return axios({
        method: "get",
        url: APP_BASE_URL + "/ccws/api/v1/workspace/instances/"+nodeId,
        headers: {
            Authorization: `Bearer ${user.access_token}`,
            "Content-Type": "application/hal+json",
        }
    });
}

function listItemsFromCMS(user,setRowData,extractionData){

      fetch(APP_BASE_URL + "/cms/instances/folder/cms_folder/"+CCM_UPLOAD_TEMP_NODE+"/items" , {
        method: "GET",
        headers: {
            Authorization: `Bearer ${user.access_token}`,
            "Content-Type": "application/hal+json",
        }
      }).then(async (res) => {
        res.data = await res.json();
        var rowData = res.data?._embedded?.collection ? (res.data?._embedded.collection?.filter(item => item.category !== "folder").map(e=>({
            name: e.name,
            filesize: Math.round(e.content_size/1024) + "KB",
            downloadUrl: e._links["urn:eim:linkrel:pdf-download-media"],
            id: e.id,
            icon: e.name.indexOf(".docx") > 0 ? "MimeWord32" : e.name.indexOf(".jpg") > 0 ? "FileJpeg" : "FilePdf",
            metadataExtraction: !extractionData[e.name] ? "Warning" : extractionData[e.name].isInProgress ? "Running" : extractionData[e.name].data ? "Success" : "Warning"
          }))): [];
        setRowData(rowData);
      })
      .catch((_err) => {});
}


function createTempUplaodFolder(user) {
    const timeStamp = Date.now();
    const temp_upload_folder_name = user.email+"_" + timeStamp;
    const data =  {
        "name": timeStamp,
        "display_name": temp_upload_folder_name,
        "parent_folder_id": CCM_UPLOAD_NODE_ID,
        "type": "Instance_Type"
      };
    
    const config = {
        method: "post",
        url: APP_BASE_URL + "/cms/instances/folder/cms_folder",
        headers: {
            Authorization: `Bearer ${user.access_token}`
        },
        data: data
    };

    axios(config)
    .then(function (response) {
        CCM_UPLOAD_TEMP_NODE = response.data.id;
    })
    .catch(function (error) {
        console.error("Error while creating temp folder in cm ",error);
    });
}

function deleteTempFolder(user){

    var data = {"cms_type":"cms_folder","cms_category":"folder"};
    var config = {
        method: "delete",
        url: APP_BASE_URL + "/cms/instances/folder/cms_folder/"+CCM_UPLOAD_TEMP_NODE,
        headers: {
            Authorization: `Bearer ${user.access_token}`,
            "Content-Type": "application/hal+json",
            'Accept': 'application/json, text/plain, */*'
        },
        data: data
    };

    axios(config)
        .then(function (_response) {
            CCM_UPLOAD_TEMP_NODE = '';
        })
        .catch(function (error) {
            console.error(`Error while deleting the temp folder (node id : ${CCM_UPLOAD_TEMP_NODE}) in cm. `,error);
        });

}


function setCCMUploadTempNode(value){
    CCM_UPLOAD_TEMP_NODE = value
}

function getCCMUploadTempNode() {
    return CCM_UPLOAD_TEMP_NODE;
}


export {
    deleteFileToCoreContent_v3,
    getCMWSNode,
    listItemsFromCMS,
    createTempUplaodFolder,
    deleteTempFolder,
    setCCMUploadTempNode,
    getCCMUploadTempNode,
    createDocumentInCMS,
    moveDocumentToWS
};
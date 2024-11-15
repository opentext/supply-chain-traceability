import axios from "axios";
import { createDocumentInCMS } from "../content_metadata/ContentMetadata";


const APP_BASE_URL = process.env.REACT_APP_BASE_URL;

async function uploadFileToCoreContent(
  filesContent,
  cmAccessToken,
  user,
  fileData,
  callBackForFileUpload,
  updatePublicationData,
  signoutRedirect
) {
  var config = {
    method: "post",
    url: APP_BASE_URL + "/css/v3/files/fromStream",
    headers: {
      Authorization: `Bearer ${user.access_token}`,
      "Content-Type": fileData.type,
    },
    data: filesContent,
  };

  axios(config)
    .then(function (response) {
      let blobId = response?.data?.id;
      let mimeType = response?.data?.mimeType;
      let size = response?.data?.size;

      createDocumentInCMS(
        blobId,
        mimeType,
        size,
        fileData.name,
        callBackForFileUpload,
        user,
        updatePublicationData
      );
    })
    .catch(function (error) {
      if (error.response.status === 401) {
        signoutRedirect();
      }
      console.error(`Error while uploading file ${fileData.name} : ${error}`);
    });
}


export {
    uploadFileToCoreContent,
};
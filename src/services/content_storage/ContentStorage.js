import axios from 'axios';
import { createDocumentInCMS } from '../content_metadata/ContentMetadata';

const APP_BASE_URL = process.env.REACT_APP_BASE_URL;

async function uploadFileToCoreContent(
  filesContent,
  user,
  fileData,
  callBackForFileUpload,
  updatePublicationData,
  signoutRedirect,
) {
  const config = {
    method: 'post',
    url: `${APP_BASE_URL}/css/v3/files/fromStream`,
    headers: {
      Authorization: `Bearer ${user.access_token}`,
      'Content-Type': fileData.type,
    },
    data: filesContent,
  };

  axios(config)
    .then((response) => {
      const blobId = response?.data?.id;
      const mimeType = response?.data?.mimeType;
      const size = response?.data?.size;

      createDocumentInCMS(
        blobId,
        mimeType,
        size,
        fileData.name,
        callBackForFileUpload,
        user,
        updatePublicationData,
      );
    })
    .catch((error) => {
      if (error.response.status === 401) {
        signoutRedirect();
      }
      console.error(`Error while uploading file ${fileData.name} : ${error}`);
    });
}

export { uploadFileToCoreContent };

/* eslint-disable no-loop-func */
import axios from 'axios';
import { getOCRdata } from '../info_intel/infoIntel';

export async function uploadFileToCapture(
  inputfiles,
  setExtractionData,
  accessToken,
) {
  let uploadComplete = false;
  const files = [...inputfiles];
  const captureFiles = [];
  for (let i = 0; i < files.length; i += 1) {
    setExtractionData((prevData) => ({
      ...prevData,
      [files[i].name]: {
        isInProgress: true,
        isUpdatedToCMS: false,
        data: undefined,
      },
    }));

    if (
      files[i].name.includes('Minerals')
      || files[i].name.includes('Refinement Receipt')
      || files[i].name.includes('Sale Invoice')
    ) {
      captureFiles.push(files[i]);
    } else {
      getOCRdata(files[i], setExtractionData, accessToken);
    }
  }

  await uploadFiles(captureFiles, accessToken).then((returnedFiles) => {
    uploadComplete = returnedFiles;
  });
  if (
    uploadComplete
    && uploadComplete.length > 0
    && uploadComplete.length === captureFiles.length
  ) {
    await processImage(
      captureFiles,
      setExtractionData,
      uploadComplete,
      accessToken,
    );
  }
}

function uploadFiles(files, accessToken) {
  files = Array.from(files);
  return new Promise((resolve) => {
    const fileIDs = {};
    const filePromises = Array.from(files).map(
      (file) => new Promise((fileresolve) => {
        const reader = new FileReader();

        reader.onload = async () => {
          const fileData = {
            name: file.name,
            type: file.type,
            size: file.size,
            content: reader.result,
          };
          const config = {
            method: 'post',
            url: 'capture/cp-rest/v2/session/files',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': fileData.type,
            },
            data: fileData.content,
          };

          await axios(config)
            .then((response) => {
              file.fileID = response?.data.id;
              fileIDs[file.name] = response?.data.id;
              fileresolve(file);
            })
            .catch((error) => {
              console.log(error);
            });
        };
        reader.readAsArrayBuffer(file);
      }),
    );
    Promise.all(filePromises).then((filesRes) => resolve(filesRes));
  });
}

async function processImage(files, setExtractionData, fileIDs, accessToken) {
  const payload = getConvertImagePayload(files, fileIDs);
  const config = {
    method: 'post',
    url: '/capture/cp-rest/v2/session/services/ConvertImages',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    data: payload,
  };

  const response = await axios(config);
  const tiffId = [];
  for (let i = 0; i < response?.data.resultItems.length; i += 1) {
    if (response?.data?.resultItems[i]?.files[0]?.value) {
      tiffId.push(response?.data.resultItems[i].files[0].value);
    }
  }

  for (let i = 0; i < tiffId.length; i += 1) {
    if (files[i].name.includes('Minerals')) {
      performFullPageOCR(
        tiffId[i],
        files[i].name,
        'image/tiff',
        'tif',
        setExtractionData,
        accessToken,
      );
    } else {
      classifyAndExtract(
        tiffId[i],
        files[i].name,
        'image/tiff',
        'tif',
        setExtractionData,
        accessToken,
      );
    }
  }
}

async function classifyAndExtract(
  id,
  name,
  contentType,
  fileType,
  setExtractionData,
  accessToken,
) {
  let extractedData = '';
  const payload = getExtractPayload(id, name, contentType, fileType);
  const config = {
    method: 'post',
    url: '/capture/cp-rest/v2/session/services/classifyextractdocument',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    data: payload,
  };

  await axios(config)
    .then((response) => {
      const valueArray = response.data.resultItems[0]?.values[0]?.value.nodeList;
      if (valueArray) {
        extractedData = valueArray.map((obj) => ({
          name: obj.name,
          label: obj.labelText,
          value: manipulateData(obj),
          type: 'input',
        }));
      }
    })
    .catch((error) => {
      console.log(error);
    });
  if (extractedData) {
    setExtractionData((prevData) => ({
      ...prevData,
      [name]: { isInProgress: false, data: extractedData },
    }));
  } else {
    setExtractionData((prevData) => ({
      ...prevData,
      [name]: { isInProgress: false, data: extractedData },
    }));
  }
}

function manipulateData(obj) {
  if (obj.labelText === 'Total Price') {
    return `$ ${obj.data[0]?.value}`;
  }
  if (obj.labelText === 'Target Purity') {
    return `${obj.data[0]?.value} %`;
  }

  return obj.data[0]?.value;
}

function getExtractPayload(fileID, name, contentType, fileType) {
  return {
    serviceProps: [
      {
        name: 'Env',
        value: 'D',
      },
      {
        name: 'IncludeOcrData',
        value: 'False',
      },
      {
        name: 'EnableDocumentSeparation',
        value: 'False',
      },
      {
        name: 'Project',
        value: name.includes('Receipt') ? 'InformationExtraction' : 'Default',
      },
    ],
    requestItems: [
      {
        nodeId: 1,
        values: null,
        files: [
          {
            name,
            value: fileID,
            contentType,
            fileType,
          },
        ],
      },
    ],
  };
}

function getConvertImagePayload(files, fileIDs) {
  const payload = {
    serviceProps: [
      {
        name: 'Env',
        value: 'S',
      },
      {
        name: 'Profile',
        value: 'SplitPDFProfile',
      },
      {
        name: 'ReturnFileDataInline',
        value: false,
      },
    ],
    requestItems: [],
  };

  for (let i = 0; i < files.length; i += 1) {
    payload.requestItems.push({
      nodeId: i,
      values: null,
      files: [
        {
          name: files[i].name,
          value: files[i].fileID ? files[i].fileID : fileIDs[files[i].name],
          contentType: files[i].type,
          fileType: 'pdf',
        },
      ],
    });
  }

  return payload;
}

async function performFullPageOCR(
  id,
  name,
  contentType,
  fileType,
  setExtractionData,
  accessToken,
) {
  let extractedData = '';
  const payload = getOCRPayload(id, name, contentType, fileType);
  const config = {
    method: 'post',
    url: '/capture/cp-rest/v2/session/services/fullpageocr',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    data: payload,
  };

  const response = await axios(config);
  let textSrc = response?.data.resultItems[0].files[0]?.src;
  if (textSrc) {
    const appBaseUrl = process.env.REACT_APP_BASE_URL;
    textSrc = textSrc.replace(appBaseUrl, '');
    const ocrText = await getOCRText(textSrc, accessToken);
    extractedData = await getExtractedData(ocrText);
    if (extractedData) {
      setExtractionData((prevData) => ({
        ...prevData,
        [name]: { isInProgress: false, data: extractedData },
      }));
    }
  }
}

async function getExtractedData(text) {
  const resultData = [];
  const companyName = text.match(/Company Name:\s*(.+)/)?.[1].trim();
  const billNumber = text.match(/Bill Number:\s*(.+)/)?.[1];
  const date = text.match(/Date:\s*([\d-]+)/)?.[1];
  const phoneNumber = text.match(/Phone Number:\s*([+\d-]+)/)?.[1];
  const address = text.match(/Address:\s*(.+)/)?.[1].trim();
  const total = text.match(/Total\s*([\d,]+.\d+)/)?.[1].trim();
  resultData.push({
    label: 'Company Name',
    name: 'Company Name',
    value: companyName,
    type: 'input',
  });
  resultData.push({
    label: 'Bill Number',
    name: 'Bill Number',
    value: billNumber,
    type: 'input',
  });
  resultData.push({
    label: 'Bill Date',
    name: 'Bill Date',
    value: date,
    type: 'input',
  });
  resultData.push({
    label: 'Phone Number',
    name: 'Phone Number',
    value: phoneNumber,
    type: 'input',
  });
  resultData.push({
    label: 'Address',
    name: 'Address',
    value: address,
    type: 'input',
  });
  resultData.push({
    label: 'Total cost',
    name: 'Total cost',
    value: `$ ${total}`,
    type: 'input',
  });

  return resultData;
}

async function getOCRText(src, accessToken) {
  const config = {
    method: 'get',
    url: src,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
  const response = await axios(config);
  return response?.data;
}

function getOCRPayload(fileID, name, contentType, fileType) {
  return {
    serviceProps: [
      {
        name: 'Env',
        value: 'D',
      },
      {
        name: 'OcrEngineName',
        value: 'Advanced',
      },
      {
        name: 'AutoRotate',
        value: 'False',
      },
      {
        name: 'Country',
        value: 'USA',
      },
      {
        name: 'ProcessingMode',
        value: 'VoteOcrAndEText',
      },
      {
        name: 'OcrEngineMode',
        value: 'NG',
      },
    ],
    requestItems: [
      {
        nodeId: 1,
        values: [
          {
            name: 'OutputType',
            value: 'Text',
          },
          {
            name: 'Version',
            value: 'Pdf',
          },
          {
            name: 'Compression',
            value: 'None',
          },
          {
            name: 'ImageSelection',
            value: 'OriginalImage',
          },
        ],
        files: [
          {
            name,
            value: fileID,
            contentType,
            fileType,
          },
        ],
      },
    ],
  };
}

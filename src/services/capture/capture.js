/* eslint-disable no-loop-func */
import axios from "axios";
import { getOCRdata } from "../info_intel/infoIntel";

const capture_url = process.env.REACT_APP_BASE_URL + "/capture/cp-rest/v2";
const file_upload = capture_url + "/session/files";
const image_processing = capture_url + "/session/services/ConvertImages";
const classify_and_extract = capture_url + "/session/services/classifyextractdocument?suppress_response_codes=suppress_response_codes";
const fullpageocr = capture_url + "/session/services/fullpageocr";



export async function uploadFileToCapture(inputfiles, setExtractionData,access_token) {
	let uploadComplete = false;
	let files = [...inputfiles];
	let captureFiles = [];
	for (let i = 0; i < files.length; i++) {
		setExtractionData((prevData) => ({
			...prevData,
			[files[i].name]: { isInProgress: true, isUpdatedToCMS: false, data: undefined} }
		  ));
	
		if(files[i].name.includes("Minerals") || files[i].name.includes("Refinement Receipt") || files[i].name.includes("Sale Invoice") ){
			captureFiles.push(files[i]);
		}else{
            getOCRdata(files[i],setExtractionData,access_token);
        }
		
	}
	
	await uploadFiles(captureFiles,access_token).then( (returnedFiles) => {
		uploadComplete = returnedFiles;
	});
	if(uploadComplete && uploadComplete.length > 0 && uploadComplete.length === captureFiles.length){
		await processImage(captureFiles,setExtractionData,uploadComplete,access_token);
	}

  
}

async function uploadFiles(files,access_token){
	files = Array.from(files);
	return new Promise(async (resolve, reject) => {
	let fileIDs = {};
	const filePromises = Array.from(files).map((file) => {
		return new Promise((fileresolve,filereject) => {
			const reader = new FileReader();

			reader.onload = async () => {
				
			  const fileData = {
				name: file.name,
				type: file.type,
				size: file.size,
				content: reader.result,
			  };
				var config = {
					method: "post",
					url: file_upload,
					headers: {
					Authorization: `Bearer ${access_token}`,
					'Content-Type': fileData.type
					},
					data: fileData.content,
				};
			
				await axios(config)
					.then(function (response) {
						file.fileID = response?.data.id;
						fileIDs[file.name] = response?.data.id;
						fileresolve(file);
					})
					.catch(function (error) {
					});
			}
			reader.readAsArrayBuffer(file);
		});
	});
	Promise.all(filePromises).then((files) => resolve(files));

	});
}

async function processImage(files,setExtractionData,fileIDs,access_token) {
	const payload = getConvertImagePayload(files,fileIDs);
	var config = {
		method: "post",
		url: image_processing,
		headers: {
		  Authorization:  `Bearer ${access_token}`,
		  'Content-Type': 'application/json'
		},
		data: payload
	  };
		
	  let response = await axios(config);
	  let tiffId = [];
		for( let i=0; i< response?.data.resultItems.length; i++){
			if(response?.data?.resultItems[i]?.files[0]?.value){
				tiffId.push(response?.data.resultItems[i].files[0].value);
			}
		}

		for(let i = 0; i< tiffId.length; i++){
			if(files[i].name.includes("Minerals")){
				performFullPageOCR(tiffId[i],files[i].name,'image/tiff','tif',setExtractionData,access_token);
			}else{
				classifyAndExtract(tiffId[i],files[i].name,'image/tiff','tif',setExtractionData,access_token);
			}
			
		}

}

async function classifyAndExtract(id,name,content_type,file_type,setExtractionData,access_token) {

	let extractedData = '';
	const payload = getExtractPayload(id,name,content_type,file_type);
	var config = {
		method: "post",
		url: classify_and_extract,
		headers: {
		  Authorization:  `Bearer ${access_token}`,
		  'Content-Type': 'application/json'
		},
		data: payload
	  };
	
	  await axios(config)
		.then(function (response) {
			const valueArray = response.data.resultItems[0]?.values[0]?.value.nodeList;
			if(valueArray){
				extractedData = valueArray.map((obj) => ({
					name: obj.name,
					label: obj.labelText,
					value: manipulateData(obj),
					type: "input",
				}));
			}
		})
		.catch(function (error) {
		});
		if(extractedData){
			setExtractionData((prevData) => ({
				...prevData,
				[name]: { isInProgress: false, data: extractedData }
			  }));
		}else{
			setExtractionData((prevData) => ({
				...prevData,
				[name]: { isInProgress: false, data: extractedData }
			  }));
		}
}

function manipulateData(obj) {
	if (obj.labelText === "Total Price") {
		return "$ " + obj.data[0]?.value;
	}
	if (obj.labelText === "Target Purity") {
		return obj.data[0]?.value + " %";
	}

	return obj.data[0]?.value;
}

function getExtractPayload(fileID,name,content_type,file_type) {
	return {
		"serviceProps":
		[
			{
				"name":"Env",
				"value":"D"
			},
			{
				"name":"IncludeOcrData",
				"value":"False"
			},
			{
				"name":"EnableDocumentSeparation",
				"value":"False"
			},
			{
				"name":"Project",
				"value": name.includes("Receipt") ? "InformationExtraction" : "Default"
			}
		],
		"requestItems":
		[
			{
				"nodeId":1,
				"values": null,
				"files":
				[
					{
						"name":name,
						"value": fileID,
						"contentType":content_type,
						"fileType":file_type
					}
				]
			}
		]
	};
}

function getConvertImagePayload(files,fileIDs) {
	let payload =  {
		"serviceProps": [
		  {
			"name": "Env",
			"value": "S"
		  },
		  {
			"name": "Profile",
			"value": "SplitPDFProfile"
		  },
		  {
			"name": "ReturnFileDataInline",
			"value": false
		  }
		],
		"requestItems": []
	  }; 	


	  for(let i=0;i< files.length;i++){
			payload.requestItems.push({
				"nodeId": i,
				"values": null,
				"files": [
				  {
					 "name":files[i].name,
					 "value": files[i].fileID ? files[i].fileID : fileIDs[files[i].name],
					 "contentType": files[i].type,
					 "fileType":"pdf"
				  }
				]
			  })
	  }

	  return payload;
}

async function performFullPageOCR(id,name,content_type,file_type,setExtractionData,access_token) {

	let extractedData = '';
	const payload = getOCRPayload(id,name,content_type,file_type);
	var config = {
		method: "post",
		url: fullpageocr,
		headers: {
		  Authorization: `Bearer ${access_token}`,
		  'Content-Type': 'application/json'
		},
		data: payload
	  };
	
	let response = await axios(config);
	let textSrc = response?.data.resultItems[0].files[0]?.src;
	if(textSrc){
		let ocrText = await getOCRText(textSrc,access_token);
		extractedData = await getExtractedData(ocrText);
		if(extractedData){
			setExtractionData((prevData) => ({
				...prevData,
				[name]: { isInProgress: false, data: extractedData }
				}));
		}
	}
	  
}

async function getExtractedData(text){
	const resultData = [];
	const companyName = text.match(/Company Name:\s*(.+)/)?.[1].trim();
	const billNumber = text.match(/Bill Number:\s*(.+)/)?.[1];
	const date = text.match(/Date:\s*([\d-]+)/)?.[1];
	const phoneNumber = text.match(/Phone Number:\s*([+\d-]+)/)?.[1];
	const address = text.match(/Address:\s*(.+)/)?.[1].trim();
	const total = text.match(/Total\s*([\d,]+.\d+)/)?.[1].trim();
	resultData.push({
		label: "Company Name",
		name: "Company Name",
		value: companyName,
		type: "input",
	  });
	  resultData.push({
		label: "Bill Number",
		name: "Bill Number",
		value: billNumber,
		type: "input",
	  });
	  resultData.push({
		label: "Bill Date",
		name: "Bill Date",
		value: date,
		type: "input",
	  });
	  resultData.push({
		label: "Phone Number",
		name: "Phone Number",
		value: phoneNumber,
		type: "input",
	  });
	  resultData.push({
		label: "Address",
		name: "Address",
		value: address,
		type: "input",
	  });
	  resultData.push({
		label: "Total cost",
		name: "Total cost",
		value: "$ "+total,
		type: "input",
	  });

	  return resultData;
}

async function getOCRText(src,access_token) {
	var config = {
		method: "get",
		url: src,
		headers: {
		  Authorization: `Bearer ${access_token}`,
		}
	  };
	let response = await axios(config);
	return response?.data;
}

function getOCRPayload(fileID,name,content_type,file_type) {
	return{
		"serviceProps": [
			   {
				  "name": "Env",
				  "value": "D"
			  },
			  {
				  "name": "OcrEngineName",
				  "value": "Advanced"
			  },
			  {
				  "name": "AutoRotate",
				  "value": "False"
			  },
			  {
				  "name": "Country",
				  "value": "USA"
			  },
			  {
				  "name": "ProcessingMode",
				  "value": "VoteOcrAndEText"
			  },
			  {
				  "name": "OcrEngineMode",
				  "value": "NG"
			  }
		],
		"requestItems": [
		  {
			"nodeId": 1,
			"values": [
			  {
						  "name": "OutputType",
						  "value": "Text"
					  },
					  {
						  "name": "Version",
						  "value": "Pdf"
					  },
					  {
						  "name": "Compression",
						  "value": "None"
					  },
					  {
						  "name": "ImageSelection",
						  "value": "OriginalImage"
					  }
			],
			"files": [
				{
					"name":name,
					"value": fileID,
					"contentType":content_type,
					"fileType":file_type
				}
			]
		  }
		]
	  };
}
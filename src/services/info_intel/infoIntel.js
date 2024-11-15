import axios from "axios";

const react_baseUrl = process.env.REACT_APP_BASE_URL;


export async function getOCRdata(
  file,
  setExtractionData,
  access_token
) {
  const formData = new FormData();
  formData.append("File", file);
  let resultsData = {};
  var config = {
    method: "post",
    url: react_baseUrl + "/mtm-riskguard/api/v1/extract?action=ocr",
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
    data: formData,
  };

  await axios(config)
    .then(async function (response) {
      var jsonData = response?.data;
      resultsData = await extractResults(
        jsonData.riskExtraction.results["idol-ocr"].result.results,
        file.name
      );
      setExtractionData((prevData) => ({
        ...prevData,
        [file.name]: { isInProgress: false, data: resultsData }
        }));
    })
    .catch(function (error) {
      console.log("Error extracting data from infotel", error);
      setExtractionData((prevData) => ({
        ...prevData,
        [file.name]: { isInProgress: false, data: undefined }
        }));
    });
	
	
  return resultsData;
}

async function extractResults(text, name) {
  let resultData = {};
  if (name.includes("Report")) {
      resultData = extractReportDataGerman(text);
    
  } else if (name.includes("Sale Invoice")) {
    resultData = extractSaleInvoiceData(text);
  } else if (name.includes("Bill of Lading")) {
    resultData = extractShipmentData(text);
  }else if (name.includes("Warehouse")) {
    resultData = extractWarehouseData(text);
  }else {
    resultData = [{
      label: "OCR Extraction",
      name: "OCR Extraction",
      value: text,
      type: "textarea",
    }

    ];
  }

  return resultData;
}

function extractSaleInvoiceData(text) {
  let resultData = [];
  text = text.replace(/\\n/g, "\n");
  // Regular expressions for each field
  const sellerCompanyMatch = text.match(/Company Name:\s*(.+?)\s*Address:/);
  const invoiceDateMatch = text.match(/Date:\s*(\d{1,2} \w+ \d{4})/);
  const deliveryDateMatch = text.match(/Delivery Date:\s*(\d{1,2} \w+ \d{4})/);
  const invoiceNumberMatch = text.match(/Invoice Number:\s*([A-Za-z0-9-]+)/);
  const purityMatch = text.match(/Purity Level:\s*([\d.]+%)/);
  const batchNumberMatch = text.match(/Batch Number:\s*([A-Za-z0-9-]+)/);



  // Extract the materials section
  const materialsSectionMatch = text.match(
    /Materials\s+S no\.\s+.*?\n.*?\n(.*?)\nItem Details/s
  );
  const materialsSection = materialsSectionMatch
    ? materialsSectionMatch[1].trim()
    : null;

  let  materials = [];
  if (materialsSection) {
    // Split into individual lines and parse each line
    const lines = materialsSection
      .split("\n")
      .filter((line) => line.trim() !== ""); // Filter out empty lines

    // Map each line to an object
     materials = lines
      .map((line) => {
        const match = line.match(
          /^(\d+)\s+([A-Za-z\s()]+)\s+(\d+)\s+([\d,]+)\s+([\d,]+)$/
        );
        return match
          ? {
              sno: match[1].trim(),
              itemName: match[2].trim(),
              quantity: match[3].trim(),
              pricePerKg: match[4].trim(),
              totalPrice: match[5].trim(),
            }
          : null;
      })
      .filter((item) => item !== null); // Remove null entries if any
  }

  resultData.push({ label: "Seller Company Name", name: "Seller Company Name", value: sellerCompanyMatch ? sellerCompanyMatch[1].trim() : null, type: "input" });
  resultData.push({
    label: "Invoice Date",
	name: "Invoice Date",
    value: invoiceDateMatch ? invoiceDateMatch[1].trim() : null,
    type: "input",
  });
  resultData.push({
    label: "Invoice Number",
	name: "Invoice Number",
    value: invoiceNumberMatch ? invoiceNumberMatch[1].trim() : null,
    type: "input",
  });
  resultData.push({
    label: "Delivery Date",
	name: "Delivery Date",
    value: deliveryDateMatch ? deliveryDateMatch[1].trim() : null,
    type: "input",
  });
  
  resultData.push({
    label: "Item Name",
	name: "Item Name",
    value: materials[0].itemName,
    type: "input",
  });
  resultData.push({
    label: "Batch Number",
	name: "Batch Number",
    value: batchNumberMatch ? batchNumberMatch[1].trim() : null,
    type: "input",
  });
  resultData.push({
    label: "Purity",
	name: "Purity",
    value: purityMatch ? purityMatch[1].trim() : null,
    type: "input",
  });
  resultData.push({
    label: "Quantity",
	name: "Quantity",
    value: materials[0].quantity,
    type: "input",
  });
//   resultData.push({
//     label: "Price per KG",
// 	name: "Price per KG",
//     value: materials[0].pricePerKg,
//     type: "input",
//   });
  resultData.push({
    label: "Total Price",
	name: "Total Price",
    value: materials[0].totalPrice,
    type: "input",
  });


  return resultData;
}

function extractData(regex, text, groupIndex = 1) {
  const match = text.match(regex);
  return match ? match[groupIndex].trim() : null;
}

function extractShipmentData(documentText) {
  const resultData = [];

  const reportData = {
    carrierName: extractData(/Carrier Name:\s*([^ ]+.*?)(?=\s*Date of Issue:)/, documentText),
    shipperName: extractData(/Shipper Name:\s*([^ ]+.*?)(?=\s*Consignee Name:)/, documentText),
    consigneeName: extractData(/Consignee Name:\s*([^\n]+)/, documentText),
    estimatedArrivalDate: extractData(/Estimated Arrival Date:\s*([^ ]+.*?)(?=\s*Cost)/, documentText),
  };
  resultData.push({
    label: "Carrier Name",
	name: "Carrier Name",
    value: reportData.carrierName,
    type: "input",
  });
  resultData.push({
    label: "Shipper Name",
	name: "Shipper Name",
    value: reportData.shipperName,
    type: "input",
  });
  resultData.push({
    label: "Consignee Name",
	name: "Consignee Name",
    value: reportData.consigneeName,
    type: "input",
  });
  resultData.push({
    label: "Estimated Arrival Date",
	  name: "Estimated Arrival Date",
    value: reportData.estimatedArrivalDate,
    type: "input",
  });
  
  return resultData;
}


function extractWarehouseData(documentText) {
  const resultData = [];

  const reportData = {
    warehouseName: extractData(/Warehouse Name:\s*([^ ]+.*?)(?=\s*Receipt Number:)/, documentText),
    warehouseLocation: extractData(/Address:\s*([^ ]+.*?)(?=\s*Date of Receipt:)/, documentText),
    totalCost: extractData(/Total Cost \(Including Insurance\):\s*([\d,]+)\s*USD/, documentText),
  };
  resultData.push({
    label: "Warehouse Name",
	name: "Warehouse Name",
    value: reportData.warehouseName,
    type: "input",
  });
  resultData.push({
    label: "Address",
	name: "Address",
    value: reportData.warehouseLocation,
    type: "input",
  });
  resultData.push({
    label: "Total Cost",
	name: "Total Cost",
    value: "$ "+reportData.totalCost,
    type: "input",
  });
  
  return resultData;
}

function extractReportDataGerman(documentText) {
  const resultData = [];
  const reportData = {
    analystName: extractData(/Name des Analysten\s*:\s*([^\n]+?)(?=\s+Berichts-ID)/, documentText),
    assessmentDate: extractData(/Datum\s*:\s*([A-Za-z0-9,\s]+)(?=\n)/, documentText),
    reportId: extractData(/Berichts-ID\s*:\s*([A-Za-z0-9]+)/, documentText),
    numberOfAnalyticalMethods: extractData(/wir (.+) Analysemethoden/, documentText),
    batchNumber: extractData(/bezogen. \((.+)\) bereitgestellt/, documentText),
    documentStatus: extractData(/Status\s*:\s*([^\n]+)/, documentText),
    approvedBy: extractData(/Genehmigt von\s*:\s*([^\n]+)/, documentText),
    approvedOn: extractData(/Genehmigt am\s*:\s*([^\n]+)/, documentText)
  };
  resultData.push({
    label: "Analyst Name",
	name: "Analyst Name",
    value: reportData.analystName,
    type: "input",
  });
  resultData.push({
    label: "Report Id",
	name: "Report Id",
    value: reportData.reportId,
    type: "input",
  });
  resultData.push({
    label: "Batch Number",
	  name: "Batch Number",
    value: reportData.batchNumber,
    type: "input",
  });
  resultData.push({
    label: "Assessment Date",
	name: "Assessment Date",
    value: reportData.assessmentDate,
    type: "input",
  });
  resultData.push({
    label: "Number of Analytical Methods",
	name: "Number of Analytical Methods",
    value: reportData.numberOfAnalyticalMethods,
    type: "input",
  });
  resultData.push({
    label: "Document Status",
	name: "Document Status",
    value: reportData.documentStatus,
    type: "input",
  });
  resultData.push({
    label: "Approved By",
	name: "Approved By",
    value: reportData.approvedBy,
    type: "input",
  });
  resultData.push({
    label: "Approved On",
	name: "Approved On",
    value: reportData.approvedOn,
    type: "input",
  });
  return resultData;
}

// eslint-disable-next-line no-unused-vars
function extractReportData(text) {
    // text = text.replace(/\\n/g, "\n");


  const resultData = [];

  const reportData = {
    analystName: extractData(/Analyst name\s*:\s*([^\n]+?)(?=\s+Report ID)/, text),
    assessmentDate: extractData(/Date\s*:\s*([A-Za-z0-9,\s]+)(?=\n)/, text),
    reportId: extractData(/Report ID\s*:\s*([A-Za-z0-9]+)/, text),
    numberOfAnalyticalMethods: extractData(/used (\d+) analytical methods/, text),
    documentStatus: extractData(/Status\s*:\s*([^\n]+)/, text),
    approvedBy: extractData(/Approved by\s*:\s*([^\n]+)/, text),
    approvedOn: extractData(/Approved on\s*:\s*([^\n]+)/, text)
  };
  resultData.push({
    label: "Analyst Name",
	name: "Analyst Name",
    value: reportData.analystName,
    type: "input",
  });
  resultData.push({
    label: "Report Id",
	name: "Report Id",
    value: reportData.reportId,
    type: "input",
  });
  resultData.push({
    label: "Assessment Date",
	name: "Assessment Date",
    value: reportData.assessmentDate,
    type: "input",
  });
  resultData.push({
    label: "Number of Analytical Methods",
	name: "Number of Analytical Methods",
    value: reportData.numberOfAnalyticalMethods,
    type: "input",
  });
  resultData.push({
    label: "Document Status",
	name: "Document Status",
    value: reportData.documentStatus,
    type: "input",
  });
  resultData.push({
    label: "Approved By",
	name: "Approved By",
    value: reportData.approvedBy,
    type: "input",
  });
  resultData.push({
    label: "Approved On",
	name: "Approved On",
    value: reportData.approvedOn,
    type: "input",
  });
 
  return resultData;
}

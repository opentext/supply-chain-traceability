import React, { useContext, useEffect, useState } from "react";
import "./InspectionPage.scss";
import axios from "axios";
import { Button, Grid } from "@material-ui/core";
import DragDropUploader from "../drag_drop_uploader/DragDropUploader";
import {
  createCCMWorkspace,
  getCaptureAccessTokens,
  getContentAccessTokens
} from "../../services/core_content/CoreContent";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import FileViewer from "../file_viewer/FileViewer";
import Publications from "../../services/publications/publications";
import AppContext from "../../context/AppContext";
import DataTable from "react-data-table-component";
import {
  FaCheckCircle,
  FaFilePdf,
  FaFileWord,
  FaSpinner,
} from "react-icons/fa";
import { PiWarningCircleFill } from "react-icons/pi";
import { MdDelete } from "react-icons/md";
import { BiSolidFileJpg } from "react-icons/bi";
import DynamicForm from "../dynamic_form/DynamicForm";
import CustomToast from "../common/custom_toast/CustomToast";
import { REPORT_FILE_NAME } from "../../utilities/FileConstants";
import InspectionForm from "../inspection_form/InspectionForm";
import { createTempUplaodFolder, deleteFileToCoreContent_v3, listItemsFromCMS, setCCMUploadTempNode, updateExtractionDataToFile, updatePublicationDataToFile } from "../../services/content_metadata/ContentMetadata";
import { useAuth } from "react-oidc-context";

const InspectionPage = (props) => {
  const { user } = useAuth();
  const { rowData, setRowData } = props;
  const [isViewerLoading, setIsViewerLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const { extractionData, publicationData, setPublicationData } =
    useContext(AppContext);
  const [viewerLoaded, setIsViewerLoaded] = useState(false);
  const publicationService = new Publications(user);

  const [name, setName] = useState("");
  const [description, setDescripton] = useState("");
  const [batch, setBatch] = useState("");
  const [viewer, setViewer] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("o3");
  const {
    cmAccessToken,
    setCMAccessToken,
    captureAccessToken,
    setCaptureAccessToken,
  } = useContext(AppContext);
  const [showInvoiceProperties, setShowInvoiceProperties] = useState(false);
  const [documentMetadata, setDocumentMetadata] = useState({
    id: "",
    label: "",
    fields: {
      entries: [],
    },
    mode: "",
  });

  const [toastDetails, setToastDetails] = useState({
    type: "",
    isToastOpen: false,
    message: "",
  });

  const closeToast = () => {
    if (toastDetails.message.includes("Business Workspace")) {
      setToastDetails({
        type: "",
        isToastOpen: false,
        message: "",
      });
    }
  };

  const handleChange_name = (e) => {
    setName(e);
  };

  const handleChange_description = (e) => {
    setDescripton(e);
  };

  const handleChange_batch = (e) => {
    setBatch(e);
  };

  const handleChange_date = (e) => {
    setDate(e);
  };

  const handleChange_location = (e) => {
    setLocation(e);
  };

  useEffect(() => {
    setCCMUploadTempNode(""); //reset the uploadtemp folder node
    createTempFolder();
    setDate(new Date());
    async function init() {
      await axios
        .get(
          process.env.REACT_APP_BASE_URL +
              "/viewer/api/v1/viewers/brava-view-1.x/loader",
          {
            headers: {
              Authorization: `Bearer ${user.access_token}`,
            },
          }
        )
        .then((res) => {
          if (res.data) {
            setViewer(res.data);
          }
        });
      setCaptureAccessToken(await getCaptureAccessTokens());
      setCMAccessToken(await getContentAccessTokens());
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {

    const updatedRowData = rowData.map((row) => {
      if (extractionData[row.name]) {
        if (
          !extractionData[row.name].isInProgress &&
          extractionData[row.name].data
        ) {
          return { ...row, metadataExtraction: "Success" };
        } else if (
          !extractionData[row.name].isInProgress &&
          !extractionData[row.name].data
        ) {
          return { ...row, metadataExtraction: "Warning" };
        } else {
          return { ...row, metadataExtraction: "Running" };
        }
      }
      return row;
    });

    if (JSON.stringify(updatedRowData) !== JSON.stringify(rowData)) {
      setRowData(updatedRowData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extractionData, rowData]);

  useEffect(() => {
    rowData.forEach((row) => {
      if (extractionData[row.name] && !extractionData[row.name].isInProgress) {
        row.metadataExtraction = "Success";
        if (!extractionData[row.name].isUpdatedToCMS) {
          updateExtractionDataToFile(
            row.id,
            user,
            extractionData[row.name].data
          );
          extractionData[row.name].isUpdatedToCMS = true;
        }
      }
    });

    if (extractionData[REPORT_FILE_NAME]) {
      const batchRow = extractionData[REPORT_FILE_NAME]?.data?.find(
        (row) => row.name === "Batch Number"
      );
      if (batchRow) {
        setBatch(batchRow.value);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extractionData]);

  const columns = [
    {
      name: "Name",
      id: "name",
      grow: 4,
      ignoreRowClick: false,
      selector: (row) => row.name,
      cell: (row) => {
        if (row.name.includes("pdf")) {
          return (
            <div
              onClick={() => open_viewer(row)}
              style={{ paddingLeft: "0px" }}
            >
              <FaFilePdf
                style={{ color: "#BA150D", height: "1.25em", width: "2em" }}
              />
              <span>{row.name}</span>
            </div>
          );
        } else if (row.name.includes("docx")) {
          return (
            <div
              onClick={() => open_viewer(row)}
              style={{ paddingLeft: "0px" }}
            >
              <FaFileWord
                style={{ color: "#13386D", height: "1.25em", width: "2em" }}
              />
              <span>{row.name}</span>
            </div>
          );
        }
      },
    },
    {
      name: "File size",
      id: "filesize",
      grow: 1,
      selector: (row) => row.filesize,
    },
    {
      name: "Status",
      id: "metadataExtraction",
      grow: 1,
      ignoreRowClick: false,
      selector: (row) => row.metadataExtraction,
      cell: (row) => {
        if (row.metadataExtraction === "Success") {
          return (
            <div onClick={() => open_viewer(row)}>
              <FaCheckCircle
                style={{ color: "green", height: "1.25em", width: "2em" }}
              />
            </div>
          );
        } else if (row.metadataExtraction === "Warning") {
          return (
            <div onClick={() => open_viewer(row)}>
              <PiWarningCircleFill
                style={{ color: "orange", height: "1.25em", width: "2em" }}
              />
            </div>
          );
        } else if (row.metadataExtraction === "Running") {
          return (
            <div onClick={() => open_viewer(row)}>
              <FaSpinner
                style={{
                  color: "blue",
                  height: "1.25em",
                  width: "2em",
                  marginRight: "0.25em",
                  top: "0.1em",
                  animation: "spin 1s infinite linear",
                }}
              />
            </div>
          );
        }
      },
    },
    {
      name: "",
      id: "actions",
      grow: 1,
      ignoreRowClick: true,
      cell: (row) => {
        return (
          <div>
            <MdDelete
              style={{ height: "1.25em", width: "2em", cursor: "pointer" }}
              onClick={(e) => {
                e.stopPropagation();
                closeDialog();
                deleteFileToCoreContent_v3(user, row.id, refreshTable);
              }}
            />
          </div>
        );
      },
    },
  ];

  const [downloadHref, setDownloadHref] = useState("");
  const [openDocumentDialogView, setOpenDocumentDialogView] = useState(false);
  const panelLabel = {
    name: "metadata",
    type: "label",
    value: "Classified and Extracted metadata",
  };

  const waitForElementToBeVisible = (id) => {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        const element = document.getElementById("IGCDisplaylistPage0");
        if (element && element.offsetParent !== null) {
          clearInterval(interval);
          open_details(id);
          resolve(id);
        }
      }, 100); // Check every 100ms
    });
  };

  const conditionalRowStyles = [
    {
      when: (row) => row.id === selectedRow,
      style: {
        backgroundColor: "#eeeeee",
      },
    },
  ];

  const open_viewer = async (row, event) => {
    setSelectedRow(row.id);
    setShowInvoiceProperties(false);
    let id = row.id;
    if (!viewerLoaded) {
      setIsViewerLoading(true);
    }

    if (publicationData[id] && publicationData[id].data) {
      setDownloadHref(publicationData[id].data);
      setOpenDocumentDialogView(true);
      waitForElementToBeVisible(id);
    } else {
      let callback = (data, id, fileMetadata) => {
        setDownloadHref(data);
        setOpenDocumentDialogView(true);
        setPublicationData((prevData) => ({
          ...prevData,
          [id]: { data, fileMetadata },
        }));
        waitForElementToBeVisible(id);
      };
      await publicationService.getPublicationData(id, "cms_file", callback);
    }
  };

  const open_details = (id) => {
    let filteredData = rowData.filter((row) => {
      return row.id === id;
    });
    if (
      extractionData[filteredData[0].name] &&
      !extractionData[filteredData[0].name].isInProgress &&
      extractionData[filteredData[0].name].data
    ) {
      setShowInvoiceProperties(true);
      setDocumentMetadata({
        id: "fd5",
        label: (
          <div className="fileTypeSide">
            {filteredData[0].icon === "MimeWord32" ? (
              <FaFileWord
                style={{ color: "#13386D", height: "1.5em", width: "1.5em" }}
              />
            ) : filteredData[0].icon === "FileJpeg" ? (
              <BiSolidFileJpg />
            ) : (
              <FaFilePdf
                style={{ color: "#BA150D", height: "1.5em", width: "1.5em" }}
              />
            )}
            <span style={{ marginLeft: "5px" }}>
              {filteredData[0].name.replace(/\.[^/.]+$/, "")}
            </span>
          </div>
        ),
        htmlClass: "",
        mode: filteredData[0].name.includes("Minerals") ? "" : "readonly",
        fields: {
          htmlClass: "ot-form-fields",
          entries: [panelLabel, ...extractionData[filteredData[0].name].data],
        },
      });

    } else {
      setShowInvoiceProperties(false);
    }
  };

  const closeDialog = () => {
    setSelectedRow("");
    setOpenDocumentDialogView(false);
    setShowInvoiceProperties(false);
  };

  const updatePublicationData = (data, id, fileMetadata) => {
    setPublicationData((prevData) => ({
      ...prevData,
      [id]: { data, fileMetadata },
    }));

    updatePublicationDataToFile(id, user, data);
  };

  const refreshTable = () => {
    listItemsFromCMS(
      user,
      setRowData,
      extractionData,
      publicationData,
      updatePublicationData
    );
  };

  const createTempFolder = () => {
    createTempUplaodFolder(user);
  };

  const callBackForCreateReport = () => {
    history.push("/inspection/" + rowData.workSpace_node_id);
    if (window.viewerApi) {
      window.viewerApi.clearViewer();
    }
  };

  const history = useHistory();

  const openSaveToast = () => {
    setToastDetails({
      type: "success",
      isToastOpen: true,
      message: name + " Business Workspace created successfully.",
    });
    createReport();
  };

  const createReport = () => {
    let form_data = {
      name: name,
      description: description,
      batch: batch,
      date: date,
      location: location,
      rowData: rowData,
    };
    createCCMWorkspace(
      user,
      cmAccessToken,
      form_data,
      callBackForCreateReport
    );
    setRowData(form_data.rowData);
  };

  return (
    <div id="inspection-page" style={{ backgroundColor: "white" }}>
      {toastDetails.isToastOpen && (
        <CustomToast
          type={toastDetails.type}
          isOpen={toastDetails.isToastOpen}
          autoDismiss="5000"
          onClose={closeToast}
        >
          <span title={toastDetails.message}>{toastDetails.message}</span>
        </CustomToast>
      )}
      <div id="page-header">
        <Grid container>
          <Grid item xs={8}>
            <div
              style={{
                textDecoration: "none",
                alignItems: "center",
                paddingLeft: "10px",
              }}
            >
              <span className="page-title">Create inspection report</span>
            </div>
          </Grid>
          <Grid item xs={3}></Grid>
          <Grid item xs={1}>
            <div className="header_button">
              <Button
                size="small"
                variant={name && batch ? "contained" : "outlined"}
                disabled={!(name && batch)}
                onClick={openSaveToast}
                className={
                  name && batch ? "ip-btn-contained" : "ip-btn-outlined"
                }
              >
                Save
              </Button>
            </div>
          </Grid>
        </Grid>
      </div>
      <div className="Inspection_Layout">
        <Grid container>
          <Grid item xs={4} className="form_layout">
            <Grid item>
              <InspectionForm
                name={name}
                batch={batch}
                date={date}
                location={location}
                description={description}
                handleChange_name={handleChange_name}
                handleChange_batch={handleChange_batch}
                handleChange_date={handleChange_date}
                handleChange_location={handleChange_location}
                handleChange_description={handleChange_description}
              />

              <div className="FileDrop">Attach supporting files/images</div>
              <DragDropUploader
                refreshTable={refreshTable}
                cmAccessToken={cmAccessToken}
                captureAccessToken={captureAccessToken}
                updatePublicationData={updatePublicationData}
              ></DragDropUploader>

              <div className="document_list_table">
                <div className="datatable-wrapper">
                  <DataTable
                    className="datatable-wrapper__table"
                    columns={columns}
                    data={rowData}
                    highlightOnHover
                    pointerOnHover
                    onRowClicked={open_viewer}
                    conditionalRowStyles={conditionalRowStyles}
                  />

                  {rowData?.length <= 0 && (
                    <div className="file-list--empty">
                      <img
                        src="./images/empty_folder_file.svg"
                        alt="Add file"
                        onClick={refreshTable}
                      />
                      <div className="file-list__body-content">
                        The list is empty.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Grid>
          </Grid>

          <Grid item xs={4}>
            <div style={{ minHeightheight: "580px" }}>
              {isViewerLoading && (
                <div>
                  <div className="spinner-border"></div>
                  <div className="spinner-base"></div>
                  <div className="spinner-section"></div>
                </div>
              )}
              {openDocumentDialogView && (
                <FileViewer
                  closeDialog={closeDialog}
                  setIsViewerLoading={setIsViewerLoading}
                  publicationData={downloadHref}
                  accessToken={user}
                  setIsViewerLoaded={setIsViewerLoaded}
                  viewer={viewer}
                />
              )}
            </div>
          </Grid>

          <Grid item xs={4} className="eswm-dynamic-forms-fields">
            {showInvoiceProperties && <DynamicForm {...documentMetadata} />}
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default InspectionPage;

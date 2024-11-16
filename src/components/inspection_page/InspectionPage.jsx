import { useContext, useEffect, useState } from 'react';
import './InspectionPage.scss';
import axios from 'axios';
import { Button, Grid2 } from '@mui/material';
import DataTable from 'react-data-table-component';
import {
  FaCheckCircle,
  FaFilePdf,
  FaFileWord,
  FaSpinner,
} from 'react-icons/fa';
import { PiWarningCircleFill } from 'react-icons/pi';
import { MdDelete } from 'react-icons/md';
import { BiSolidFileJpg } from 'react-icons/bi';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import DragDropUploader from '../drag_drop_uploader/DragDropUploader';
import {
  createCCMWorkspace,
  getContentAccessTokens,
} from '../../services/core_content/CoreContent';
import FileViewer from '../file_viewer/FileViewer';
import Publications from '../../services/publications/publications';
import AppContext from '../../store/context/app-context';
import DynamicForm from '../dynamic_form/DynamicForm';
import CustomToast from '../common/custom_toast/CustomToast';
import { REPORT_FILE_NAME } from '../../utilities/FileConstants';
import InspectionForm from '../inspection_form/InspectionForm';
import {
  createTempUplaodFolder,
  deleteFileToCoreContent,
  listItemsFromCMS,
  setCCMUploadTempNode,
  updateExtractionDataToFile,
  updatePublicationDataToFile,
} from '../../services/content_metadata/ContentMetadata';

function InspectionPage() {
  const navigate = useNavigate();
  const { rowData, setRowData } = useContext(AppContext);
  const { user, isAuthenticated } = useAuth();
  const [isViewerLoading, setIsViewerLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const { extractionData, publicationData, setPublicationData } = useContext(AppContext);
  const [viewerLoaded, setIsViewerLoaded] = useState(false);
  const publicationService = new Publications(user);

  const [name, setName] = useState('');
  const [description, setDescripton] = useState('');
  const [batch, setBatch] = useState('');
  const [viewer, setViewer] = useState('');
  const [date, setDate] = useState(new Date());
  const [location, setLocation] = useState('o3');
  const {
    cmAccessToken,
    setCMAccessToken,
  } = useContext(AppContext);
  const [showInvoiceProperties, setShowInvoiceProperties] = useState(false);
  const [documentMetadata, setDocumentMetadata] = useState({
    id: '',
    label: '',
    fields: {
      entries: [],
    },
    mode: '',
  });

  const [toastDetails, setToastDetails] = useState({
    type: '',
    isToastOpen: false,
    message: '',
  });

  const closeToast = () => {
    if (toastDetails.message.includes('Business Workspace')) {
      setToastDetails({
        type: '',
        isToastOpen: false,
        message: '',
      });
    }
  };

  const handleChangeName = (e) => {
    setName(e);
  };

  const handleChangeDescription = (e) => {
    setDescripton(e);
  };

  const handleChangeBatch = (e) => {
    setBatch(e);
  };

  const handleChangeDate = (e) => {
    setDate(e);
  };

  const handleChangeLocation = (e) => {
    setLocation(e);
  };

  const createTempFolder = () => {
    createTempUplaodFolder(user);
  };

  useEffect(() => {
    if (isAuthenticated && user && user?.access_token) {
      setCCMUploadTempNode(''); // reset the uploadtemp folder node
      createTempFolder();
      setDate(new Date());
      async function init() {
        await axios
          .get(
            `${
              process.env.REACT_APP_BASE_URL
            }/viewer/api/v1/viewers/brava-view-1.x/loader`,
            {
              headers: {
                Authorization: `Bearer ${user.access_token}`,
              },
            },
          )
          .then((res) => {
            if (res.data) {
              setViewer(res.data);
            }
          });

        setCMAccessToken(await getContentAccessTokens(user.access_token));
      }
      init();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAuthenticated]);

  useEffect(() => {
    const updatedRowData = rowData.map((row) => {
      if (extractionData[row.name]) {
        if (
          !extractionData[row.name].isInProgress
          && extractionData[row.name].data
        ) {
          return { ...row, metadataExtraction: 'Success' };
        }
        if (
          !extractionData[row.name].isInProgress
          && !extractionData[row.name].data
        ) {
          return { ...row, metadataExtraction: 'Warning' };
        }
        return { ...row, metadataExtraction: 'Running' };
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
        // eslint-disable-next-line no-param-reassign
        row.metadataExtraction = 'Success';
        if (!extractionData[row.name].isUpdatedToCMS) {
          updateExtractionDataToFile(
            row.id,
            user,
            extractionData[row.name].data,
          );
          extractionData[row.name].isUpdatedToCMS = true;
        }
      }
    });

    if (extractionData[REPORT_FILE_NAME]) {
      const batchRow = extractionData[REPORT_FILE_NAME]?.data?.find(
        (row) => row.name === 'Batch Number',
      );
      if (batchRow) {
        setBatch(batchRow.value);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extractionData]);

  const columns = [
    {
      name: 'Name',
      id: 'name',
      grow: 4,
      ignoreRowClick: false,
      selector: (row) => row.name,
      cell: (row) => {
        if (row.name.includes('pdf')) {
          return (
            <div
              onClick={() => openViewer(row)}
              style={{ paddingLeft: '0px' }}
            >
              <FaFilePdf
                style={{ color: '#BA150D', height: '1.25em', width: '2em' }}
              />
              <span>{row.name}</span>
            </div>
          );
        }
        if (row.name.includes('docx')) {
          return (
            <div
              // eslint-disable-next-line no-use-before-define
              onClick={() => openViewer(row)}
              style={{ paddingLeft: '0px' }}
            >
              <FaFileWord
                style={{ color: '#13386D', height: '1.25em', width: '2em' }}
              />
              <span>{row.name}</span>
            </div>
          );
        }
      },
    },
    {
      name: 'File size',
      id: 'filesize',
      grow: 1,
      selector: (row) => row.filesize,
    },
    {
      name: 'Status',
      id: 'metadataExtraction',
      grow: 1,
      ignoreRowClick: false,
      selector: (row) => row.metadataExtraction,
      cell: (row) => {
        if (row.metadataExtraction === 'Success') {
          return (
            <div onClick={() => openViewer(row)}>
              <FaCheckCircle
                style={{ color: 'green', height: '1.25em', width: '2em' }}
              />
            </div>
          );
        }
        if (row.metadataExtraction === 'Warning') {
          return (
            <div onClick={() => openViewer(row)}>
              <PiWarningCircleFill
                style={{ color: 'orange', height: '1.25em', width: '2em' }}
              />
            </div>
          );
        }
        if (row.metadataExtraction === 'Running') {
          return (
            <div onClick={() => openViewer(row)}>
              <FaSpinner
                style={{
                  color: 'blue',
                  height: '1.25em',
                  width: '2em',
                  marginRight: '0.25em',
                  top: '0.1em',
                  animation: 'spin 1s infinite linear',
                }}
              />
            </div>
          );
        }
      },
    },
    {
      name: '',
      id: 'actions',
      grow: 1,
      ignoreRowClick: true,
      cell: (row) => (
        <div>
          <MdDelete
            style={{ height: '1.25em', width: '2em', cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation();
              closeDialog();
              deleteFileToCoreContent(user, row.id, refreshTable);
            }}
          />
        </div>
      ),
    },
  ];

  const [downloadHref, setDownloadHref] = useState('');
  const [openDocumentDialogView, setOpenDocumentDialogView] = useState(false);
  const panelLabel = {
    name: 'metadata',
    type: 'label',
    value: 'Classified and Extracted metadata',
  };

  const waitForElementToBeVisible = (id) => new Promise((resolve) => {
    const interval = setInterval(() => {
      const element = document.getElementById('IGCDisplaylistPage0');
      if (element && element.offsetParent !== null) {
        clearInterval(interval);
        openDetails(id);
        resolve(id);
      }
    }, 100); // Check every 100ms
  });

  const conditionalRowStyles = [
    {
      when: (row) => row.id === selectedRow,
      style: {
        backgroundColor: '#eeeeee',
      },
    },
  ];

  const openViewer = async (row) => {
    setSelectedRow(row.id);
    setShowInvoiceProperties(false);
    const { id } = row;
    if (!viewerLoaded) {
      setIsViewerLoading(true);
    }

    if (publicationData[id] && publicationData[id].data) {
      setDownloadHref(publicationData[id].data);
      setOpenDocumentDialogView(true);
      waitForElementToBeVisible(id);
    } else {
      const callback = (data, fid, fileMetadata) => {
        setDownloadHref(data);
        setOpenDocumentDialogView(true);
        setPublicationData((prevData) => ({
          ...prevData,
          [fid]: { data, fileMetadata },
        }));
        waitForElementToBeVisible(fid);
      };
      await publicationService.getPublicationData(id, 'cms_file', callback);
    }
  };

  const openDetails = (id) => {
    const filteredData = rowData.filter((row) => row.id === id);
    if (
      extractionData[filteredData[0].name]
      && !extractionData[filteredData[0].name].isInProgress
      && extractionData[filteredData[0].name].data
    ) {
      setShowInvoiceProperties(true);
      setDocumentMetadata({
        id: 'fd5',
        label: (
          <div className="fileTypeSide">
            {filteredData[0].icon === 'MimeWord32' ? (
              <FaFileWord
                style={{ color: '#13386D', height: '1.5em', width: '1.5em' }}
              />
            ) : filteredData[0].icon === 'FileJpeg' ? (
              <BiSolidFileJpg />
            ) : (
              <FaFilePdf
                style={{ color: '#BA150D', height: '1.5em', width: '1.5em' }}
              />
            )}
            <span style={{ marginLeft: '5px' }}>
              {filteredData[0].name.replace(/\.[^/.]+$/, '')}
            </span>
          </div>
        ),
        htmlClass: '',
        mode: filteredData[0].name.includes('Minerals') ? '' : 'readonly',
        fields: {
          htmlClass: 'ot-form-fields',
          entries: [panelLabel, ...extractionData[filteredData[0].name].data],
        },
      });
    } else {
      setShowInvoiceProperties(false);
    }
  };

  const closeDialog = () => {
    setSelectedRow('');
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
      updatePublicationData,
    );
  };

  const callBackForCreateReport = () => {
    navigate(`/inspection/${rowData.workSpace_node_id}`);
    if (window.viewerApi) {
      window.viewerApi.clearViewer();
    }
  };

  const openSaveToast = () => {
    setToastDetails({
      type: 'success',
      isToastOpen: true,
      message: `${name} Business Workspace created successfully.`,
    });
    createReport();
  };

  const createReport = () => {
    const formData = {
      name,
      description,
      batch,
      date,
      location,
      rowData,
    };
    createCCMWorkspace(user, cmAccessToken, formData, callBackForCreateReport);
    setRowData(formData.rowData);
  };

  return (
    <div id="inspection-page" style={{ backgroundColor: 'white' }}>
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
        <Grid2 container>
          <Grid2 size={8} style={{ alignSelf: 'self-end' }}>
            <div
              style={{
                textDecoration: 'none',
                alignItems: 'center',
                paddingLeft: '10px',
              }}
            >
              <span className="page-title">Create inspection report</span>
            </div>
          </Grid2>
          <Grid2 size={3} />
          <Grid2 size={1}>
            <div className="header_button">
              <Button
                size="small"
                variant={name && batch ? 'contained' : 'outlined'}
                disabled={!(name && batch)}
                onClick={openSaveToast}
                className={
                  name && batch ? 'ip-btn-contained' : 'ip-btn-outlined'
                }
              >
                Save
              </Button>
            </div>
          </Grid2>
        </Grid2>
      </div>
      <div className="Inspection_Layout">
        <Grid2 container>
          <Grid2 size={4} className="form_layout">
            <Grid2>
              <InspectionForm
                name={name}
                batch={batch}
                date={date}
                location={location}
                description={description}
                handleChangeName={handleChangeName}
                handleChangeBatch={handleChangeBatch}
                handleChangeDate={handleChangeDate}
                handleChangeLocation={handleChangeLocation}
                handleChangeDescription={handleChangeDescription}
              />

              <div className="FileDrop">Attach supporting files/images</div>
              <DragDropUploader
                refreshTable={refreshTable}
                cmAccessToken={cmAccessToken}
                updatePublicationData={updatePublicationData}
              />

              <div className="document_list_table">
                <div className="datatable-wrapper">
                  <DataTable
                    className="datatable-wrapper__table"
                    columns={columns}
                    data={rowData}
                    highlightOnHover
                    pointerOnHover
                    onRowClicked={openViewer}
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
            </Grid2>
          </Grid2>

          <Grid2 size={4}>
            <div style={{ minHeightheight: '580px' }}>
              {isViewerLoading && (
                <div>
                  <div className="spinner-border" />
                  <div className="spinner-base" />
                  <div className="spinner-section" />
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
          </Grid2>

          <Grid2 size={4} className="eswm-dynamic-forms-fields">
            {showInvoiceProperties && <DynamicForm {...documentMetadata} />}
          </Grid2>
        </Grid2>
      </div>
    </div>
  );
}

export default InspectionPage;

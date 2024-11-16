import { Button } from '@mui/material';
import { useState, useRef, useContext } from 'react';
import './DragDropUploader.scss';

import { useAuth } from 'react-oidc-context';
import PropTypes from 'prop-types';
import AppContext from '../../store/context/app-context';
import { uploadFileToCapture } from '../../services/capture/capture';
import CustomToast from '../common/custom_toast/CustomToast';
import { uploadFileToCoreContent } from '../../services/content_storage/ContentStorage';

function DragDropUploader({
  refreshTable,
  updatePublicationData,
}) {
  const { user, signoutRedirect } = useAuth();

  const { setExtractionData } = useContext(AppContext);
  const fileInputRef = useRef(null);
  const toastMessage = 'Please wait, as we automatically classify the content and upload to Content Cloud.';

  const [toastDetails, setToastDetails] = useState({
    type: '',
    isToastOpen: false,
    message: '',
  });

  const handleDragOver = (e) => {
    e.target.style.background = '#395485';
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.target.style.background = 'none';
  };

  const closeToast = () => {
    setToastDetails({
      type: '',
      isToastOpen: false,
      message: '',
    });
  };

  const handleDrop = (e) => {
    setToastDetails({
      type: 'info',
      isToastOpen: true,
      message: toastMessage,
    });
    e.target.style.background = 'none';
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;

    if (droppedFiles.length > 0) {
      uploadFileToCapture(droppedFiles, setExtractionData, user.access_token);
      const newFiles = [];
      for (let i = 0; i < droppedFiles.length; i += 1) {
        const file = droppedFiles[i];

        const reader = new FileReader();

        reader.onload = async () => {
          const fileData = {
            name: file.name,
            type: file.type,
            size: file.size,
            content: reader.result,
          };

          newFiles.push(fileData);
          // Perform upload logic here using the `newFiles` array
          await uploadFileToCoreContent(
            fileData.content,
            user,
            fileData,
            refreshTable,
            updatePublicationData,
            signoutRedirect,
          ).then(() => {
            refreshTable.bind(this);
          });
        };

        reader.readAsArrayBuffer(file);
      }
    }
  };

  const handleFileChange = (e) => {
    setToastDetails({
      type: 'info',
      isToastOpen: true,
      message: toastMessage,
    });
    const newFiles = [];

    if (e.target.files.length > 0) {
      uploadFileToCapture(e.target.files, setExtractionData, user.access_token);
    }

    for (let i = 0; i < e.target.files.length; i += 1) {
      const file = e.target.files[i];

      const reader = new FileReader();
      reader.onload = async () => {
        const fileData = {
          name: file.name,
          type: file.type,
          size: file.size,
          content: reader.result,
        };

        newFiles.push(fileData);

        // Perform upload logic here using the `newFiles` array
        await uploadFileToCoreContent(
          fileData.content,
          user,
          fileData,
          refreshTable,
          updatePublicationData,
          signoutRedirect,
        ).then(() => {
          refreshTable.bind(this);
        });
      };

      reader.readAsArrayBuffer(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div
      id="drag-drop-uploader"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
      className="drag-drop-uploader"
    >
      <span id="drag-drop-all-content">
        <span id="drag-drop-content">
          <div className="drag-drop-content-heading">
            Drag and drop files here
          </div>
          <div className="drag-drop-content-sub-heading">
            Supported formats: JPG, PNG, PDF, DOCS
          </div>
        </span>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          hidden
        />
        <Button variant="outlined" onClick={handleButtonClick}>
          Browse
        </Button>
      </span>

      {toastDetails.isToastOpen && (
        <CustomToast
          type={toastDetails.type}
          isOpen={toastDetails.isToastOpen}
          autoDismiss="8000"
          onClose={closeToast}
        >
          {toastDetails.message}
        </CustomToast>
      )}
    </div>
  );
}

DragDropUploader.propTypes = {
  refreshTable: PropTypes.func,
  updatePublicationData: PropTypes.func,
};

export default DragDropUploader;

/* eslint-disable react/forbid-prop-types */
import { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import DataTable from 'react-data-table-component';
import { useAuth } from 'react-oidc-context';
import { MdDelete } from 'react-icons/md';
import {
  FaCheckCircle, FaFilePdf, FaFileWord, FaSpinner,
} from 'react-icons/fa';
import { PiWarningCircleFill } from 'react-icons/pi';
import AppContext from '../../store/context/app-context';
import { deleteFileToCoreContent } from '../../services/content_metadata/ContentMetadata';

function InspectionTable({
  selectedRow,
  openViewer,
  closeDialog,
  refreshTable,
}) {
  const {
    rowData,
    setRowData,
    extractionData,
  } = useContext(AppContext);
  const { user } = useAuth();

  const conditionalRowStyles = [
    {
      when: (row) => row.id === selectedRow,
      style: {
        backgroundColor: '#eeeeee',
      },
    },
  ];

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

  return (
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
            <div className="file-list__body-content">The list is empty.</div>
          </div>
        )}
      </div>
    </div>
  );
}

InspectionTable.propTypes = {
  selectedRow: PropTypes.string,
  openViewer: PropTypes.func,
  closeDialog: PropTypes.func,
  refreshTable: PropTypes.func,
};

export default InspectionTable;

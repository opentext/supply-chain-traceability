/* eslint-disable react/jsx-props-no-spreading */
import { useEffect, useState, useContext } from 'react';
import './BusinessWorkspace.css';
import { useAuth } from 'react-oidc-context';
import { useParams } from 'react-router-dom';
import DynamicForm from '../dynamic_form/DynamicForm';
import {
  CCM_WS_TYPE_ATTR_BATCH,
  CCM_WS_TYPE_ATTR_DATE,
  CCM_WS_TYPE_ATTR_LOCATION,
  CCM_WS_TYPE_ATTR_NAME,
} from '../../services/core_content/CoreContentConstants';
import { REPORT_FILE_NAME } from '../../utilities/FileConstants';
import { getCMWSNode } from '../../services/content_metadata/ContentMetadata';
import AppContext from '../../store/context/app-context';

function BusinessWorkspace() {
  const CSUI = window.csui;
  const [wsProperties, setWsProperties] = useState({});
  const [reportId, setReportId] = useState('');
  const { cmAccessToken, extractionData } = useContext(AppContext);
  const { user } = useAuth();
  const { nodeId } = useParams();

  const formDefinition = {
    id: 'fd3',
    htmlClass: '',
    mode: 'readonly',
    fields: {
      htmlClass: '',
      entries: [
        {
          label: 'Report Date',
          name: 'Report Date',
          placeholder: 'Date',
          type: 'input',
          value: wsProperties?.[CCM_WS_TYPE_ATTR_DATE]?.value || '',
        },
        {
          label: 'Batch number',
          name: 'Batch number',
          placeholder: 'Batch number',
          type: 'input',
          value: wsProperties?.[CCM_WS_TYPE_ATTR_BATCH]?.value || '',
        },
        {
          label: 'Company name',
          name: 'Company name',
          placeholder: 'Company name',
          type: 'input',
          value: 'Innovate Motor Company EV',
        },
        {
          label: 'Sample ID',
          name: 'Sample ID',
          placeholder: 'Sample ID',
          type: 'input',
          value: 'S-190886',
        },
        {
          label: 'Report ID',
          name: 'Report ID',
          placeholder: 'Report ID',
          type: 'input',
          value: reportId || '',
        },
        {
          label: 'Department',
          name: 'Department',
          placeholder: 'Department',
          type: 'input',
          value: 'QA',
        },
        {
          label: 'Location',
          name: 'Location',
          placeholder: 'Enter location',
          type: 'input',
          value: wsProperties?.[CCM_WS_TYPE_ATTR_LOCATION]?.value || '',
        },
      ],
    },
  };

  function loadWorkSpace() {
    if (CSUI) {
      // eslint-disable-next-line no-unused-vars
      let folderBrowser;
      CSUI.setLanguage('en');
      CSUI.onReady2(
        ['ot2cm/integration/folderbrowser2/folderbrowser2.widget'],
        (FolderBrowserWidget) => {
          CSUI.require.config({
            config: {},
          });
          const options = {
            connection: {
              url: `${process.env.REACT_APP_CCM_SUBSCRIPTION_BASE_URL}/api/v1`,
              session: {
                ticket: `Bearer ${cmAccessToken}`,
              },
              ticket: `Bearer ${cmAccessToken}`,
            },
            start: { id: nodeId },
            breadcrumb: false,
            subscriptionURL: `${process.env.REACT_APP_CCM_SUBSCRIPTION_BASE_URL}/subscriptions/${process.env.REACT_APP_CCM_SUBSCRIPTION_NAME}`,
            elementId: 'ca-folder-widget',
          };
          folderBrowser = new FolderBrowserWidget(options);
        },
      );
    }
  }

  const removeSpinner = () => {
    const element = document.getElementById('wrkspace-page');
    if (element) {
      element.style.display = '';
    }
    loadWorkSpace();
  };

  function getWorkSpaceData() {
    getCMWSNode(user, nodeId).then((res) => {
      setWsProperties(res?.data?.root_folder?.properties);
      removeSpinner();
    });
  }

  useEffect(() => {
    const reportRow = extractionData[REPORT_FILE_NAME]?.data?.find(
      (row) => row.name === 'Report Id',
    );
    if (reportRow) {
      setReportId(reportRow?.value);
    }
    getWorkSpaceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div id="wrkspace-page" style={{ display: 'none' }}>
      <div className="page-header-wc">
        <div>
          <div size={1}>
            <div
              style={{
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'row',
              }}
            >
              <img id="add-file" src="../../images/tuc.svg" alt="Add file" />
              <span className="page-title">
                {wsProperties?.[CCM_WS_TYPE_ATTR_NAME]?.value}
              </span>
            </div>
          </div>
        </div>
      </div>
      <br />
      <div>
        <div>
          <div>
            <DynamicForm {...formDefinition} />
          </div>
        </div>
      </div>
      <div
        id="folder-browser2-content"
        className="row-xs-full"
        style={{ border: '2px' }}
      />
      <div className="row" style={{ height: '600px' }}>
        <div id="ca-folder-widget" />
      </div>
    </div>
  );
}

export default BusinessWorkspace;

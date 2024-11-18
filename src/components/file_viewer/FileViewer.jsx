/* eslint-disable react/forbid-prop-types */
import { useEffect, useState } from 'react';
import axios from 'axios';
import './FileViewer.css';
import PropTypes from 'prop-types';

const VIEWER_ID = 'file-viewer-root';

const sampleLayout = {
  topToolbar: 'sampleToolbar',
  sampleToolbar: {
    left: [{ component: 'ZoomInButton' }, { component: 'ZoomOutButton' }],
    center: [{ component: 'TitleText', style: { marginLeft: '2em' } }],
    right: [{ component: 'CloseButton' }],
  },
  container: { component: 'PageContainer', layoutKey: 'sampleMainLayout' },
  sampleMainLayout: {
    panes: [{ component: 'PageContainer' }],
  },
};

function FileViewer({
  closeDialog,
  publicationData,
  accessToken,
  setIsViewerLoading,
  setIsViewerLoaded,
  viewer,
}) {
  const [bravaApi, setBravaApi] = useState(null);
  const publicationStatus = 'Complete';

  const loadViewer = (data) => {
    const scriptEl = document.createElement('script');
    scriptEl.appendChild(document.createTextNode(data));
    document.getElementsByTagName('head')[0].appendChild(scriptEl);
  };

  const loadBravaViewer = async () => {
    if (!viewer) {
      await axios
        .get(
          `${
            process.env.REACT_APP_BASE_URL
          }/viewer/api/v1/viewers/brava-view-1.x/loader`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        )
        .then((res) => {
          if (res.data) {
            loadViewer(res.data);
          }
        });
    } else {
      loadViewer(viewer);
    }
  };

  useEffect(() => {
    window.addEventListener('bravaReady', (event) => {
      const currentOrigin = window.location.origin;
      if (event.origin && event.origin !== currentOrigin) {
        return;
      }
      if (event.target && event.target.origin === currentOrigin) {
        window.addEventListener(`${event.detail}-close`, () => {
          closeDialog?.();
          setIsViewerLoaded(false);
        });
        window.addEventListener(`${event.detail}-failureNotification`, (e) => {
          if (e.detail.type === 'svgPageLoadFailure') {
            const viewerDisplaying = window.viewerApi;
            viewerDisplaying.clearViewer();
            viewerDisplaying.viewPublication(e.detail.details.pid);
          }
        });
        window.viewerApi = window[event.detail];
        setBravaApi(window[event.detail]);
      }
      // setBravaApi(window[event["detail"]]);
      // openProperties(true);
      setIsViewerLoading(false);
      setIsViewerLoaded(true);
    });
    loadBravaViewer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (bravaApi) {
      bravaApi.setHttpHeaders({
        Authorization: `Bearer ${accessToken}`,
      });
      bravaApi.addPublication(publicationData, true);
      bravaApi.setLayout(sampleLayout);
      bravaApi.render(VIEWER_ID);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bravaApi, publicationData]);

  if (publicationStatus !== 'Complete') {
    return null;
  }

  return <div id={VIEWER_ID} />;
}

FileViewer.propTypes = {
  closeDialog: PropTypes.func,
  publicationData: PropTypes.object,
  accessToken: PropTypes.string,
  setIsViewerLoading: PropTypes.func,
  setIsViewerLoaded: PropTypes.func,
  viewer: PropTypes.string,
};

export default FileViewer;

import React, { useEffect, useState } from "react";
import axios from "axios";
import "./FileViewer.css";

const VIEWER_ID = "file-viewer-root";

const sampleLayout = {
  topToolbar: "sampleToolbar",
  sampleToolbar: {
    left: [{ component: "ZoomInButton" }, { component: "ZoomOutButton" }],
    center: [{ component: "TitleText", style: { marginLeft: "2em" } }],
    right: [{ component: "CloseButton" }],
  },
  container: { component: "PageContainer", layoutKey: "sampleMainLayout" },
  sampleMainLayout: {
    panes: [{ component: "PageContainer" }],
  },
};

const FileViewer = ({
  closeDialog,
  publicationData,
  accessToken,
  setIsViewerLoading,
  setIsViewerLoaded,
  viewer,
}) => {
  const [bravaApi, setBravaApi] = useState(null);
  const publicationStatus = "Complete";

  const loadViewer = (data) => {
    const scriptEl = document.createElement("script");
    scriptEl.appendChild(document.createTextNode(data));
    document.getElementsByTagName("head")[0].appendChild(scriptEl);
  };

  const loadBravaViewer = async () => {
    if (!viewer) {
      await axios
        .get(
          process.env.REACT_APP_BASE_URL +
            "/viewer/api/v1/viewers/brava-view-1.x/loader",
          {
            headers: {
              Authorization: `Bearer ${accessToken.access_token}`,
            },
          }
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.addEventListener("bravaReady", function (event) {
      const currentOrigin = window.location.origin;
      if (event.origin && event.origin !== currentOrigin) {
        return;
      }
      if (event.target && event.target.origin === currentOrigin) {
        window.addEventListener(event["detail"] + "-close", function () {
          closeDialog?.();
          setIsViewerLoaded(false);
        });
        window.addEventListener(
          event["detail"] + "-failureNotification",
          function (e) {
            if (e.detail.type === "svgPageLoadFailure") {
              let viewer = window.viewerApi;
              viewer.clearViewer();
              viewer.viewPublication(e.detail.details.pid);
            }
          }
        );
        window.viewerApi = window[event["detail"]];
        setBravaApi(window[event["detail"]]);
      }
      //setBravaApi(window[event["detail"]]);
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
        Authorization: `Bearer ${accessToken.access_token}`,
      });
      bravaApi.addPublication(publicationData, true);
      bravaApi.setLayout(sampleLayout);
      bravaApi.render(VIEWER_ID);
    }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bravaApi, publicationData]);

  if (publicationStatus !== "Complete") {
    return null;
  }

  return <div id={VIEWER_ID}></div>;
};

export default FileViewer;

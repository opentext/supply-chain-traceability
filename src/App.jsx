import React, { useState, useEffect } from "react";
import { Backdrop, CircularProgress } from "@material-ui/core";
import "./App.scss";
import Header from "./components/header/Header";
import AppContext from "./context/AppContext";
import {
  BrowserRouter,
  Route,
  Switch,
} from "react-router-dom/cjs/react-router-dom.min";

import InspectionPage from "./components/inspection_page/InspectionPage";
import NewWelcomeScreen from "./components/welcome_screen/WelcomeScreen";
import BusinessWorkspace from "./components/business_workspace/BusinessWorkspace";
import CustomToast from "./components/common/custom_toast/CustomToast"
import { AuthProvider, useAuth } from "react-oidc-context";
import OidcConfig from "./components/auth/oidc-config";

function App() {
  const [cmAccessToken, setCMAccessToken] = useState('');
  const [captureAccessToken, setCaptureAccessToken] = useState('');
  const [extractionData, setExtractionData] = useState({});
  const [publicationData, setPublicationData] = useState({});
  const [toastDetails, setToastDetails] = useState({
    type: "",
    isToastOpen: false,
    message: "",
  });
  const [showBackdrop, setShowBackdrop] = useState(false);
  const [rowData, setRowData] = useState([]);

   const { isAuthenticated, isLoading, user, signinRedirect, signoutRedirect } =
    useAuth();

  useEffect(() => {
     if (isLoading) {
     } else if (!isAuthenticated) {
       signinRedirect();
     }
   }, [
     isAuthenticated,
     isLoading,
     signinRedirect,
     user,
   ]);

   useEffect(() => {
     if (isAuthenticated) {
       if (user?.access_token) {
         
       } else {
         signinRedirect();
       }
     }
   }, [
     isAuthenticated,
     signinRedirect,
     user,
   ]);

  const startLoading = () => {
    if (!showBackdrop) setShowBackdrop(true);
  };
  const stopLoading = () => {
    setShowBackdrop(false);
  };

  const appContext = {
    setToastDetails,
    startLoading,
    stopLoading,
    cmAccessToken,
    setCMAccessToken,
    extractionData,
    setExtractionData,
    publicationData,
    setPublicationData,
    captureAccessToken,
    setCaptureAccessToken
  };

  const logoutWithIdTokenHint = () => {
      
  }

  const closeToast = () => {
    setToastDetails({
      type: "",
      isToastOpen: false,
      message: "",
    });
  };
  return (
    <div className="App" hidden={!isAuthenticated}>
      <AppContext.Provider value={appContext}>
        <BrowserRouter>
          <Header logout={logoutWithIdTokenHint} />
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
          <Backdrop style={{ zIndex: 999999 }} open={showBackdrop}>
            <CircularProgress color="inherit" />
          </Backdrop>

          <div className="app_content">
            <Switch>
              <Route
                exact={true}
                path="/"
                render={(props) => (
                  <NewWelcomeScreen {...props} name={user?.profile?.name} />
                )}
              />

              <Route
                path="/upload"
                render={(props) => (
                  <InspectionPage
                    {...props}
                    rowData={rowData}
                    setRowData={setRowData}
                  />
                )}
              />
              <Route
                path="/inspection/:nodeId"
                render={(props) => <BusinessWorkspace {...props} />}
              />
            </Switch>
          </div>
        </BrowserRouter>
      </AppContext.Provider>
    </div>
  );
}

function WrappedSecuredApp() {
  return (
    <AuthProvider {...OidcConfig}>
      <App  />
    </AuthProvider>
  );
}

export default WrappedSecuredApp;

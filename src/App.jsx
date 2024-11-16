import { useEffect, useContext } from 'react';
import { Backdrop, CircularProgress } from '@mui/material';
import './App.scss';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import Header from './components/header/Header';

import InspectionPage from './components/inspection_page/InspectionPage';
import NewWelcomeScreen from './components/welcome_screen/WelcomeScreen';
import BusinessWorkspace from './components/business_workspace/BusinessWorkspace';
import CustomToast from './components/common/custom_toast/CustomToast';
import AppContext from './store/context/app-context';

function App() {
  const {
    isAuthenticated, isLoading, user, signinRedirect, signoutRedirect,
  } = useAuth();
  const { toastDetails, closeToast, showBackdrop } = useContext(AppContext);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      signinRedirect();
    }
  }, [isAuthenticated, isLoading, signinRedirect]);

  return (
    <div className="App" hidden={!isAuthenticated}>
      <Header logout={signoutRedirect} />
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
      <BrowserRouter>
        <div className="app_content">
          <Routes>
            <Route
              exact
              path="/"
              element={<NewWelcomeScreen name={user?.profile?.name} />}
            />

            <Route path="/upload" element={<InspectionPage />} />
            <Route path="/inspection/:nodeId" element={<BusinessWorkspace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

// function WrappedSecuredApp() {
//   return (
//     <AuthProvider {...OidcConfig}>
//       <App  />
//     </AuthProvider>
//   );
// }

export default App;

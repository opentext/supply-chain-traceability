import { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import AppContext from './app-context';

function AppContextProvider({ children }) {
  const [cmAccessToken, setCMAccessToken] = useState('');
  const [extractionData, setExtractionData] = useState({});
  const [publicationData, setPublicationData] = useState({});
  const [toastDetails, setToastDetails] = useState({
    type: '',
    isToastOpen: false,
    message: '',
  });
  const [showBackdrop, setShowBackdrop] = useState(false);
  const [rowData, setRowData] = useState([]);

  const startLoading = useCallback(() => {
    if (!showBackdrop) setShowBackdrop(true);
  }, [showBackdrop]);

  const stopLoading = useCallback(() => {
    setShowBackdrop(false);
  }, []);

  const closeToast = useCallback(() => {
    setToastDetails({
      type: '',
      isToastOpen: false,
      message: '',
    });
  }, []);

  const value = useMemo(
    () => ({
      setToastDetails,
      startLoading,
      stopLoading,
      cmAccessToken,
      setCMAccessToken,
      extractionData,
      setExtractionData,
      publicationData,
      setPublicationData,
      closeToast,
      rowData,
      setRowData,
      toastDetails,
      showBackdrop,
      setShowBackdrop,
    }),
    [startLoading,
      stopLoading,
      cmAccessToken,
      extractionData,
      publicationData, closeToast, rowData, toastDetails, showBackdrop],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

AppContextProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export default AppContextProvider;

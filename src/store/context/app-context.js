import { createContext } from 'react';

const AppContext = createContext({
  setToastDetails: () => {},
  startLoading: () => {},
  stopLoading: () => {},
  cmAccessToken: '',
  setCMAccessToken: () => {},
  extractionData: '',
  setExtractionData: () => {},
  publicationData: '',
  setPublicationData: () => {},
  closeToast: () => {},
  toastDetails: '',
  rowData: [],
  setRowData: () => {},
});

export default AppContext;

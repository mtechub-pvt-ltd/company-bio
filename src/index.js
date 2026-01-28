import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import { store, persistor } from './store';
import { PersistGate } from 'redux-persist/integration/react';
import reportWebVitals from './reportWebVitals';
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router } from "react-router-dom";
import i18n from './multiLingual';
import { Toaster } from 'react-hot-toast'; // ✅ import default Toaster

// LocatorJS setup – only runs in development
if (process.env.NODE_ENV === "development") {
  import("@locator/runtime").then(({ setup }) => {
    setup();
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      {/* <React.StrictMode> */}
        <Router>
          <App />
          {/* <Toaster /> ✅ Default Toaster */}
        </Router>
      {/* </React.StrictMode> */}
    </PersistGate>
  </Provider>
);

reportWebVitals();

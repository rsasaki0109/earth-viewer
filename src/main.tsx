import React from 'react';
import ReactDOM from 'react-dom/client';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './styles.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary title="EarthViewer failed to start">
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);

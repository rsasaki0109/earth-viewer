import { CesiumProvider } from './context/CesiumContext';
import { EarthViewerUI } from './components/EarthViewerUI';

function App(): JSX.Element {
  return (
    <CesiumProvider>
      <EarthViewerUI />
    </CesiumProvider>
  );
}

export default App;

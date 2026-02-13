import { StreamLayer } from '@components/StreamLayer';

function App() {
  // TODO: Get projectId from props or config
  const projectId = '34';

  const theme = 'default';

  return (
    <StreamLayer projectId={projectId} theme={theme}>
      {/* Votre contenu d'application ici */}
    </StreamLayer>
  );
}

export default App;

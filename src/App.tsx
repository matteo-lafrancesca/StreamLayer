import { StreamLayer } from '@components/StreamLayer';

function App() {
  // TODO: Get projectId from props or config
  const projectId = '34';

  return (
    <StreamLayer projectId={projectId}>
      {/* Votre contenu d'application ici */}
    </StreamLayer>
  );
}

export default App;

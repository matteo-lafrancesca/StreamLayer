import { StreamLayer } from '@components/StreamLayer';

function App() {
  // TODO: Récupérer le projectId depuis les props ou la config
  const projectId = '34';

  return (
    <StreamLayer projectId={projectId}>
      {/* Votre contenu d'application ici */}
    </StreamLayer>
  );
}

export default App;

import { StreamLayer } from '@components/StreamLayer';

export interface AppProps {
  projectId?: string;
  theme?: string;
}

function App({ projectId = '34', theme = 'dark' }: AppProps) {
  return (
    <StreamLayer projectId={projectId} theme={theme}>
      {/* Votre contenu d'application ici */}
    </StreamLayer>
  );
}

export default App;

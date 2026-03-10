import { StreamLayer } from '@components/StreamLayer';

export interface AppProps {
  projectId?: string;
  theme?: { primary: string; secondary: string };
}

function App({ projectId = '34', theme = { primary: '#ffffffff', secondary: '#000000ff' } }: AppProps) {
  return (
    <StreamLayer
      projectId={projectId}
      theme={theme}
      apiBaseUrl={import.meta.env.VITE_API_BASE_URL}
      apiKeyId={import.meta.env.VITE_API_KEY_ID}
      userApi={import.meta.env.VITE_USER_API}
      passwordApi={import.meta.env.VITE_PASSWORD_API}
    >
      {/* Votre contenu d'application ici */}
    </StreamLayer>
  );
}

export default App;

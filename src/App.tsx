import { StreamLayer } from '@components/StreamLayer';

export interface AppProps {
  projectId?: string;
  theme?: { primary: string; secondary: string };
  apiBaseUrl?: string;
  apiKeyId?: string;
  userApi?: string;
  passwordApi?: string;
}

function App({
  projectId = '34',
  theme = { primary: '#044683ff', secondary: '#9fa115ff' },
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL,
  apiKeyId = import.meta.env.VITE_API_KEY_ID,
  userApi = import.meta.env.VITE_USER_API,
  passwordApi = import.meta.env.VITE_PASSWORD_API,
}: AppProps) {
  return (
    <StreamLayer
      projectId={projectId}
      theme={theme}
      apiBaseUrl={apiBaseUrl}
      apiKeyId={apiKeyId}
      userApi={userApi}
      passwordApi={passwordApi}
    />
  );
}

export default App;

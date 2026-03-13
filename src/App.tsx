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
  apiBaseUrl = 'https://multiprojects-infra-dev.api-umf.com',
  apiKeyId = '2bf4b9da-80c2-4575-84bc-ee4f71a382ac',
  userApi = 'test_stream_altervoice_editor',
  passwordApi = '46zcfscbfab5gnvqvo09z83l1tlwf52b',
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

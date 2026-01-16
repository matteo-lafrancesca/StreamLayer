import { PlayerProvider } from './context/PlayerContext';
import { Player } from './components/Player/Player';

function App() {
  // TODO: Récupérer le projectId depuis les props ou la config
  const projectId = '34';

  return (
    <PlayerProvider projectId={projectId}>
      <Player />
    </PlayerProvider>
  );
}

export default App;

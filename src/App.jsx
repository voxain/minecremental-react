import { GameLogicProvider } from "./contexts/GameLogicContext";
import MainLayout from "./components/MainLayout/MainLayout";

function App() {
  return (
    <GameLogicProvider>
      <MainLayout />
    </GameLogicProvider>
  );
}

export default App;

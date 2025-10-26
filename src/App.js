import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import About from './components/AboutComponent';
import AppsIndex from './components/AppsIndex';
import Header from './components/HeaderComponent';
import Games from './components/GamesComponent';
import RetroarchApp from './components/RetroarchApp';
import "./app.css"


function App() {
  return (
    <div className="App">
    <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/about" element={<About />} />
            <Route path="/games" element={<Games />} />
            <Route path="/apps" element={<AppsIndex />} />
            <Route path="/apps/retroarch" element={<RetroarchApp />} />
            <Route path="*" element={<Navigate to="/about" replace />}/>
          </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

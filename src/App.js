import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import About from './components/AboutComponent';
import Header from './components/HeaderComponent';
import Games from './components/GamesComponent';
import SessionLauncher from './components/SessionLauncher';
import "./app.css"


function App() {
  return (
    <div className="App">
    <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/about" element={<About />} />
            <Route path="/games" element={<Games />} />
            <Route path="/sessions" element={<SessionLauncher />} />
            <Route path="*" element={<Navigate to="/about" replace />}/>
          </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

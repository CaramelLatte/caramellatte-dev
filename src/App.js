import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import About from './components/AboutComponent';
import Header from './components/HeaderComponent';
import Games from './components/GamesComponent';
import "./app.css"


function App() {
  return (
    <div className="App">
    <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/about" element={<About />} />
            <Route path="/games" element={<Games />} />
          </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
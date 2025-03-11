import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import About from './components/AboutComponent';
import Header from './components/HeaderComponent';
import Games from './components/GamesComponent';
import RateQuoteTool from './components/FreightQuote';
import "./app.css"


function App() {
  return (
    <div className="App">
    <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/about" element={<About />} />
            <Route path="/games" element={<Games />} />
            <Route path="*" element={<Navigate to="/about" replace />}/>
            <Route path="/rate-quote-tool" element={<RateQuoteTool />} />
          </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
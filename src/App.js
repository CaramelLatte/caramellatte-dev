import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import About from './components/AboutComponent';
import AppsIndex from './components/AppsIndex';
import Header from './components/HeaderComponent';
import Footer from './components/FooterComponent';
import Games from './components/GamesComponent';
import Helpdesk from './components/HelpdeskComponent';
import Desktop from './components/DesktopComponent';
import BlogList from './components/BlogComponent';
import BlogPost from './components/BlogPostComponent';
import "./app.css"


function App() {
  return (
    <div className="App">
    <BrowserRouter>
          <Header />
          <main className="page-content">
            <Routes>
              <Route path="/about" element={<About />} />
              <Route path="/games" element={<Games />} />
              <Route path="/apps" element={<AppsIndex />} />
              <Route path="/helpdesk" element={<Helpdesk />} />
              <Route path="/desktop" element={<Desktop />} />
              <Route path="/blog" element={<BlogList />} />
              <Route path="/blog/:postId" element={<BlogPost />} />
              <Route path="*" element={<Navigate to="/about" replace />}/>
            </Routes>
          </main>
          <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;

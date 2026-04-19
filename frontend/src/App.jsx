import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import DetalleTatuaje from './pages/DetalleTatuaje';
import AdminPanel from './pages/AdminPanel';
import SobreNosotros from './pages/SobreNosotros';
import Contacto from './pages/Contacto';
import Promociones from './pages/Promociones';
import { trackVisit } from './services/api';

function App() {
  const location = useLocation();

  useEffect(() => {
    trackVisit(location.pathname);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/promociones" element={<Promociones />} />
          <Route path="/sobre-nosotros" element={<SobreNosotros />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/tatuajes/:id" element={<DetalleTatuaje />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

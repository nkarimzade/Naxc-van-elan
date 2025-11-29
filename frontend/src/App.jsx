
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import React, { useEffect, useRef } from 'react';
import CreateAd from './Components/CreateAd';
import Ads from './Components/Ads';
import IlanDetay from './Components/IlanDetay';
import Admin from './Components/Admin';
import AdminLogin from './Components/AdminLogin';
import Reklam from './Components/Reklam';

function App() {
  const hasLogged = useRef(false);
  
  useEffect(() => {
    if (!hasLogged.current) {
      console.log("%c𝔽𝕠𝕦𝕟𝕕𝕖𝕣 𝕠𝕗 Krisoft", "font-size: 16px; font-weight: bold; color: #1976d2;");
      console.log("%c👉 https://krisoft.shop", "font-size: 14px; color: #059669; text-decoration: underline;");
      hasLogged.current = true;
    }
  }, []);
  return (
    <Router>
      <div className="app-wrapper">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Ads />} />
            <Route path="/elan-yarat" element={<CreateAd />} />
            <Route path="/ilan/:id" element={<IlanDetay />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/reklam" element={<Reklam />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

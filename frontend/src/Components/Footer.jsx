import React from 'react';
import { Link } from 'react-router-dom';
import { FaCode } from 'react-icons/fa';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Logo və Məlumat */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <img src="/Naxauto_logo.png" alt="NaxAuto" className="footer-logo-img" />
              <span>NaxAuto</span>
            </Link>
            <p className="footer-description">
              Naxçıvan'ın ən etibarlı avtomobil elan platforması. 
              Keyfiyyətli avtomobillər və güvənli alış-veriş.
            </p>
          </div>
        </div>

        {/* Məsuliyyət Bildirişi */}
        <div className="footer-disclaimer">
          <div className="disclaimer-content">
            <div className="disclaimer-icon">
              ⚠️
            </div>
            <p>
              <strong>Məsuliyyət:</strong> Saytın Administrasiyası reklam bannerlərinin və 
              yerləşdirilmiş elanların məzmununa görə məsuliyyət daşımır.
            </p>
          </div>
        </div>

        {/* Alt Hissə */}
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <p>© 2025 Bütün Hüquqlar Qorunur.</p>
            <p className="footer-subtitle">NaxAuto - Etibarlı Avtomobil Platforması</p>
          </div>
          
          <div className="footer-bottom-right">
            <div className="powered-by">
              <div className="powered-text">
                <span className="powered-label">Powered by</span>
                <a href="https://krisoft.shop" target="_blank" rel="noopener noreferrer" className="krisoft-brand">
                  <img src="/krisoft_logo.png" alt="KriSoft" className="krisoft-logo-img" />
                  <div className="krisoft-text">
                    <strong>KriSoft</strong>
                    <span>Yazılım  
                    </span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 
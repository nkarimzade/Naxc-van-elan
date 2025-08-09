import { Link } from 'react-router-dom';
import { useState } from 'react';
import './Navbar.css';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <img style={{borderRadius: '50%'}} src="/Naxauto_logo.png" alt="NaxAuto" className="nav-logo" />
        <span>NaxAuto</span>
      </Link>
      
      <div className={`hamburger ${isOpen ? 'active' : ''}`} onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className={`nav-menu ${isOpen ? 'active' : ''}`}>
        <Link to="/" className="nav-item" onClick={closeMenu}>Ana Səhifə</Link>
        <Link to="/elan-yarat" className="nav-item" onClick={closeMenu}>Elan Yarat</Link>
        <Link to="/reklam" className="nav-item" onClick={closeMenu}>Saytda Reklam</Link>
      </div>

      {isOpen && <div className="overlay" onClick={closeMenu}></div>}
    </nav>
  );
}

export default Navbar;

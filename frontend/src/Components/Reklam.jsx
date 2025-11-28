import React, { useState } from 'react';
import { FaEnvelope, FaBullhorn, FaCheck, FaStar, FaPaperPlane } from 'react-icons/fa';
import axios from 'axios';
import './Reklam.css';

function Reklam() {
  const [formData, setFormData] = useState({
    ad: '',
    email: '',
    telefon: '',
    sirket: '',
    reklamNovu: '',
    mesaj: '',
    budjce: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('https://naxc-van-elan-o2sr.onrender.com/api/reklam-talep', formData);
      console.log('Reklam talebi gönderildi:', response.data);
      setSuccess(true);
      setFormData({
        ad: '',
        email: '',
        telefon: '',
        sirket: '',
        reklamNovu: '',
        mesaj: '',
        budjce: ''
      });
    } catch (error) {
      console.error('Form gönderme hatası:', error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Tələb göndərilə bilmədi. Xahiş edirik yenidən cəhd edin.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Reklam tələbi göndərilir...</div>
        <div className="loading-subtext">
          Tələbiniz admin panelə yönləndirilir
        </div>
        <div className="loading-progress">
          <div className="loading-progress-bar"></div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="reklam-container">
        <div className="success-message">
          <div className="success-icon">✅</div>
          <h2>Tələbiniz Uğurla Göndərildi!</h2>
          <p>Reklam tələbiniz uğurla qeyd edildi. Komandamız tezliklə sizinlə əlaqə saxlayacaq.</p>
          <button 
            className="back-btn"
            onClick={() => setSuccess(false)}
          >
            Yeni Tələb Göndər
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reklam-container">
      <div className="reklam-header">
        <div className="reklam-icon">
          <FaBullhorn />
        </div>
        <h1>Səhifədə Reklam</h1>
        <p className="reklam-subtitle">
          NaxAuto platformasında reklam vərərək daha çox müştəriyə çatın
        </p>
      </div>

      <div className="reklam-content">
        <div className="reklam-info">
          <div className="info-section">
            <h2>Niyə NaxAuto'da Reklam Verməlisiniz?</h2>
            <div className="benefits-grid">
              <div className="benefit-item">
                <FaCheck className="benefit-icon" />
                <div className="benefit-text">
                  <h3>Geniş Auditoyra</h3>
                  <p>Naxçıvan'ın ən böyük avtomobil platforması</p>
                </div>
              </div>
              <div className="benefit-item">
                <FaCheck className="benefit-icon" />
                <div className="benefit-text">
                  <h3>Hədəflənmiş Reklam</h3>
                  <p>Avtomobil alıcılarına birbaşa çatın</p>
                </div>
              </div>
              <div className="benefit-item">
                <FaCheck className="benefit-icon" />
                <div className="benefit-text">
                  <h3>Sərfəli Qiymətlər</h3>
                  <p>Uyğun qiymətlərlə maksimum effekt</p>
                </div>
              </div>
              <div className="benefit-item">
                <FaCheck className="benefit-icon" />
                <div className="benefit-text">
                  <h3>Profesional Dəstək</h3>
                  <p>Reklam kampanyanızda tam dəstək</p>
                </div>
              </div>
            </div>
          </div>

          <div className="reklam-types">
            <h2>Reklam Növləri</h2>
            <div className="types-grid">
              <div className="type-card">
                <div className="type-header">
                  <FaStar className="type-icon" />
                  <h3>Banner Reklam</h3>
                </div>
                <ul>
                  <li>Ana səhifədə banner</li>
                  <li>Axtarış nəticələrində</li>
                  <li>İlan detay səhifələrində</li>
                </ul>
              </div>
              <div className="type-card">
                <div className="type-header">
                  <FaStar className="type-icon" />
                  <h3>Sponsored İlan</h3>
                </div>
                <ul>
                  <li>İlanınız ön plana çıxar</li>
                  <li>Axtarışda üstdə görünür</li>
                  <li>Daha çox baxış alır</li>
                </ul>
              </div>
              <div className="type-card">
                <div className="type-header">
                  <FaStar className="type-icon" />
                  <h3>Premium Listing</h3>
                </div>
                <ul>
                  <li>VIP ilan statusu</li>
                  <li>Xüsusi dizayn</li>
                  <li>Daha çox əlaqə</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-section">
          <div className="contact-card">
            <div className="contact-header">
              <FaPaperPlane className="contact-icon" />
              <h2>Reklam Tələbi Göndər</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="contact-form">
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="ad">Ad Soyad *</label>
                  <input
                    type="text"
                    id="ad"
                    name="ad"
                    value={formData.ad}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    placeholder="Adınızı və soyadınızı daxil edin"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">E-mail *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    placeholder="e-mail@example.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="telefon">Telefon *</label>
                  <input
                    type="tel"
                    id="telefon"
                    name="telefon"
                    value={formData.telefon}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    placeholder="+994 XX XXX XX XX"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="sirket">Şirkət/Brend</label>
                  <input
                    type="text"
                    id="sirket"
                    name="sirket"
                    value={formData.sirket}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Şirkətinizin adı (İstəyə bağlı)"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="reklamNovu">Reklam Növü *</label>
                  <select
                    id="reklamNovu"
                    name="reklamNovu"
                    value={formData.reklamNovu}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  >
                    <option value="">Reklam növü seçin</option>
                    <option value="Banner Reklam">Banner Reklam</option>
                    <option value="Sponsored İlan">Sponsored İlan</option>
                    <option value="Premium Listing">Premium Listing</option>
                    <option value="Digər">Digər</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="budjce">Təxmini Büdcə</label>
                  <input
                    type="text"
                    id="budjce"
                    name="budjce"
                    value={formData.budjce}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Məs: 100-500 AZN/ay"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="mesaj">Mesajınız *</label>
                <textarea
                  id="mesaj"
                  name="mesaj"
                  value={formData.mesaj}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  rows="4"
                  placeholder="Reklam məqsədinizi və əlavə məlumatları yazın..."
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                <FaPaperPlane className="btn-icon" />
                Tələbi Göndər
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reklam; 
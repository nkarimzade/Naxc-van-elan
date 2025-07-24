import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './IlanDetay.css';

function IlanDetay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ilan, setIlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchIlan = async () => {
      try {
        const response = await axios.get(`https://naxc-van-elan.onrender.com/api/ilan/${id}`);
        setIlan(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Elan getirme hatası:', error);
        setLoading(false);
      }
    };

    fetchIlan();
  }, [id]);

  const nextImage = () => {
    if (ilan.sekiller && ilan.sekiller.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === ilan.sekiller.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (ilan.sekiller && ilan.sekiller.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? ilan.sekiller.length - 1 : prev - 1
      );
    }
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">İlan detalları yüklənir...</div>
        <div className="loading-subtext">Məlumatlar əldə edilir</div>
        <div className="loading-progress">
          <div className="loading-progress-bar"></div>
        </div>
      </div>
    );
  }

  if (!ilan) {
    return (
      <div className="detail-error">
        <h2>Elan tapılmadı</h2>
        <button onClick={() => navigate('/')}>Ana Səhifəyə Qayıt</button>
      </div>
    );
  }

  return (
    <div className="ilan-detay-container">
      <button className="back-btn" onClick={() => navigate('/')}>
        ← Geri
      </button>

      <div className="detay-content">
        {/* Sol taraf - Görseller */}
        <div className="detay-images">
          <div className="main-image-container">
            {ilan.sekiller && ilan.sekiller.length > 0 ? (
              <>
                <img 
                  src={ilan.sekiller[currentImageIndex]} 
                  alt={`${ilan.marka} ${ilan.model}`}
                  className="main-image"
                />
                {ilan.sekiller.length > 1 && (
                  <>
                    <button className="image-nav prev" onClick={prevImage}>
                      &#10094;
                    </button>
                    <button className="image-nav next" onClick={nextImage}>
                      &#10095;
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="no-image">Şəkil yoxdur</div>
            )}
          </div>
          
          {ilan.sekiller && ilan.sekiller.length > 1 && (
            <div className="image-thumbnails">
              {ilan.sekiller.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${ilan.marka} ${ilan.model} - ${index + 1}`}
                  className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                  onClick={() => goToImage(index)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sağ taraf - Detaylar */}
        <div className="detay-info">
          <div className="detay-header">
            <h1>{ilan.marka} {ilan.model}</h1>
            <div className="price-section">
              <span className="price">{ilan.qiymet} {ilan.qiymetTip}</span>
              {ilan.kredit && <span className="credit-badge">Kreditlə</span>}
              {ilan.barter && <span className="barter-badge">Barter</span>}
            </div>
          </div>

          <div className="detay-specs">
            <div className="spec-grid">
              <div className="spec-item">
                <span className="label">Buraxılış ili:</span>
                <span className="value">{ilan.buraxilis}</span>
              </div>
              <div className="spec-item">
                <span className="label">Ban növü:</span>
                <span className="value">{ilan.ban}</span>
              </div>
              <div className="spec-item">
                <span className="label">Mühərrik:</span>
                <span className="value">{ilan.muherrik}</span>
              </div>
              {ilan.yanacaq && (
                <div className="spec-item">
                  <span className="label">Yanacaq:</span>
                  <span className="value">{ilan.yanacaq}</span>
                </div>
              )}
              <div className="spec-item">
                <span className="label">Sürət qutusu:</span>
                <span className="value">{ilan.suret}</span>
              </div>
              <div className="spec-item">
                <span className="label">Mühərrik həcmi:</span>
                <span className="value">{ilan.hecm} L</span>
              </div>
              <div className="spec-item">
                <span className="label">Güc:</span>
                <span className="value">{ilan.guc} a.g.</span>
              </div>
              <div className="spec-item">
                <span className="label">Ötürücü:</span>
                <span className="value">{ilan.oturucu}</span>
              </div>
              <div className="spec-item">
                <span className="label">Rəng:</span>
                <span className="value">{ilan.reng}</span>
              </div>
              <div className="spec-item">
                <span className="label">Yürüş:</span>
                <span className="value">{ilan.yurush} {ilan.yurushTip}</span>
              </div>
              <div className="spec-item">
                <span className="label">Şəhər:</span>
                <span className="value">{ilan.seher}</span>
              </div>
            </div>

            {/* Vəziyyət */}
            {(ilan.vuruq || ilan.renglenib || ilan.qezali) && (
              <div className="condition-section">
                <h3>Vəziyyəti</h3>
                <div className="condition-items">
                  {ilan.vuruq && <span className="condition-tag">Vuruğu var</span>}
                  {ilan.renglenib && <span className="condition-tag">Rənglənib</span>}
                  {ilan.qezali && <span className="condition-tag">Qəzalı</span>}
                </div>
              </div>
            )}

            {/* Təchizat */}
            {ilan.techizat && ilan.techizat.length > 0 && (
              <div className="equipment-section">
                <h3>Təchizat</h3>
                <div className="equipment-list">
                  {ilan.techizat.map((item, index) => (
                    <span key={index} className="equipment-item">{item}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Əlavə məlumat */}
            {ilan.elave && (
              <div className="additional-info">
                <h3>Əlavə məlumat</h3>
                <p>{ilan.elave}</p>
              </div>
            )}

            {/* VIN kod */}
            {ilan.vin && (
              <div className="vin-section">
                <h3>VIN kod</h3>
                <p className="vin-code">{ilan.vin}</p>
              </div>
            )}
          </div>

          {/* Əlaqə məlumatları */}
          <div className="contact-section">
            <h3>Əlaqə</h3>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-label">Ad:</span>
                <span className="contact-value">{ilan.ad}</span>
              </div>
              <div className="contact-item">
                <span className="contact-label">Telefon:</span>
                <span className="contact-value">+994 {ilan.telefon}</span>
              </div>
              <div className="contact-item">
                <span className="contact-label">E-mail:</span>
                <span className="contact-value">{ilan.email}</span>
              </div>
            </div>
            <div className="contact-buttons">
              <a href={`tel:+994${ilan.telefon.replace(/\s/g, '')}`} className="call-btn">
                📞 Zəng et
              </a>
              <a href={`mailto:${ilan.email}`} className="email-btn">
                ✉️ E-mail göndər
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IlanDetay; 
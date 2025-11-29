import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Admin.css';

function Admin() {
  const navigate = useNavigate();
  const [ilanlar, setIlanlar] = useState([]);
  const [reklamTalepler, setReklamTalepler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('ilanlar');
  const [istatistikler, setIstatistikler] = useState({
    toplamIlan: 0,
    onaylanmisIlan: 0,
    bekleyenIlan: 0,
    reddedilmisIlan: 0
  });

  // Token kontrolü ve admin doğrulama
  useEffect(() => {
    const checkAuth = async () => {
      const startTime = Date.now();
      
      const token = localStorage.getItem('adminToken');
      const user = localStorage.getItem('adminUser');

      if (!token || !user) {
        navigate('/admin/login');
        return;
      }

      try {
          setAdminUser(JSON.parse(user));
        
        await fetchIstatistikler();
        
        await fetchIlanlar();
        
        await fetchReklamTalepler();
        
        const endTime = Date.now();
        
      } catch (error) {
        console.error('❌ Auth kontrolü başarısız:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
      }
    };

    checkAuth();
  }, [navigate]);

  // İlanları getir
  const fetchIlanlar = async () => {
    try {
      const startTime = Date.now();
      setLoading(true);
      
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('https://naxc-van-elan-o2sr.onrender.com/api/admin/ilanlar', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 60000 // 60 saniye timeout
      });
      
      const endTime = Date.now();
      
      setIlanlar(response.data);
    } catch (error) {
      console.error('❌ İlanları alma hatası:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
        return;
      }
      console.error('❌ Hata detayları:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        code: error.code,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          timeout: error.config?.timeout
        }
      });
      setError('İlanlar yüklənə bilmədi. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // İstatistikleri getir
  const fetchIstatistikler = async () => {
    try {
      const startTime = Date.now();
      
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('https://naxc-van-elan-o2sr.onrender.com/api/admin/istatistikler', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 5000 // 5 saniye timeout
      });
      
      const endTime = Date.now();
      
      setIstatistikler(response.data);
    } catch (error) {
      console.error('❌ İstatistik alma hatası:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
      }
    }
  };

  // Reklam taleplerini getir
  const fetchReklamTalepler = async () => {
    try {
      const startTime = Date.now();
      
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('https://naxc-van-elan-o2sr.onrender.com/api/admin/reklam-talepler', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 5000 // 5 saniye timeout
      });
      
      const endTime = Date.now();
      
      setReklamTalepler(response.data);
    } catch (error) {
      console.error('❌ Reklam talepler alma hatası:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
      }
    }
  };

  // İlan onayla/reddet
  const onaylaIlan = async (ilanId, onaylandi, redSebebi = '') => {
    try {
      const adminAdi = adminUser?.username || 'Admin';
      const token = localStorage.getItem('adminToken');
      
      await axios.put(`https://naxc-van-elan-o2sr.onrender.com/api/admin/ilan/${ilanId}`, {
        onaylandi,
        redSebebi,
        adminAdi
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // İlan listesini güncelle
      setIlanlar(prevIlanlar => 
        prevIlanlar.map(ilan => 
          ilan._id === ilanId ? { ...ilan, onaylandi, redSebebi } : ilan
        )
      );
      
      // İstatistikleri güncelle
      await fetchIstatistikler();
      
    } catch (error) {
      console.error('İlan onaylama hatası:', error);
      alert('İlan güncəllənə bilmədi.');
    }
  };

  // İlan sil
  const silIlan = async (ilanId) => {
    if (!window.confirm('Bu ilanı silmək istədiyinizə əminsiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`https://naxc-van-elan-o2sr.onrender.com/api/admin/ilan/${ilanId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // İlan listesinden kaldır
      setIlanlar(prevIlanlar => prevIlanlar.filter(ilan => ilan._id !== ilanId));
      
      // İstatistikleri güncelle
      await fetchIstatistikler();
      
    } catch (error) {
      console.error('İlan silme hatası:', error);
      alert('İlan silinə bilmədi.');
    }
  };

  // Tüm ilanları sil
  const tumIlanlariSil = async () => {
    const onay = window.confirm(
      'DİKKAT: Bu işlem tüm ilanları kalıcı olarak silecek!\n\n' +
      'Bu işlem geri alınamaz. Devam etmek istediğinizden emin misiniz?'
    );
    
    if (!onay) {
      return;
    }

    try {
      const response = await axios.delete('https://naxc-van-elan-o2sr.onrender.com/api/admin/ilanlar/tumunu-sil');
      
      // İlan listesini temizle
      setIlanlar([]);
      
      // İstatistikleri güncelle
      await fetchIstatistikler();
      
      alert(`${response.data.deletedCount} ilan başarıyla silindi!`);
    } catch (error) {
      console.error('Toplu silme hatası:', error);
      alert('İlanlar silinə bilmədi.');
    }
  };

  // Reklam talep durumu güncelle
  const updateReklamDurum = async (talepId, durum, adminQeyd = '') => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`https://naxc-van-elan-o2sr.onrender.com/api/admin/reklam-talep/${talepId}/durum`, {
        durum,
        adminQeyd
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Talep listesini güncelle
      setReklamTalepler(prevTalepler => 
        prevTalepler.map(talep => 
          talep._id === talepId ? { ...talep, durum, adminQeyd } : talep
        )
      );
      
    } catch (error) {
      console.error('Durum güncelleme hatası:', error);
      alert('Durum güncəllənə bilmədi.');
    }
  };

  // Reklam talebi sil
  const silReklamTalep = async (talepId) => {
    if (!window.confirm('Bu reklam tələbini silmək istədiyinizə əminsiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`https://naxc-van-elan-o2sr.onrender.com/api/admin/reklam-talep/${talepId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Talep listesinden kaldır
      setReklamTalepler(prevTalepler => prevTalepler.filter(talep => talep._id !== talepId));
    } catch (error) {
      console.error('Reklam talep silme hatası:', error);
      alert('Reklam tələbi silinə bilmədi.');
    }
  };

  // Çıkış yap
  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  // Yenile
  const refreshData = () => {
    if (activeTab === 'ilanlar') {
      fetchIlanlar();
      fetchIstatistikler();
    } else {
      fetchReklamTalepler();
    }
  };

  // Durum rengini belirle
  const getDurumColor = (durum) => {
    switch (durum) {
      case 'Yeni': return '#f59e0b';
      case 'İnceleniyor': return '#3b82f6';
      case 'Cavablandırıldı': return '#10b981';
      case 'Rədd edildi': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Tarih formatla
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Admin paneli yüklənir...</div>
        <div className="loading-subtext">
          {adminUser ? 'İlanlar və tələplər əldə edilir' : 'Yetkilendirme yoxlanılır'}
        </div>
        <div className="loading-progress">
          <div className="loading-progress-bar"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="admin-header-left">
          <h1>Admin Paneli</h1>
          <p>İlanları və reklam tələplərini idarə edin</p>
        </div>
        <div className="admin-header-right">
          {adminUser && (
            <div className="admin-user-info">
              <span>Xoş gəlmisiniz, <strong>{adminUser.username}</strong></span>
              <button onClick={logout} className="logout-btn">
                Çıxış
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'ilanlar' ? 'active' : ''}`}
          onClick={() => setActiveTab('ilanlar')}
        >
          İlanlar ({ilanlar.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'reklam' ? 'active' : ''}`}
          onClick={() => setActiveTab('reklam')}
        >
          Reklam Tələpləri ({reklamTalepler.length})
        </button>
      </div>

      {activeTab === 'ilanlar' ? (
        <>
          <div className="admin-stats">
            <div className="stat-card">
              <h3>Toplam İlan</h3>
              <p className="stat-number">{istatistikler.toplamIlan}</p>
            </div>
            <div className="stat-card">
              <h3>Onaylanmış</h3>
              <p className="stat-number">{istatistikler.onaylanmisIlan}</p>
            </div>
            <div className="stat-card">
              <h3>Bekleyen</h3>
              <p className="stat-number">{istatistikler.bekleyenIlan}</p>
            </div>
            <div className="stat-card">
              <h3>Reddedilmiş</h3>
              <p className="stat-number">{istatistikler.reddedilmisIlan}</p>
            </div>
            <div className="stat-card">
              <button onClick={refreshData} className="refresh-btn">
                Yenilə
              </button>
            </div>
            <div className="stat-card">
              <button onClick={tumIlanlariSil} className="delete-all-btn">
                Tüm İlanları Sil
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="admin-content">
            {ilanlar.length === 0 ? (
              <p className="no-data">Heç bir ilan tapılmadı.</p>
            ) : (
              <div className="ilanlar-grid">
                {ilanlar.map(ilan => (
                  <div key={ilan._id} className={`ilan-card ${!ilan.onaylandi ? 'pending' : 'approved'}`}>
                    <div className="ilan-status">
                      <span className={`status-badge ${ilan.onaylandi ? 'approved' : 'pending'}`}>
                        {ilan.onaylandi ? 'Onaylanmış' : 'Gözləyir'}
                      </span>
                      {ilan.redSebebi && (
                        <span className="reject-reason">Red: {ilan.redSebebi}</span>
                      )}
                    </div>
                    
                    <div className="ilan-image">
                      {ilan.sekiller && ilan.sekiller.length > 0 ? (
                        <img src={ilan.sekiller[0]} alt={`${ilan.marka} ${ilan.model}`} />
                      ) : (
                        <div className="no-image">Şəkil yoxdur</div>
                      )}
                    </div>
                    
                    <div className="ilan-info">
                      <h3>
                        {ilan.marka} {ilan.model}
                      </h3>
                      <p className="ilan-price">{ilan.qiymet} {ilan.qiymetTip}</p>
                      <div className="ilan-details">
                        <span>{ilan.buraxilis} il</span>
                        <span>{ilan.yurush} {ilan.yurushTip}</span>
                        <span>{ilan.seher}</span>
                      </div>
                      <div className="ilan-contact">
                        <p><strong>Ad:</strong> {ilan.ad}</p>
                        <p><strong>Telefon:</strong> {ilan.telefon}</p>
                        <p><strong>Email:</strong> {ilan.email}</p>
                      </div>
                      <div className="ilan-date">
                        <span>Oluşturma: {formatDate(ilan.olusturmaTarihi)}</span>
                        {ilan.onayTarihi && (
                          <span>Onay: {formatDate(ilan.onayTarihi)}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="ilan-actions">
                      {!ilan.onaylandi ? (
                        <>
                          <button 
                            onClick={() => onaylaIlan(ilan._id, true)}
                            className="approve-btn"
                          >
                            Onayla
                          </button>
                          <button 
                            onClick={() => {
                              const redSebebi = prompt('Red sebebini yazın:');
                              if (redSebebi !== null) {
                                onaylaIlan(ilan._id, false, redSebebi);
                              }
                            }}
                            className="reject-btn"
                          >
                            Reddet
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => onaylaIlan(ilan._id, false)}
                          className="unapprove-btn"
                        >
                          Onayı Kaldır
                        </button>
                      )}
                      <button 
                        onClick={() => navigate(`/ilan/${ilan._id}`)}
                        className="view-btn"
                      >
                        Bax
                      </button>
                      <button 
                        onClick={() => silIlan(ilan._id)}
                        className="delete-btn"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="admin-stats">
            <div className="stat-card">
              <h3>Toplam Tələb</h3>
              <p className="stat-number">{reklamTalepler.length}</p>
            </div>
            <div className="stat-card">
              <h3>Yeni</h3>
              <p className="stat-number">{reklamTalepler.filter(t => t.durum === 'Yeni').length}</p>
            </div>
            <div className="stat-card">
              <h3>Cavablandırıldı</h3>
              <p className="stat-number">{reklamTalepler.filter(t => t.durum === 'Cavablandırıldı').length}</p>
            </div>
            <div className="stat-card">
              <button onClick={refreshData} className="refresh-btn">
                Yenilə
              </button>
            </div>
          </div>

          <div className="admin-content">
            {reklamTalepler.length === 0 ? (
              <p className="no-data">Heç bir reklam tələbi tapılmadı.</p>
            ) : (
              <div className="reklam-grid">
                {reklamTalepler.map(talep => (
                  <div key={talep._id} className="reklam-card">
                    <div className="reklam-header">
                      <div className="reklam-info">
                        <h3>{talep.ad}</h3>
                        <p className="reklam-company">{talep.sirket || 'Şirkət bilgisi yox'}</p>
                      </div>
                      <div 
                        className="durum-badge"
                        style={{ backgroundColor: getDurumColor(talep.durum) }}
                      >
                        {talep.durum}
                      </div>
                    </div>
                    
                    <div className="reklam-details">
                      <div className="detail-row">
                        <strong>E-mail:</strong> {talep.email}
                      </div>
                      <div className="detail-row">
                        <strong>Telefon:</strong> {talep.telefon}
                      </div>
                      <div className="detail-row">
                        <strong>Reklam Növü:</strong> {talep.reklamNovu}
                      </div>
                      {talep.budjce && (
                        <div className="detail-row">
                          <strong>Büdcə:</strong> {talep.budjce}
                        </div>
                      )}
                      <div className="detail-row">
                        <strong>Mesaj:</strong>
                        <p className="mesaj-text">{talep.mesaj}</p>
                      </div>
                      <div className="detail-row">
                        <strong>Tarix:</strong> {formatDate(talep.createdAt)}
                      </div>
                    </div>

                    <div className="reklam-actions">
                      <select 
                        value={talep.durum}
                        onChange={(e) => updateReklamDurum(talep._id, e.target.value)}
                        className="durum-select"
                      >
                        <option value="Yeni">Yeni</option>
                        <option value="İnceleniyor">İnceleniyor</option>
                        <option value="Cavablandırıldı">Cavablandırıldı</option>
                        <option value="Rədd edildi">Rədd edildi</option>
                      </select>
                      <button 
                        onClick={() => silReklamTalep(talep._id)}
                        className="delete-btn"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Admin; 
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

  // Token kontrolü ve admin doğrulama
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken');
      const user = localStorage.getItem('adminUser');

      if (!token || !user) {
        navigate('/admin/login');
        return;
      }

      try {
        // Token'ı doğrula
        const response = await axios.get('http://localhost:5000/api/admin/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.valid) {
          setAdminUser(JSON.parse(user));
          await Promise.all([fetchIlanlar(token), fetchReklamTalepler(token)]);
        } else {
          throw new Error('Token geçersiz');
        }
      } catch (error) {
        console.error('Auth kontrolü başarısız:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
      }
    };

    checkAuth();
  }, [navigate]);

  // İlanları getir
  const fetchIlanlar = async (token) => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/admin/ilanlar', {
        headers: {
          'Authorization': `Bearer ${token || localStorage.getItem('adminToken')}`
        }
      });
      setIlanlar(response.data);
      console.log('Admin ilanları yüklendi:', response.data.length);
    } catch (error) {
      console.error('İlanları alma hatası:', error);
      setError('İlanlar yüklənə bilmədi.');
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  // Reklam taleplerini getir
  const fetchReklamTalepler = async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/reklam-talepler', {
        headers: {
          'Authorization': `Bearer ${token || localStorage.getItem('adminToken')}`
        }
      });
      setReklamTalepler(response.data);
      console.log('Reklam talepler yüklendi:', response.data.length);
    } catch (error) {
      console.error('Reklam talepler alma hatası:', error);
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  // İlan onayla
  const onaylaIlan = async (ilanId) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`http://localhost:5000/api/admin/ilan/${ilanId}/onayla`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // İlan listesini güncelle
      setIlanlar(prevIlanlar => 
        prevIlanlar.map(ilan => 
          ilan._id === ilanId ? { ...ilan, onaylanmis: true } : ilan
        )
      );
      
      console.log('İlan onaylandı:', ilanId);
    } catch (error) {
      console.error('İlan onaylama hatası:', error);
      alert('İlan onaylanamadı.');
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  // İlan sil
  const silIlan = async (ilanId) => {
    if (!window.confirm('Bu ilanı silmək istədiyinizə əminsiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`http://localhost:5000/api/ilan/${ilanId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // İlan listesinden kaldır
      setIlanlar(prevIlanlar => prevIlanlar.filter(ilan => ilan._id !== ilanId));
      console.log('İlan silindi:', ilanId);
    } catch (error) {
      console.error('İlan silme hatası:', error);
      alert('İlan silinə bilmədi.');
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  // Reklam talep durumu güncelle
  const updateReklamDurum = async (talepId, durum, adminQeyd = '') => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`http://localhost:5000/api/admin/reklam-talep/${talepId}/durum`, {
        durum,
        adminQeyd
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Talep listesini güncelle
      setReklamTalepler(prevTalepler => 
        prevTalepler.map(talep => 
          talep._id === talepId ? { ...talep, durum, adminQeyd } : talep
        )
      );
      
      console.log('Reklam talep durumu güncellendi:', talepId, durum);
    } catch (error) {
      console.error('Durum güncelleme hatası:', error);
      alert('Durum güncəllənə bilmədi.');
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  // Reklam talebi sil
  const silReklamTalep = async (talepId) => {
    if (!window.confirm('Bu reklam tələbini silmək istədiyinizə əminsiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`http://localhost:5000/api/admin/reklam-talep/${talepId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Talep listesinden kaldır
      setReklamTalepler(prevTalepler => prevTalepler.filter(talep => talep._id !== talepId));
      console.log('Reklam talebi silindi:', talepId);
    } catch (error) {
      console.error('Reklam talep silme hatası:', error);
      alert('Reklam tələbi silinə bilmədi.');
      if (error.response?.status === 401) {
        logout();
      }
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
              <p className="stat-number">{ilanlar.length}</p>
            </div>
            <div className="stat-card">
              <h3>Onaylanmış</h3>
              <p className="stat-number">{ilanlar.filter(ilan => ilan.onaylanmis).length}</p>
            </div>
            <div className="stat-card">
              <h3>Bekleyen</h3>
              <p className="stat-number">{ilanlar.filter(ilan => !ilan.onaylanmis).length}</p>
            </div>
            <div className="stat-card">
              <button onClick={refreshData} className="refresh-btn">
                Yenilə
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
                  <div key={ilan._id} className={`ilan-card ${!ilan.onaylanmis ? 'pending' : 'approved'}`}>
                    <div className="ilan-status">
                      <span className={`status-badge ${ilan.onaylanmis ? 'approved' : 'pending'}`}>
                        {ilan.onaylanmis ? 'Onaylanmış' : 'Gözləyir'}
                      </span>
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
                        {ilan.otherMarka || ilan.marka} {ilan.otherModel || ilan.model}
                      </h3>
                      <p className="ilan-price">{ilan.qiymet} {ilan.qiymetTip}</p>
                      <div className="ilan-details">
                        <span>{ilan.buraxilis} il</span>
                        <span>{ilan.yurush} km</span>
                        <span>{ilan.seher}</span>
                      </div>
                      <div className="ilan-contact">
                        <p><strong>Ad:</strong> {ilan.ad}</p>
                        <p><strong>Telefon:</strong> {ilan.telefon}</p>
                        <p><strong>Email:</strong> {ilan.email}</p>
                      </div>
                      <div className="ilan-date">
                        <span>Tarix: {new Date(ilan.createdAt).toLocaleDateString('az-AZ')}</span>
                      </div>
                    </div>
                    
                    <div className="ilan-actions">
                      {!ilan.onaylanmis && (
                        <button 
                          onClick={() => onaylaIlan(ilan._id)}
                          className="approve-btn"
                        >
                          Onayla
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
                        <strong>Tarix:</strong> {new Date(talep.createdAt).toLocaleDateString('az-AZ')}
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
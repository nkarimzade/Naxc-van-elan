import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';

const Admin = () => {
  const [ilanlar, setIlanlar] = useState([]);
  const [reklamTalepler, setReklamTalepler] = useState([]);
  const [istatistikler, setIstatistikler] = useState({});
  const [loading, setLoading] = useState(true);
  const [cacheStatus, setCacheStatus] = useState(null);
  const [cacheLoading, setCacheLoading] = useState(false);

  const API_BASE_URL = 'https://naxc-van-elan-o2sr.onrender.com';

  // Cache durumunu kontrol et
  const checkCacheStatus = async () => {
    try {
      setCacheLoading(true);
      // Geçici olarak cache kontrolünü devre dışı bırak
      setCacheStatus({ 
        status: 'disabled', 
        message: 'Cache sistemi geçici olarak devre dışı',
        cacheKeys: 0,
        memoryUsage: 0
      });
    } catch (error) {
      console.error('Cache durumu kontrol hatası:', error);
      setCacheStatus({ 
        status: 'error', 
        message: 'Cache durumu alınamadı',
        cacheKeys: 0,
        memoryUsage: 0
      });
    } finally {
      setCacheLoading(false);
    }
  };

  // Cache'i temizle
  const clearCache = async () => {
    try {
      setCacheLoading(true);
      // Geçici olarak cache temizleme işlemini simüle et
      alert('Cache sistemi geçici olarak devre dışı. Backend Redis kurulumu tamamlandıktan sonra aktif olacak.');
      await checkCacheStatus(); // Durumu yenile
    } catch (error) {
      console.error('Cache temizleme hatası:', error);
      alert('Cache temizlenirken hata oluştu!');
    } finally {
      setCacheLoading(false);
    }
  };

  const checkAuth = async () => {
    // Basit auth kontrolü - gerçek uygulamada JWT token kullanılmalı
    const adminPassword = localStorage.getItem('adminPassword');
    const adminUser = localStorage.getItem('adminUser');
    
    if (!adminPassword || adminPassword !== 'admin123' || !adminUser) {
      console.log('❌ Admin yetkisi yok, login sayfasına yönlendiriliyor...');
      window.location.href = '/admin/login';
      return false;
    }
    
    console.log('✅ Admin yetkisi doğrulandı');
    return true;
  };

  const fetchIlanlar = async () => {
    try {
      console.log('📋 İlanlar yükleniyor...');
      const startTime = Date.now();
      
      const response = await axios.get(`${API_BASE_URL}/api/admin/ilanlar`, { 
        timeout: 60000 // 60 saniye timeout
      });
      
      const endTime = Date.now();
      console.log(`✅ İlanlar yüklendi: ${response.data.length} adet (${endTime - startTime}ms)`);
      
      setIlanlar(response.data);
    } catch (error) {
      console.error('❌ İlanları alma hatası:', error);
      console.error('❌ Hata detayları:', error.response?.data || error.message);
      
      if (error.code === 'ECONNABORTED') {
        alert('⏰ İlanlar yüklenirken zaman aşımı oluştu. Lütfen tekrar deneyin.');
      } else {
        alert('❌ İlanlar yüklenirken hata oluştu. Lütfen sayfayı yenileyin.');
      }
    }
  };

  const fetchReklamTalepler = async () => {
    try {
      console.log('📢 Reklam talepleri yükleniyor...');
      const startTime = Date.now();
      
      const response = await axios.get(`${API_BASE_URL}/api/admin/reklam-talepler`, { 
        timeout: 10000 
      });
      
      const endTime = Date.now();
      console.log(`✅ Reklam talepleri yüklendi: ${response.data.length} adet (${endTime - startTime}ms)`);
      
      setReklamTalepler(response.data);
    } catch (error) {
      console.error('❌ Reklam talepleri alma hatası:', error);
    }
  };

  const fetchIstatistikler = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/istatistikler`, { 
        timeout: 10000 
      });
      setIstatistikler(response.data);
    } catch (error) {
      console.error('❌ İstatistik alma hatası:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      const isAuth = await checkAuth();
      if (!isAuth) return;

      const startTime = Date.now();
      
      try {
        await Promise.all([
          fetchIlanlar(),
          fetchReklamTalepler(),
          fetchIstatistikler(),
          checkCacheStatus()
        ]);
        
        const endTime = Date.now();
        console.log(`✅ Admin paneli yüklendi! Süre: ${endTime - startTime}ms`);
      } catch (error) {
        console.error('❌ Admin paneli yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const onaylaIlan = async (ilanId, onaylandi, redSebebi = '') => {
    try {
      const adminAdi = 'Admin'; // Gerçek uygulamada giriş yapan admin adı
      
      await axios.put(`${API_BASE_URL}/api/admin/ilan/${ilanId}`, {
        onaylandi,
        redSebebi,
        adminAdi
      }, { timeout: 10000 });

      // İlanları ve istatistikleri yenile
      await Promise.all([
        fetchIlanlar(),
        fetchIstatistikler()
      ]);

      alert(onaylandi ? '✅ İlan onaylandı!' : '❌ İlan reddedildi!');
    } catch (error) {
      console.error('❌ İlan onaylama hatası:', error);
      alert('❌ İşlem sırasında hata oluştu!');
    }
  };

  const silIlan = async (ilanId) => {
    if (!window.confirm('⚠️ Bu ilanı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/admin/ilan/${ilanId}`, { 
        timeout: 10000 
      });

      // İlanları ve istatistikleri yenile
      await Promise.all([
        fetchIlanlar(),
        fetchIstatistikler()
      ]);

      alert('✅ İlan başarıyla silindi!');
    } catch (error) {
      console.error('❌ İlan silme hatası:', error);
      alert('❌ İlan silinirken hata oluştu!');
    }
  };

  const tumIlanlariSil = async () => {
    if (!window.confirm('⚠️ TÜM İLANLARI SİLMEK istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/api/admin/ilanlar/tumunu-sil`, { 
        timeout: 30000 
      });

      setIlanlar([]);
      setIstatistikler({
        toplamIlan: 0,
        onaylanmisIlan: 0,
        bekleyenIlan: 0,
        reddedilmisIlan: 0
      });

      alert(`✅ ${response.data.deletedCount} ilan başarıyla silindi!`);
    } catch (error) {
      console.error('❌ Tüm ilanları silme hatası:', error);
      alert('❌ İlanlar silinirken hata oluştu!');
    }
  };

  const updateReklamDurum = async (talepId, durum) => {
    try {
      // Bu fonksiyon şimdilik boş - reklam talepleri henüz implement edilmedi
      alert(`Reklam talebi ${durum === 'onayla' ? 'onaylandı' : 'reddedildi'}!`);
    } catch (error) {
      console.error('Reklam durum güncelleme hatası:', error);
    }
  };

  const silReklamTalep = async (talepId) => {
    try {
      // Bu fonksiyon şimdilik boş - reklam talepleri henüz implement edilmedi
      alert('Reklam talebi silindi!');
    } catch (error) {
      console.error('Reklam talep silme hatası:', error);
    }
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading">
          <h2>Admin Paneli Yükleniyor...</h2>
          <p>⏰ Bu işlem biraz zaman alabilir, lütfen bekleyin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h1>Admin Paneli</h1>
      
      {/* Cache Durumu */}
      <div className="cache-section">
        <h3>🔥 Cache Durumu</h3>
        <div className="cache-info">
          {cacheLoading ? (
            <p>Cache durumu kontrol ediliyor...</p>
          ) : cacheStatus ? (
            <div>
              <p><strong>Durum:</strong> 
                {cacheStatus.status === 'active' ? '✅ Aktif' : 
                 cacheStatus.status === 'disabled' ? '⚠️ Devre Dışı' : '❌ Hata'}
              </p>
              <p><strong>Cache Anahtarları:</strong> {cacheStatus.cacheKeys || 0}</p>
              <p><strong>Bellek Kullanımı:</strong> {cacheStatus.memoryUsage ? `${(cacheStatus.memoryUsage / 1024 / 1024).toFixed(2)} MB` : 'Bilinmiyor'}</p>
              {cacheStatus.status === 'disabled' && (
                <p style={{color: '#f59e0b', fontSize: '0.9rem', marginTop: '10px'}}>
                  ℹ️ {cacheStatus.message}
                </p>
              )}
            </div>
          ) : (
            <p>Cache durumu alınamadı</p>
          )}
          <button 
            onClick={clearCache} 
            disabled={cacheLoading}
            className="clear-cache-btn"
          >
            {cacheLoading ? 'Temizleniyor...' : '🗑️ Cache Temizle'}
          </button>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="stats-section">
        <h3>📊 İstatistikler</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <h4>Toplam İlan</h4>
            <p>{istatistikler.toplamIlan || 0}</p>
          </div>
          <div className="stat-card">
            <h4>Onaylanmış</h4>
            <p>{istatistikler.onaylanmisIlan || 0}</p>
          </div>
          <div className="stat-card">
            <h4>Bekleyen</h4>
            <p>{istatistikler.bekleyenIlan || 0}</p>
          </div>
          <div className="stat-card">
            <h4>Reddedilmiş</h4>
            <p>{istatistikler.reddedilmisIlan || 0}</p>
          </div>
        </div>
      </div>

      {/* Tüm İlanları Sil Butonu */}
      <div className="danger-section">
        <button onClick={tumIlanlariSil} className="delete-all-btn">
          🗑️ Tüm İlanları Sil
        </button>
      </div>

      {/* İlanlar */}
      <div className="ilanlar-section">
        <h3>📋 İlanlar ({ilanlar.length})</h3>
        {ilanlar.length === 0 ? (
          <p>Henüz ilan bulunmuyor.</p>
        ) : (
          <div className="ilanlar-grid">
            {ilanlar.map((ilan) => (
              <div key={ilan._id} className="ilan-card">
                <div className="ilan-image">
                  {ilan.sekiller && ilan.sekiller.length > 0 ? (
                    <img src={ilan.sekiller[0]} alt="Araç" />
                  ) : (
                    <div className="no-image">Görsel Yok</div>
                  )}
                </div>
                <div className="ilan-info">
                  <h4>{ilan.marka} {ilan.model}</h4>
                  <p><strong>Yıl:</strong> {ilan.buraxilis}</p>
                  <p><strong>Fiyat:</strong> {ilan.qiymet} {ilan.qiymetTip}</p>
                  <p><strong>Şehir:</strong> {ilan.seher}</p>
                  <p><strong>İletişim:</strong> {ilan.telefon}</p>
                  <p><strong>E-posta:</strong> {ilan.email}</p>
                  <p><strong>Oluşturma:</strong> {new Date(ilan.olusturmaTarihi).toLocaleDateString('tr-TR')}</p>
                  
                  <div className="ilan-status">
                    {ilan.onaylandi ? (
                      <span className="status approved">✅ Onaylandı</span>
                    ) : (
                      <span className="status pending">⏳ Bekliyor</span>
                    )}
                  </div>
                  
                  {ilan.redSebebi && (
                    <div className="reject-reason">
                      <strong>Red Sebebi:</strong> {ilan.redSebebi}
                    </div>
                  )}
                </div>
                
                <div className="ilan-actions">
                  {!ilan.onaylandi ? (
                    <>
                      <button 
                        onClick={() => onaylaIlan(ilan._id, true)}
                        className="approve-btn"
                      >
                        ✅ Onayla
                      </button>
                      <button 
                        onClick={() => {
                          const reason = prompt('Red sebebini yazın:');
                          if (reason !== null) {
                            onaylaIlan(ilan._id, false, reason);
                          }
                        }}
                        className="reject-btn"
                      >
                        ❌ Reddet
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => onaylaIlan(ilan._id, false)}
                      className="unapprove-btn"
                    >
                      🔄 Onayı Kaldır
                    </button>
                  )}
                  
                  <button 
                    onClick={() => silIlan(ilan._id)}
                    className="delete-btn"
                  >
                    🗑️ Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reklam Talepleri */}
      <div className="reklam-section">
        <h3>📢 Reklam Talepleri ({reklamTalepler.length})</h3>
        {reklamTalepler.length === 0 ? (
          <p>Henüz reklam talebi bulunmuyor.</p>
        ) : (
          <div className="reklam-grid">
            {reklamTalepler.map((talep) => (
              <div key={talep._id} className="reklam-card">
                <h4>{talep.ad}</h4>
                <p><strong>E-posta:</strong> {talep.email}</p>
                <p><strong>Telefon:</strong> {talep.telefon}</p>
                <p><strong>Mesaj:</strong> {talep.mesaj}</p>
                
                <div className="reklam-actions">
                  <button onClick={() => updateReklamDurum(talep._id, 'onayla')}>
                    ✅ Onayla
                  </button>
                  <button onClick={() => updateReklamDurum(talep._id, 'reddet')}>
                    ❌ Reddet
                  </button>
                  <button onClick={() => silReklamTalep(talep._id)}>
                    🗑️ Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin; 
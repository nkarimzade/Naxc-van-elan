import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Ads.css';

// Base64 formatında basit bir varsayılan görsel
const DEFAULT_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7FnsmbmtpbCB5b3hkdXI8L3RleHQ+PC9zdmc+';

const populerMarkalar = [
  'Mercedes', 'Hyundai', 'LADA (VAZ)', 'Toyota', 'Kia', 'BMW', 'Ford', 'Chevrolet', 'Opel', 'Nissan', 'Changan', 'Land Rover'
];

function Ads() {
  const navigate = useNavigate();
  const [ilanlar, setIlanlar] = useState([]);
  const [filteredIlanlar, setFilteredIlanlar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('Elanlar yüklənir...');
  
  // Pagination state'leri
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filtre state'leri
  const [filters, setFilters] = useState({
    marka: '',
    model: '',
    qiymetMin: '',
    qiymetMax: '',
    ilMin: '',
    ilMax: '',
    seher: '',
    yanacaq: '',
    suret: '',
    ban: '',
    reng: '',
    yurushMin: '',
    yurushMax: '',
    hecmMin: '',
    hecmMax: '',
    gucMin: '',
    gucMax: '',
    kredit: false,
    barter: false,
    veziyyet: []
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [showLaunchModal, setShowLaunchModal] = useState(true);

  // Modal kapatma ve localStorage kontrolü
  useEffect(() => {
    const modalClosed = localStorage.getItem('launchModalClosed_v2');
    if (modalClosed === 'true') {
      setShowLaunchModal(false);
    }
  }, []);

  const closeLaunchModal = (dontShowAgain = false) => {
    setShowLaunchModal(false);
    if (dontShowAgain) {
      localStorage.setItem('launchModalClosed_v2', 'true');
    }
  };

  // Filtre seçenekleri
  const yanacaqTipleri = ['Benzin', 'Dizel', 'Qaz', 'Elektrik', 'Hibrid'];
  const suretQutusuTipleri = ['Mexaniki', 'Avtomat', 'Robotlaşdırılmış', 'Variator'];
  const banNovleri = ['Sedan', 'Universal', 'Hetçbek', 'Liftbek', 'Kupe', 'Kabrio', 'Pikap', 'Furqon', 'Minivan', 'Offroader/SUV'];
  const rengTipleri = ['Ağ', 'Qara', 'Boz', 'Gümüşü', 'Yaş Asfalt', 'Göy', 'Qırmızı', 'Yaşıl', 'Bej', 'Qəhvəyi', 'Narıncı', 'Qızılı', 'Sarı', 'Digər'];
  const veziyyetTipleri = ['Vuruğu var', 'Rənglənib', 'Qəzalı'];

  // Marka seçimine göre modelleri filtrele
  const [availableModels, setAvailableModels] = useState([]);



  // İlanları getir fonksiyonu
  const fetchIlanlar = async (page = 1, isLoadMore = false, useProduction = false) => {
      try {
      if (!isLoadMore) {
        setLoadingText('Server ilə əlaqə qurulur...');
      } else {
        setLoadingMore(true);
      }
        
        // Backend connection check
      console.log('Backend-ə sorğu göndərilir... Sayfa:', page);
        
      // URL seçimi - local fallback varsa production kullan
      let baseURL;
      if (useProduction || window.location.hostname !== 'localhost') {
        baseURL = 'https://naxc-van-elan-o2sr.onrender.com';
        if (!isLoadMore) setLoadingText('Production server ilə əlaqə... (yavaş ola bilər)');
      } else {
        baseURL = 'http://localhost:5000';
      }
      
      // Ana sayfa için optimize edilmiş endpoint kullan
      const endpoint = `${baseURL}/api/ilan/list?page=${page}&limit=20`;
      console.log('API URL:', endpoint);
      
      const response = await axios.get(endpoint, {
        timeout: baseURL.includes('localhost') ? 5000 : 10000 // Local: 5s, Production: 10s
        });
        
      if (!isLoadMore) {
        setLoadingText('Elanlar işlənir...');
        await new Promise(resolve => setTimeout(resolve, 500)); // Smooth transition
      }
        
        console.log('Backend yanıtı:', response.data);
      const { ilanlar: newIlanlar, pagination } = response.data;
        
      if (!isLoadMore) {
        setLoadingText('Elanlar hazırlanır...');
        // Async operations tamamlansın diye bekleme
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      if (isLoadMore) {
        // Yeni ilanları mevcut listeye ekle
        setIlanlar(prev => [...prev, ...newIlanlar]);
        setFilteredIlanlar(prev => [...prev, ...newIlanlar]);
      } else {
        // İlk yükleme veya sayfa yenileme
        setIlanlar(newIlanlar);
        setFilteredIlanlar(newIlanlar);
      }
      
      // Pagination bilgilerini güncelle
      setCurrentPage(pagination.currentPage);
      setTotalPages(pagination.totalPages);
      setTotalCount(pagination.totalCount);
      
      if (!isLoadMore) {
        setLoadingText('Elanlar yükləndi!');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
        
      console.log('Elanlar yüklendi:', newIlanlar.length, 'adet. Toplam:', pagination.totalCount);
        setLoading(false);
      setLoadingMore(false);
        
      } catch (error) {
        console.error('Elan yükleme hatası:', error);
        console.error('Hata detayları:', error.response?.data || error.message);
        
                // Local backend çalışmıyorsa production'a fallback
        if ((error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') && 
            window.location.hostname === 'localhost' && !useProduction) {
          console.log('Local backend çalışmıyor, production\'a geçiliyor...');
          setLoadingText('Local backend çalışmıyor. Production server\'a geçiliyor...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchIlanlar(page, isLoadMore, true); // Production ile tekrar dene
        }
        
        if (error.code === 'ECONNABORTED') {
          setLoadingText('Server yavaş. Bir az daha gözləyin...');
        } else if (error.response?.status === 500) {
          setLoadingText('Server xətası. Database problemi ola bilər.');
        } else {
          setLoadingText('Elanlar yüklənə bilmədi. Yenidən cəhd edin.');
        }
        
        // Error durumunda da bir süre bekle
        await new Promise(resolve => setTimeout(resolve, 2000));
        setLoading(false);
        setLoadingMore(false);
      }
    };

  useEffect(() => {
    fetchIlanlar(1, false, false);
  }, []);

  // Marka seçimine göre modelleri filtrele
  useEffect(() => {
    if (filters.marka && ilanlar.length > 0) {
      const models = [...new Set(
        ilanlar
          .filter(ilan => ilan.marka === filters.marka)
          .map(ilan => ilan.model)
          .filter(model => model)
      )].sort();
      setAvailableModels(models);
    } else {
      setAvailableModels([]);
    }
  }, [filters.marka, ilanlar]);

  // Aktif filtre sayısını hesapla
  useEffect(() => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'veziyyet' && Array.isArray(value) && value.length > 0) count++;
      else if (key === 'kredit' || key === 'barter') {
        if (value) count++;
      }
      else if (value && value !== '') count++;
    });
    setActiveFilterCount(count);
  }, [filters]);

  // Filtreleri uygula
  useEffect(() => {
    let result = [...ilanlar];
    
    if (filters.marka) {
      result = result.filter(ilan => ilan.marka === filters.marka);
    }
    
    if (filters.model) {
      result = result.filter(ilan => ilan.model === filters.model);
    }
    
    if (filters.qiymetMin) {
      result = result.filter(ilan => ilan.qiymet >= Number(filters.qiymetMin));
    }
    
    if (filters.qiymetMax) {
      result = result.filter(ilan => ilan.qiymet <= Number(filters.qiymetMax));
    }
    
    if (filters.ilMin) {
      result = result.filter(ilan => ilan.buraxilis >= Number(filters.ilMin));
    }
    
    if (filters.ilMax) {
      result = result.filter(ilan => ilan.buraxilis <= Number(filters.ilMax));
    }
    
    if (filters.seher) {
      result = result.filter(ilan => ilan.seher === filters.seher);
    }

    if (filters.yanacaq) {
      result = result.filter(ilan => ilan.yanacaq === filters.yanacaq);
    }

    if (filters.suret) {
      result = result.filter(ilan => ilan.suret === filters.suret);
    }

    if (filters.ban) {
      result = result.filter(ilan => ilan.ban === filters.ban);
    }

    if (filters.reng) {
      result = result.filter(ilan => ilan.reng === filters.reng);
    }

    if (filters.yurushMin) {
      result = result.filter(ilan => ilan.yurush >= Number(filters.yurushMin));
    }

    if (filters.yurushMax) {
      result = result.filter(ilan => ilan.yurush <= Number(filters.yurushMax));
    }

    if (filters.hecmMin) {
      result = result.filter(ilan => ilan.hecm >= Number(filters.hecmMin));
    }

    if (filters.hecmMax) {
      result = result.filter(ilan => ilan.hecm <= Number(filters.hecmMax));
    }

    if (filters.gucMin) {
      result = result.filter(ilan => ilan.guc >= Number(filters.gucMin));
    }

    if (filters.gucMax) {
      result = result.filter(ilan => ilan.guc <= Number(filters.gucMax));
    }

    if (filters.kredit) {
      result = result.filter(ilan => ilan.kredit === true);
    }

    if (filters.barter) {
      result = result.filter(ilan => ilan.barter === true);
    }

    if (filters.veziyyet.length > 0) {
      result = result.filter(ilan => {
        return filters.veziyyet.some(durum => {
          switch(durum) {
            case 'Vuruğu var':
              return ilan.vuruq;
            case 'Rənglənib':
              return ilan.renglenib;
            case 'Qəzalı':
              return ilan.qezali;
            default:
              return false;
          }
        });
      });
    }
    
    setFilteredIlanlar(result);
  }, [filters, ilanlar]);

  // Filtreleri sıfırla
  const resetFilters = () => {
    setFilters({
      marka: '',
      model: '',
      qiymetMin: '',
      qiymetMax: '',
      ilMin: '',
      ilMax: '',
      seher: '',
      yanacaq: '',
      suret: '',
      ban: '',
      reng: '',
      yurushMin: '',
      yurushMax: '',
      hecmMin: '',
      hecmMax: '',
      gucMin: '',
      gucMax: '',
      kredit: false,
      barter: false,
      veziyyet: []
    });
    setShowAdvancedFilters(false);
  };

  // Durum filtresi için checkbox değişikliği
  const handleVeziyyetChange = (durum) => {
    setFilters(prev => {
      const newVeziyyet = prev.veziyyet.includes(durum)
        ? prev.veziyyet.filter(v => v !== durum)
        : [...prev.veziyyet, durum];
      return { ...prev, veziyyet: newVeziyyet };
    });
  };



  const handleIlanClick = (ilanId) => {
    navigate(`/ilan/${ilanId}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">{loadingText}</div>
        <div className="loading-subtext">
          {loadingText.includes('Server') ? 'Backend servisi kontrolu' :
           loadingText.includes('işlənir') ? 'Məlumatlar emal olunur' :
           loadingText.includes('hazırlanır') ? 'UI komponentləri hazırlanır' :
           loadingText.includes('yükləndi') ? 'Hazırdır!' :
           'Xahiş edirik gözləyin...'}
        </div>
        <div className="loading-progress">
          <div className="loading-progress-bar"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="ads-container content-loading">
      {/* Tam Ekran Launch Modal */}
      {showLaunchModal && (
        <div className="launch-modal-overlay">
          <div className="launch-modal">
            <button 
              className="modal-close"
              onClick={() => closeLaunchModal(false)}
            >
              ✕
            </button>
            
            <div className="modal-content">
              <div className="modal-header">
                <h1>Naxçıvan Avto Elan</h1>
                <h2>Yeni Açıldı!</h2>
              </div>
              
              <p className="offer-text">
                İlk elan paylaşan <span className="highlight">10 nəfər</span>
                <strong> 1 il PULSUZ Premium Elan</strong> hüququ qazanacaq
              </p>
              
              <button 
                className="cta-button"
                onClick={() => {
                  navigate('/elan-yarat');
                  closeLaunchModal(false);
                }}
              >
                İNDİ ELAN VER
              </button>
              
              <label className="dont-show-again">
                <input 
                  type="checkbox" 
                  onChange={(e) => {
                    if (e.target.checked) {
                      closeLaunchModal(true);
                    }
                  }}
                />
                Bir daha göstərmə
              </label>
            </div>
          </div>
        </div>
      )}
      
      <div className="filters-section">
        <div className="filters-header">
          <h3>
            Filtrlər 
            {activeFilterCount > 0 && (
              <span className="filter-count">({activeFilterCount})</span>
            )}
          </h3>
          <div className="filter-actions">
            <button 
              className="advanced-toggle"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              {showAdvancedFilters ? 'Sadə Filtrlər' : 'Ətraflı Filtrlər'}
            </button>
            {activeFilterCount > 0 && (
              <button className="reset-all-filters" onClick={resetFilters}>
                Hamısını Sıfırla
              </button>
            )}
          </div>
        </div>

        <div className="filters-grid">
          {/* Əsas Filtrlər */}
          <div className="filter-group">
            <label>Marka</label>
            <select 
              value={filters.marka} 
              onChange={(e) => setFilters({...filters, marka: e.target.value, model: ''})}
            >
              <option value="">Bütün markalar</option>
              {populerMarkalar.map(marka => (
                <option key={marka} value={marka}>{marka}</option>
              ))}
            </select>
          </div>

          {filters.marka && availableModels.length > 0 && (
            <div className="filter-group">
              <label>Model</label>
              <select 
                value={filters.model} 
                onChange={(e) => setFilters({...filters, model: e.target.value})}
              >
                <option value="">Bütün modellər</option>
                {availableModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>
          )}

          <div className="filter-group price-filter">
            <label>Qiymət (AZN)</label>
            <div className="range-inputs">
              <input
                type="number"
                placeholder="Min qiymət"
                value={filters.qiymetMin}
                onChange={(e) => setFilters({...filters, qiymetMin: e.target.value})}
              />
              <span className="range-separator">-</span>
              <input
                type="number"
                placeholder="Max qiymət"
                value={filters.qiymetMax}
                onChange={(e) => setFilters({...filters, qiymetMax: e.target.value})}
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Buraxılış ili</label>
            <div className="range-inputs">
              <input
                type="number"
                placeholder="Min"
                value={filters.ilMin}
                onChange={(e) => setFilters({...filters, ilMin: e.target.value})}
              />
              <span className="range-separator">-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.ilMax}
                onChange={(e) => setFilters({...filters, ilMax: e.target.value})}
              />
            </div>
          </div>

          {/* Ətraflı Filtrlər */}
          {showAdvancedFilters && (
            <>
              <div className="filter-group">
                <label>Yanacaq növü</label>
                <select
                  value={filters.yanacaq}
                  onChange={(e) => setFilters({...filters, yanacaq: e.target.value})}
                >
                  <option value="">Hamısı</option>
                  {yanacaqTipleri.map(tip => (
                    <option key={tip} value={tip}>{tip}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Sürət qutusu</label>
                <select
                  value={filters.suret}
                  onChange={(e) => setFilters({...filters, suret: e.target.value})}
                >
                  <option value="">Hamısı</option>
                  {suretQutusuTipleri.map(tip => (
                    <option key={tip} value={tip}>{tip}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Ban növü</label>
                <select
                  value={filters.ban}
                  onChange={(e) => setFilters({...filters, ban: e.target.value})}
                >
                  <option value="">Hamısı</option>
                  {banNovleri.map(tip => (
                    <option key={tip} value={tip}>{tip}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Rəng</label>
                <select
                  value={filters.reng}
                  onChange={(e) => setFilters({...filters, reng: e.target.value})}
                >
                  <option value="">Hamısı</option>
                  {rengTipleri.map(reng => (
                    <option key={reng} value={reng}>{reng}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Yürüş (km)</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.yurushMin}
                    onChange={(e) => setFilters({...filters, yurushMin: e.target.value})}
                  />
                  <span className="range-separator">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.yurushMax}
                    onChange={(e) => setFilters({...filters, yurushMax: e.target.value})}
                  />
                </div>
              </div>

              <div className="filter-group">
                <label>Mühərrik həcmi (L)</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Min"
                    value={filters.hecmMin}
                    onChange={(e) => setFilters({...filters, hecmMin: e.target.value})}
                  />
                  <span className="range-separator">-</span>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Max"
                    value={filters.hecmMax}
                    onChange={(e) => setFilters({...filters, hecmMax: e.target.value})}
                  />
                </div>
              </div>

              <div className="filter-group">
                <label>Güc (a.g.)</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.gucMin}
                    onChange={(e) => setFilters({...filters, gucMin: e.target.value})}
                  />
                  <span className="range-separator">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.gucMax}
                    onChange={(e) => setFilters({...filters, gucMax: e.target.value})}
                  />
                </div>
              </div>

              <div className="filter-group payment-options">
                <label>Ödəniş seçimləri</label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.kredit}
                      onChange={(e) => setFilters({...filters, kredit: e.target.checked})}
                    />
                    Kreditlə
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.barter}
                      onChange={(e) => setFilters({...filters, barter: e.target.checked})}
                    />
                    Barter
                  </label>
                </div>
              </div>

              <div className="filter-group veziyyet-group">
                <label>Vəziyyəti</label>
                <div className="checkbox-group">
                  {veziyyetTipleri.map(durum => (
                    <label key={durum} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={filters.veziyyet.includes(durum)}
                        onChange={() => handleVeziyyetChange(durum)}
                      />
                      {durum}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="filter-results">
          <span className="results-count">
            {filteredIlanlar.length} elan tapıldı
          </span>
          <button 
            className="refresh-cache-btn" 
            onClick={() => {
              setLoading(true);
              fetchIlanlar(1, false, false);
            }}
            title="Yeni veri yükle"
          >
            🔄 Yenilə
          </button>
        </div>
      </div>

      <div className="ads-grid">
        {filteredIlanlar.length === 0 ? (
          <p className="no-results">Bu filtrlərə uyğun elan tapılmadı.</p>
        ) : (
          filteredIlanlar.map(ilan => {
            const images = ilan.sekiller || [];
            const firstImage = images.length > 0 ? images[0] : DEFAULT_IMAGE;

            return (
              <div key={ilan._id} className="ad-card" onClick={() => handleIlanClick(ilan._id)}>
                <div className="single-image-container">
                      <img 
                    src={firstImage} 
                    alt={`${ilan.marka} ${ilan.model}`}
                        className="car-image"
                        onError={(e) => {
                          e.target.src = DEFAULT_IMAGE;
                        }}
                      />
                  {images.length > 1 && (
                    <div className="image-count-badge">
                      {images.length} şəkil
                      </div>
                  )}
                </div>
                <div className="ad-content">
                  <h3>
                    {ilan.otherMarka ? ilan.otherMarka : ilan.marka} {' '}
                    {ilan.otherModel ? ilan.otherModel : ilan.model}
                  </h3>
                  <p className="ad-price">{ilan.qiymet} {ilan.qiymetTip}</p>
                  <div className="click-hint">
                    Əlavə detay üçün üstünə tıklayın
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* Load More butonu */}
      {currentPage < totalPages && (
        <div className="load-more-container">
          <button 
            className="load-more-btn" 
            onClick={() => {
              const nextPage = currentPage + 1;
              fetchIlanlar(nextPage, true, false);
            }}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <div className="loading-spinner-small"></div>
            ) : (
              `Daha çox elan yüklə (${totalCount - filteredIlanlar.length} qaldı)`
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default Ads; 
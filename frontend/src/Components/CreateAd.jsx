import React, { useState } from 'react';
import './CreateAd.css';

const populerMarkalar = [
  'Mercedes', 'Hyundai', 'LADA (VAZ)', 'Toyota', 'Kia', 'BMW', 'Ford', 'Chevrolet', 'Opel', 'Nissan', 'Changan', 'Land Rover'
];

const renkler = [
  {name: 'Ağ', code: '#fff'},
  {name: 'Qara', code: '#222'},
  {name: 'Mavi', code: '#1976d2'},
  {name: 'Qırmızı', code: '#e53935'},
  {name: 'Boz', code: '#bdbdbd'},
  {name: 'Gümüş', code: '#e0e0e0'},
  {name: 'Yaşıl', code: '#43a047'},
  {name: 'Sarı', code: '#ffd600'},
  {name: 'Narıncı', code: '#ff9800'},
  {name: 'Qəhvəyi', code: '#795548'},
  {name: 'Bənövşəyi', code: '#8e24aa'},
  {name: 'Bej', code: '#f5f5dc'},
  {name: 'Tünd mavi', code: '#283593'},
  {name: 'Şampan', code: '#f7e7ce'},
  {name: 'Qızılı', code: '#ffd700'},
  {name: 'Digər', code: '#888'}
];

const markaModeller = {
  'Mercedes': ["A-Class", "B-Class", "C-Class", "CLA", "CLS", "E-Class", "G-Class", "GLA", "GLB", "GLC", "GLE", "GLS", "S-Class", "SL", "SLC", "SLS AMG", "V-Class", "X-Class", "540K Replica", "190", "200", "220", "230", "240", "250", "260", "280", "300", "320", "350", "380", "400", "420", "450", "500", "560", "600", "AMG GT", "Maybach", "Sprinter", "Vito", "Vaneo", "Viano", "Citan", "MB100", "MB140", "T1", "T2", "Unimog", "Actros", "Atego", "Axor", "Econic", "Zetros", "Antos", "Arocs", "Tourismo", "Travego", "Intouro", "Citaro", "Conecto"],
  'Hyundai': ["Accent", "Elantra", "i10", "i20", "i30", "Kona", "Santa Fe", "Sonata", "Tucson", "Azera", "Genesis", "Getz", "Grandeur", "H-1", "Matrix", "Palisade", "Starex", "Terracan", "Trajet", "Veloster", "Verna", "Creta", "Bayon", "Ioniq", "ix20", "ix35", "ix55"],
  'LADA (VAZ)': ["2101", "2105", "2106", "2107", "2110", "2111", "2112", "Granta", "Kalina", "Niva", "Priora", "Vesta", "XRAY", "Samara", "Oka", "Vega", "Largus", "4x4", "Urban", "Signet", "Sputnik", "Riva", "Nova", "Forma", "Classic", "Lux", "Sport", "Cross"],
  'Toyota': ["Auris", "Avensis", "Camry", "Corolla", "Highlander", "Land Cruiser", "Prius", "RAV4", "Yaris", "C-HR", "Hilux", "Supra", "Verso", "Aygo", "Celica", "Previa", "Proace", "Urban Cruiser", "Venza", "Sienna", "Tacoma", "Tundra", "FJ Cruiser", "Crown", "Mark X", "Alphard", "Estima", "Noah", "Wish", "Harrier", "Matrix", "Picnic", "Solara", "Starlet", "Town Ace", "Lite Ace", "Sprinter"],
  'Kia': ["Ceed", "Cerato", "Optima", "Picanto", "Rio", "Sorento", "Soul", "Sportage", "Carens", "Carnival", "Cadenza", "Mohave", "Magentis", "Opirus", "Quoris", "Retona", "Rondo", "Sephia", "Shuma", "Spectra", "Stinger", "Venga", "XCeed", "EV6", "Seltos", "Telluride", "Bongo", "K2500", "K2700", "K2900"],
  'BMW': ["1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "6 Series", "7 Series", "8 Series", "M1", "M2", "M3", "M4", "M5", "M6", "M8", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "Z1", "Z3", "Z4", "Z8", "i3", "i4", "i8", "iX", "iX3", "i7", "i5", "ActiveHybrid 3", "ActiveHybrid 5", "ActiveHybrid 7", "Alpina B3", "Alpina B4", "Alpina B5", "Alpina B6", "Alpina B7", "Alpina D3", "Alpina D4", "Alpina D5"],
  'Ford': ["Fiesta", "Focus", "Fusion", "Kuga", "Mondeo", "Mustang", "Ranger", "B-Max", "C-Max", "EcoSport", "Edge", "Escape", "Explorer", "F-150", "F-250", "F-350", "Flex", "Galaxy", "Ka", "Maverick", "Puma", "S-Max", "Tourneo Connect", "Tourneo Courier", "Tourneo Custom", "Transit Connect", "Transit Courier", "Transit Custom", "Transit"],
  'Chevrolet': ["Aveo", "Captiva", "Cruze", "Epica", "Lacetti", "Malibu", "Niva", "Orlando", "Spark", "Tahoe", "Trailblazer", "Traverse", "Trax", "Volt", "Camaro", "Cobalt", "Colorado", "Corvette", "Equinox", "Express", "HHR", "Impala", "Kalos", "Lanos", "Matiz", "Monte Carlo", "Prizm", "Rezzo", "Sonic", "SSR", "Suburban", "Uplander", "Venture"],
  'Opel': ["Astra", "Corsa", "Insignia", "Meriva", "Mokka", "Vectra", "Zafira", "Adam", "Agila", "Ampera", "Antara", "Arena", "Ascona", "Calibra", "Campo", "Combo", "Commodore", "Corsa-e", "Crossland", "Frontera", "Grandland", "Kadett", "Karl", "Manta", "Monterey", "Movano", "Omega", "Rekord", "Senator", "Signum", "Sintra", "Speedster", "Tigra", "Vita"],
  'Nissan': ["Almera", "Juke", "Micra", "Murano", "Navara", "Note", "Pathfinder", "Qashqai", "X-Trail", "350Z", "370Z", "Altima", "Armada", "Cube", "GT-R", "Leaf", "Maxima", "NV200", "Patrol", "Pulsar", "Quest", "Rogue", "Sentra", "Serena", "Silvia", "Skyline", "Sunny", "Teana", "Tiida", "Versa", "Wingroad"],
  'Changan': ["Alsvin", "CS15", "CS35", "CS55", "CS75", "Eado", "Raeton", "Benni", "CX20", "CX30", "Honor", "Linmax", "Ossan", "Star", "UNI-K", "UNI-T", "V7", "V3", "V5", "V6", "V8"],
  'Land Rover': ["Defender", "Discovery", "Evoque", "Freelander", "Range Rover", "Range Rover Sport", "Range Rover Velar", "Range Rover Evoque", "Discovery Sport", "Series I", "Series II", "Series III", "Ninety", "One Ten", "Forward Control", "Lightweight", "Santana", "Perentie", "Wolf", "Defender Works V8", "Range Rover Classic"]
};

const initialState = {
  marka: '',
  model: '',
  buraxilis: '',
  ban: '',
  muherrik: '',
  yanacaq: '',
  oturucu: '',
  suret: '',
  hecm: '',
  guc: '',
  yerler: '',
  reng: '',
  bazar: '',
  yurush: '',
  yurushTip: 'km',
  sekiller: [],
  techizat: [],
  vuruq: false,
  renglenib: false,
  qezali: false,
  vin: '',
  elave: '',
  seher: 'Naxçıvan',
  qiymet: '',
  qiymetTip: 'AZN',
  kredit: false,
  barter: false,
  ad: '',
  email: '',
  telefon: '',
  otherMarka: '',
  otherModel: '',
};

const banOptions = [
  'Qolfkar', 'Avtobus', 'Van', 'Kabriolet', 'Karvan', 'Kvadrosikl', 'Kompakt-Van', 'Kupe', 'Limuzin', 'Liftbek',
  'Rodster', 'Spidster', 'Sedan', 'Tarqa', 'Fastbek', 'Dartqı', 'Fayton', 'Pikap, tək kabin', 'Pikap, bir yarım kabin',
  'Pikap, ikiqat kabin', 'SUV Kupe', 'Mikrovan', 'Minivan', 'Moped', 'Universal, 3 qapı', 'Universal, 5 qapı',
  'Offroader / SUV, açıq', 'Offroader / SUV, 3 qapı', 'Offroader / SUV, 5 qapı', 'Hetçbek, 3 qapı', 'Hetçbek, 4 qapı',
  'Hetçbek, 5 qapı', 'Motosiklet', 'Skuter', 'Yük maşını', 'Mikroavtobus', 'Furqon'
];
const muherrikOptions = ['Benzin', 'Dizel', 'Dizel-Hibrid', 'Elektro', 'Hibrid', 'Hidrogen', 'Plug-in Hibrid', 'Qaz'];
const yanacaqOptions = ['Benzin', 'Dizel', 'Elektro', 'Hibrid', 'Qaz', 'Hidrogen'];
const oturucuOptions = ['Arxa', 'Tam', 'Ön'];
const suretOptions = ['Avtomat (AT)', 'Avtomat (DHT)', 'Avtomat (Reduktor)', 'Avtomat (Robot)', 'Avtomat (Variator)', 'Mexaniki (MT)'];
const hecmOptions = Array.from({length: 64}, (_, i) => (i+1)*50);
const gucOptions = Array.from({length: 99}, (_, i) => (i+1)*2);
const yerlerOptions = ['1','2','3','4','5','6','7','8+'];
const bazarOptions = ['Amerika','Avropa','Digər','Dubay','Koreya','Rusiya','Rəsmi diler','Yaponiya','Çin'];
const seherOptions = [
  'Bakı','Astara','Ağcabədi','Ağdam','Ağdərə','Ağstafa','Ağsu','Babək','Balakən','Beyləqan','Biləsuvar','Bərdə','Culfa','Cəbrayıl','Cəlilabad','Daşkəsən','Dəliməmmədli','Füzuli','Goranboy','Göygöl','Göytəpə','Göyçay','Gədəbəy','Gəncə','Hacıqabul','Horadiz','Kürdəmir','Kəlbəcər','Laçın','Lerik','Liman','Lənkəran','Masallı','Mingəçevir','Naftalan','Naxçıvan','Neftçala','Ordubad','Oğuz','Qax','Qazax','Qobustan','Quba','Qubadlı','Qusar','Qəbələ','Saatlı','Sabirabad','Salyan','Samux','Siyəzən','Sumqayıt','Tovuz','Tərtər','Ucar','Xankəndi','Xaçmaz','Xocalı','Xocavənd','Xudat','Xırdalan','Xızı','Yardımlı','Yevlax','Zaqatala','Zəngilan','Zərdab','İmişli','İsmayıllı','Şabran','Şahbuz','Şamaxı','Şirvan','Şuşa','Şəki','Şəmkir','Şərur'
];
const techizatOptions = [
  '360º kamera','ABS','Arxa görüntü kamerası','Dəri salon','Kondisioner','Ksenon lampalar','Lyuk','Mərkəzi qapanma',
  'Oturacaqların isidilməsi','Oturacaqların ventilyasiyası','Park radarı','Yan pərdələr','Yağış sensoru','Yüngül lehimli disklər'
];

function CreateAd() {
  const [form, setForm] = useState(initialState);
  const [showVinInfo, setShowVinInfo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Marka değişince model ve otherModel sıfırlansın
  const handleMarkaChange = e => {
    const selectedMarka = e.target.value;
    console.log('🔧 Marka seçildi:', selectedMarka);
    
    if (selectedMarka === 'Diğər') {
      // Diğər marka seçildiğinde model'i de "Diğər" yap
      setForm({ 
        ...form, 
        marka: selectedMarka, 
        model: 'Diğər', 
        otherMarka: '', 
        otherModel: '' 
      });
      console.log('🔧 Diğər marka seçildi, model "Diğər" yapıldı');
    } else {
      setForm({ 
        ...form, 
        marka: selectedMarka, 
        model: '', 
        otherMarka: '', 
        otherModel: '' 
      });
    }
  };

  // Rəng seçimi
  const handleRengChange = renk => {
    setForm({ ...form, reng: renk });
  };

  // Seçili marka populyar mı?
  const isOtherMarka = form.marka === 'Diğər';
  const isOtherModel = isOtherMarka || (form.model === 'Diğər');

  // Görseli base64'e çevir
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Görseli yeniden boyutlandıran fonksiyon
  const resizeImage = (file, maxWidth = 1024, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = (err) => reject(err);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((maxWidth / width) * height);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        // Kaliteyi düşürerek base64'e çevir
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    });
  };

  // Görsel seçildiğinde
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    
    console.log('📸 Görsel seçimi:', {
      dosyaSayisi: files.length,
      dosyalar: files.map(f => ({ name: f.name, size: f.size, type: f.type }))
    });
    
    if (files.length < 1) {
      alert("Ən azı 1 şəkil seçməlisiniz!");
      return;
    }
    
    try {
      console.log('📸 Görseller yükleniyor...');
      // Her görseli yeniden boyutlandır ve kaliteyi düşür
      const base64Files = await Promise.all(files.map(file => resizeImage(file, 1024, 0.7)));
      
      console.log('✅ Görseller başarıyla yüklendi:', {
        yuklenenSayi: base64Files.length,
        dosyaAdlari: files.map(f => f.name)
      });
      
      setForm({...form, sekiller: base64Files});
    } catch (err) {
      console.error('❌ Şəkil yükləmə xətası:', err);
      alert('Şəkil yükləmə xətası baş verdi! Lütfen başqa şəkillər seçin.');
    }
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('📋 Form gönderimi başladı:', {
      sekillerSayisi: form.sekiller ? form.sekiller.length : 0,
      sekiller: form.sekiller ? 'Mevcut' : 'Yok'
    });
    
    if (!form.sekiller || form.sekiller.length < 1) {
      alert("Ən azı 1 şəkil əlavə etməlisiniz!");
      return;
    }
    
    setIsSubmitting(true);
    setSubmitSuccess(false);

    // Debug: Form verilerini kontrol et
    console.log('📋 Form verileri:', {
      marka: form.marka,
      model: form.model,
      otherMarka: form.otherMarka,
      otherModel: form.otherModel,
      isOtherMarka,
      isOtherModel,
      finalMarka: form.marka === 'Diğər' ? form.otherMarka : form.marka,
      finalModel: (form.marka === 'Diğər' || form.model === 'Diğər') ? form.otherModel : form.model
    });

    // Sayısal alanları number'a çevir
    const ilanData = {
      ...form,
      hecm: Number(form.hecm),
      guc: Number(form.guc),
      yerler: Number(form.yerler),
      yurush: Number(form.yurush),
      qiymet: Number(form.qiymet)
    };

    try {
      const res = await fetch("https://naxc-van-elan-o2sr.onrender.com/api/ilan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ilanData),
      });
      
      if (res.ok) {
        setSubmitSuccess(true);
        setForm(initialState);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const error = await res.json();
        console.error('❌ Backend hatası:', error);
        console.error('❌ Hata detayları:', {
          status: res.status,
          statusText: res.statusText,
          error: error
        });
        alert(error.detail || error.error || "Xəta baş verdi!");
      }
    } catch (err) {
      console.error('❌ Bağlantı hatası:', err);
      alert("Bağlantı xətası!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Elan göndərilir...</div>
        <div className="loading-subtext">
          Elanınız işlənir və yoxlamaya göndərilir
        </div>
        <div className="loading-progress">
          <div className="loading-progress-bar"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-ad-container">
      <h2>Yeni Elan</h2>
      
      {submitSuccess && (
        <div className="success-message">
          <div className="success-icon">✅</div>
          <div className="success-content">
            <h3>Elan uğurla göndərildi!</h3>
            <p>Elanınız yoxlamaya göndərildi və tezliklə saytda dərc olunacaq.</p>
            <div className="success-details">
              <div>• Elanınız 24 saat ərzində yoxlanılacaq</div>
              <div>• Onaylandıqdan sonra saytda görünəcək</div>
              <div>• Nəticə e-mail vasitəsilə bildiriləcək</div>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Marka */}
        <label>Marka *</label>
        <select value={form.marka} onChange={handleMarkaChange} required>
          <option value="" disabled>Populyar markalar</option>
          {populerMarkalar.map(marka => (
            <option key={marka} value={marka}>{marka}</option>
          ))}
          <option value="Diğər">Diğər</option>
        </select>
        {isOtherMarka && (
          <input
            type="text"
            placeholder="Marka adını yazın"
            value={form.otherMarka}
            onChange={e => setForm({...form, otherMarka: e.target.value})}
            required
            style={{marginTop: 8}}
          />
        )}
        {/* Model */}
        <label>Model *</label>
        {isOtherMarka ? (
          <input
            type="text"
            placeholder="Model adını yazın"
            value={form.otherModel}
            onChange={e => {
              const otherModelValue = e.target.value;
              console.log('🔧 Other model yazıldı:', otherModelValue);
              setForm({...form, otherModel: otherModelValue});
            }}
            required
          />
        ) : (
          <select
            value={form.model}
            onChange={e => {
              const selectedModel = e.target.value;
              console.log('🔧 Model seçildi:', selectedModel);
              setForm({...form, model: selectedModel, otherModel: ''});
            }}
            required
            disabled={!form.marka}
          >
            <option value="">Seçin</option>
            {form.marka && markaModeller[form.marka] && markaModeller[form.marka].map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
            <option value="Diğər">Diğər</option>
          </select>
        )}
        {(!isOtherMarka && form.model === 'Diğər') && (
          <input
            type="text"
            placeholder="Model adını yazın"
            value={form.otherModel}
            onChange={e => {
              const otherModelValue = e.target.value;
              console.log('🔧 Other model yazıldı:', otherModelValue);
              setForm({...form, otherModel: otherModelValue});
            }}
            required
            style={{marginTop: 8}}
          />
        )}
        {/* Buraxılış ili */}
        <label>Buraxılış ili *</label>
        <input type="number" min="1900" max="2024" value={form.buraxilis} onChange={e => setForm({...form, buraxilis: e.target.value})} required />
        {/* Ban növü */}
        <label>Ban növü *</label>
        <input
          type="text"
          value={form.ban}
          onChange={e => setForm({...form, ban: e.target.value})}
          required
          placeholder="Ban növünü yazın"
        />
        {/* Mühərrik */}
        <label>Mühərrik *</label>
        <input
          type="text"
          value={form.muherrik}
          onChange={e => setForm({...form, muherrik: e.target.value})}
          required
          placeholder="Mühərrik növünü yazın"
        />
        {/* Yanacaq */}
        <label>Yanacaq *</label>
        <select value={form.yanacaq} onChange={e => setForm({...form, yanacaq: e.target.value})} required>
          <option value="">Seçin</option>
          {yanacaqOptions.map(yanacaq => (
            <option key={yanacaq} value={yanacaq}>{yanacaq}</option>
          ))}
        </select>
        {/* Ötürücü */}
        <label>Ötürücü *</label>
        <input
          type="text"
          value={form.oturucu}
          onChange={e => setForm({...form, oturucu: e.target.value})}
          required
          placeholder="Ötürücü növünü yazın"
        />
        {/* Sürətlər qutusu */}
        <label>Sürətlər qutusu *</label>
        <input
          type="text"
          value={form.suret}
          onChange={e => setForm({...form, suret: e.target.value})}
          required
          placeholder="Sürətlər qutusunu yazın"
        />
        {/* Mühərrikin həcmi */}
        <label>Mühərrikin həcmi, sm3 *</label>
        <input
          type="number"
          value={form.hecm}
          onChange={e => setForm({...form, hecm: e.target.value})}
          required
          placeholder="Mühərrikin həcmini yazın"
        />
        {/* Mühərrikin gücü */}
        <label>Mühərrikin gücü, a.g. *</label>
        <input
          type="number"
          value={form.guc}
          onChange={e => setForm({...form, guc: e.target.value})}
          required
          placeholder="Mühərrikin gücünü yazın"
        />
        {/* Yerlərin sayı */}
        <label>Yerlərin sayı</label>
        <input
          type="number"
          value={form.yerler}
          onChange={e => setForm({...form, yerler: e.target.value})}
          placeholder="Yerlərin sayını yazın"
        />
        {/* Hansı bazar üçün yığılıb */}
        <label>Hansı bazar üçün yığılıb</label>
        <input
          type="text"
          value={form.bazar}
          onChange={e => setForm({...form, bazar: e.target.value})}
          placeholder="Bazar adını yazın"
        />
        {/* Rəng */}
        <label>Rəng *</label>
        <div className="renkler-row">
          {renkler.map(r => (
            <button
              type="button"
              key={r.name}
              className={`renk-btn${form.reng === r.code ? ' selected' : ''}`}
              style={{background: r.code, border: form.reng === r.code ? '2px solid #1976d2' : '1px solid #ccc'}}
              title={r.name}
              onClick={() => handleRengChange(r.code)}
            >
              {form.reng === r.code && <span className="renk-check">✓</span>}
            </button>
          ))}
        </div>
        {/* Yürüş */}
        <label>Yürüş *</label>
        <input type="number" value={form.yurush} onChange={e => setForm({...form, yurush: e.target.value})} required />
        <select value={form.yurushTip} onChange={e => setForm({...form, yurushTip: e.target.value})}>
          <option value="km">km</option>
          <option value="mi">mi</option>
        </select>
        {/* Şəkillər */}
        <label>Şəkillər *</label>
        <div style={{marginBottom: '6px', color: '#1976d2', fontSize: '0.98rem', fontWeight: 500}}>
          Ən coxu 4 şəkil əlavə edə bilərsiniz
        </div>
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          onChange={handleImageChange}
          required 
          style={{marginBottom: '10px'}}
        />
        {/* Seçilen görsellerin sayısı */}
        {form.sekiller && form.sekiller.length > 0 && (
          <div style={{marginBottom: '10px', color: '#666', fontSize: '0.9rem'}}>
            ✅ {form.sekiller.length} şəkil seçildi
          </div>
        )}
        {/* Seçilen görsellerin önizlemesi */}
        {form.sekiller && form.sekiller.length > 0 && (
          <div className="image-preview">
            {form.sekiller.map((img, index) => (
              <img 
                key={index} 
                src={img} 
                alt={`Önizləmə ${index + 1}`} 
                style={{
                  width: '100px', 
                  height: '100px', 
                  objectFit: 'cover',
                  margin: '5px',
                  borderRadius: '4px',
                  border: '2px solid #ddd'
                }}
              />
            ))}
          </div>
        )}
        {/* Avtomobilin təchizatı */}
        <label>Avtomobilin təchizatı</label>
        <div className="techizat-list">
          {techizatOptions.map(opt => (
            <label key={opt}>
              <input type="checkbox" checked={form.techizat.includes(opt)} onChange={e => {
                if(e.target.checked) setForm({...form, techizat: [...form.techizat, opt]});
                else setForm({...form, techizat: form.techizat.filter(t => t !== opt)});
              }} />
              {opt}
            </label>
          ))}
        </div>
        {/* Avtomobilin vəziyyəti */}
        <div className="car-status-block">
          <div className="car-status-title">Avtomobilin vəziyyəti</div>
          <div className="car-status-list">
            <label className="car-status-item">
              <input type="checkbox" checked={form.vuruq} onChange={e => setForm({...form, vuruq: e.target.checked})} />
              <div>
                <div className="car-status-label">Vuruğu var?</div>
                <div className="car-status-desc">Bir və ya bir neçə detal dəyişdirilib və ya təmir olunub.</div>
              </div>
            </label>
            <label className="car-status-item">
              <input type="checkbox" checked={form.renglenib} onChange={e => setForm({...form, renglenib: e.target.checked})} />
              <div>
                <div className="car-status-label">Rənglənib?</div>
                <div className="car-status-desc">Bir və ya bir neçə detal rənglənib və ya kosmetik işlər görülüb.</div>
              </div>
            </label>
            <label className="car-status-item">
              <input type="checkbox" checked={form.qezali} onChange={e => setForm({...form, qezali: e.target.checked})} />
              <div>
                <div className="car-status-label">Qəzalı və ya ehtiyat hissələr üçün?</div>
                <div className="car-status-desc">Təmirə ehtiyacı var və ya ümumiyyətlə yararsız vəziyyətdədir.</div>
              </div>
            </label>
          </div>
          <div className="vin-row">
            <input type="text" className="vin-input" placeholder="VIN-kod" value={form.vin || ''} onChange={e => setForm({...form, vin: e.target.value})} />
            <a className="vin-link" href="#" onClick={e => {e.preventDefault(); setShowVinInfo(true);}}>VIN-kodu haradan tapmaq olar?</a>
          </div>
          {showVinInfo && (
            <div className="vin-info-box">
              <div className="vin-info-text">
                Nəqliyyat vasitəsinin qeydiyyat şəhadətnaməsinin (texniki pasport) ön tərəfində.<br/>
                Yeni nəsil qeydiyyat şəhadətnaməsinin arxa tərəfində.
              </div>
            </div>
          )}
        </div>
        {/* Əlavə məlumat */}
        <label>Əlavə məlumat</label>
        <textarea maxLength={3000} value={form.elave} onChange={e => setForm({...form, elave: e.target.value})} />
        {/* Şəhər */}
        <label>Şəhər *</label>
        <input type="text" value="Naxçıvan" disabled style={{background:'#f7f7f7', color:'#1976d2', fontWeight:'bold'}} />
        {/* Qiymət */}
        <label>Qiymət *</label>
        <input type="number" value={form.qiymet} onChange={e => setForm({...form, qiymet: e.target.value})} required />
        <select value={form.qiymetTip} onChange={e => setForm({...form, qiymetTip: e.target.value})}>
          <option value="AZN">AZN</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
        </select>
        <label><input type="checkbox" checked={form.kredit} onChange={e => setForm({...form, kredit: e.target.checked})} /> Kreditlə</label>
        <label><input type="checkbox" checked={form.barter} onChange={e => setForm({...form, barter: e.target.checked})} /> Barter mümkündür</label>
        {/* Əlaqə məlumatları */}
        <label>Adınız *</label>
        <input type="text" value={form.ad} onChange={e => setForm({...form, ad: e.target.value})} required />
        <label>E-mail *</label>
        <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
        <label>Telefon nömrəsi *</label>
        <div className="phone-input-container">
          <span className="phone-prefix">+994</span>
          <input 
            type="tel" 
            className="phone-input"
            placeholder="50 123 45 67"
            value={form.telefon} 
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, ''); // Sadece raqamlar
              if (value.length <= 9) {
                // Format: XX XXX XX XX
                if (value.length >= 2) {
                  value = value.substring(0, 2) + ' ' + value.substring(2);
                }
                if (value.length >= 6) {
                  value = value.substring(0, 6) + ' ' + value.substring(6);
                }
                if (value.length >= 9) {
                  value = value.substring(0, 9) + ' ' + value.substring(9);
                }
                setForm({...form, telefon: value});
              }
            }} 
            required 
          />
        </div>
        {/* Butonlar */}
        <div className="form-buttons">
          <button type="reset" onClick={() => setForm(initialState)} disabled={isSubmitting}>
            Sıfırla
          </button>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Göndərilir...' : 'Davam et'}
          </button>
        </div>

        {/* Onay süreci bilgilendirmesi */}
        <div className="approval-notice">
          <div className="notice-icon">ℹ️</div>
          <div className="notice-content">
            <h4>Elan onay süreci</h4>
            <p>
              Elan göndərildikdən sonra yoxlamaya yönləndiriləcək və istifadəçi kabinetində görünəcək. Təsdiqləndikdən sonra isə saytda yayımlanacaq.
            </p>
            <ul>
              <li>Elanınız 24 saat ərzində yoxlanılacaq</li>
              <li>Uyğun olmayan elanlar rədd ediləcək</li>
              <li>Onaylanan elanlar saytda dərhal görünəcək</li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreateAd; 
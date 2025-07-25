const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const compression = require('compression');
require('dotenv').config();

const app = express();

// Response compression middleware (gzip)
app.use(compression());
app.use(cors());

// Daha makul dosya boyutu limiti (10MB)
app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({limit: '10mb', extended: true}));

// Görsel boyutu kontrol middleware'i
const checkImageSize = (req, res, next) => {
  if (req.body.sekiller && Array.isArray(req.body.sekiller)) {
    const maxImages = 8;
    const maxSizePerImage = 2 * 1024 * 1024; // 2MB per image in base64
    
    if (req.body.sekiller.length > maxImages) {
      return res.status(400).json({ 
        error: `Maksimum ${maxImages} şəkil yükləyə bilərsiniz.` 
      });
    }
    
    for (let i = 0; i < req.body.sekiller.length; i++) {
      const imageSize = Buffer.byteLength(req.body.sekiller[i], 'base64');
      if (imageSize > maxSizePerImage) {
        return res.status(400).json({ 
          error: `${i + 1}. şəkil çox böyükdür. Maksimum 2MB olmalıdır.` 
        });
      }
    }
  }
  next();
};

// JWT Secret (production'da .env dosyasında olmalı)
const JWT_SECRET = process.env.JWT_SECRET || 'naxcivan-elan-secret-key-2024';

// MongoDB bağlantısı
mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/naxcivan-elan')
  .then(() => {
    console.log('MongoDB bağlantısı uğurludur!');
    // Performance için indexleri oluştur
    createDatabaseIndexes();
  })
  .catch((err) => console.error('MongoDB bağlantı xətası:', err));

// Database indexlerini oluştur
const createDatabaseIndexes = async () => {
  try {
    // İlan koleksiyonu için indexler
    await mongoose.connection.db.collection('ilans').createIndex({ createdAt: -1 });
    await mongoose.connection.db.collection('ilans').createIndex({ onaylanmis: 1 });
    await mongoose.connection.db.collection('ilans').createIndex({ marka: 1 });
    await mongoose.connection.db.collection('ilans').createIndex({ seher: 1 });
    await mongoose.connection.db.collection('ilans').createIndex({ qiymet: 1 });
    
    // Reklam talep koleksiyonu için index
    await mongoose.connection.db.collection('reklamtaleps').createIndex({ createdAt: -1 });
    
    console.log('Database indexleri oluşturuldu!');
  } catch (err) {
    console.error('Index oluşturma hatası:', err);
  }
};

// Admin kullanıcı şeması
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String },
  role: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now }
});

const Admin = mongoose.model('Admin', adminSchema);

// İlan şeması
const ilanSchema = new mongoose.Schema({
  marka: String,
  model: String,
  otherMarka: String,
  otherModel: String,
  ban: String,
  muherrik: String,
  yanacaq: String,
  oturucu: String,
  suret: String,
  hecm: Number,
  guc: Number,
  yerler: Number,
  bazar: String,
  reng: String,
  yurush: Number,
  yurushTip: String,
  sekiller: [String], // Base64 görsel dizisi
  techizat: [String],
  vuruq: Boolean,
  renglenib: Boolean,
  qezali: Boolean,
  vin: String,
  elave: String,
  seher: String,
  qiymet: Number,
  qiymetTip: String,
  kredit: Boolean,
  barter: Boolean,
  ad: String,
  email: String,
  telefon: String,
  onaylanmis: { type: Boolean, default: false },
  buraxilis: Number
}, { timestamps: true });

const Ilan = mongoose.model('Ilan', ilanSchema);

// Reklam talep şeması
const reklamTalepSchema = new mongoose.Schema({
  ad: { type: String, required: true },
  email: { type: String, required: true },
  telefon: { type: String, required: true },
  sirket: String,
  reklamNovu: { 
    type: String, 
    required: true,
    enum: ['Banner Reklam', 'Sponsored İlan', 'Premium Listing', 'Digər']
  },
  mesaj: { type: String, required: true },
  budjce: String,
  durum: { 
    type: String, 
    default: 'Yeni',
    enum: ['Yeni', 'İnceleniyor', 'Cavablandırıldı', 'Rədd edildi']
  },
  adminQeyd: String
}, { timestamps: true });

const ReklamTalep = mongoose.model('ReklamTalep', reklamTalepSchema);

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token yoxdur, giriş etməlisiniz.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token yanlışdır.' });
    }
    req.user = user;
    next();
  });
};

// Admin oluştur (Postman ile çağrılacak)
app.post('/api/admin/create', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'İstifadəçi adı və şifrə məcburidur.' });
    }

    // Admin var mı kontrol et
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Bu istifadəçi adı artıq mövcuddur.' });
    }

    // Şifreyi hash'le
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Yeni admin oluştur
    const admin = new Admin({
      username,
      password: hashedPassword,
      email
    });

    await admin.save();
    console.log('Yeni admin oluşturuldu:', username);
    
    res.status(201).json({ 
      message: 'Admin uğurla yaradıldı.',
      admin: { username, email, role: admin.role }
    });
  } catch (err) {
    console.error('Admin oluşturma hatası:', err);
    res.status(500).json({ error: 'Admin yaradıla bilmədi.' });
  }
});

// Admin giriş
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'İstifadəçi adı və şifrə məcburidur.' });
    }

    // Admin'i bul
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ error: 'İstifadəçi adı və ya şifrə yanlışdır.' });
    }

    // Şifreyi kontrol et
    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'İstifadəçi adı və ya şifrə yanlışdır.' });
    }

    // JWT token oluştur
    const token = jwt.sign(
      { 
        id: admin._id, 
        username: admin.username, 
        role: admin.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Admin girişi başarılı:', username);
    
    res.json({
      message: 'Giriş uğurludur.',
      token,
      admin: {
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    console.error('Giriş hatası:', err);
    res.status(500).json({ error: 'Giriş alınmadı.' });
  }
});

// Token doğrula
app.get('/api/admin/verify', authenticateToken, (req, res) => {
  res.json({
    valid: true,
    admin: {
      username: req.user.username,
      role: req.user.role
    }
  });
});

// Reklam talebi gönder
app.post('/api/reklam-talep', async (req, res) => {
  try {
    const { ad, email, telefon, sirket, reklamNovu, mesaj, budjce } = req.body;
    
    if (!ad || !email || !telefon || !reklamNovu || !mesaj) {
      return res.status(400).json({ error: 'Bütün məcburi sahələr doldurulmalıdır.' });
    }

    const reklamTalep = new ReklamTalep({
      ad,
      email,
      telefon,
      sirket,
      reklamNovu,
      mesaj,
      budjce
    });

    await reklamTalep.save();
    console.log('Yeni reklam talebi:', ad, reklamNovu);
    
    res.status(201).json({ 
      message: 'Reklam tələbiniz uğurla göndərildi. Tezliklə sizinlə əlaqə saxlanacaq.',
      talep: reklamTalep 
    });
  } catch (err) {
    console.error('Reklam talep hatası:', err);
    res.status(500).json({ error: 'Reklam tələbi göndərilə bilmədi.' });
  }
});

// Admin için reklam talepler listesi
app.get('/api/admin/reklam-talepler', authenticateToken, async (req, res) => {
  try {
    const talepler = await ReklamTalep.find().sort({ createdAt: -1 });
    console.log('Reklam talepler listesi:', talepler.length);
    res.json(talepler);
  } catch (err) {
    console.error('Reklam talepler alma hatası:', err);
    res.status(500).json({ error: 'Reklam tələpləri alınamadı.' });
  }
});

// Reklam talep durumu güncelle
app.put('/api/admin/reklam-talep/:id/durum', authenticateToken, async (req, res) => {
  try {
    const { durum, adminQeyd } = req.body;
    
    const talep = await ReklamTalep.findByIdAndUpdate(
      req.params.id,
      { durum, adminQeyd },
      { new: true }
    );
    
    if (!talep) {
      return res.status(404).json({ error: 'Reklam tələbi tapılmadı.' });
    }
    
    console.log('Reklam talep durumu güncellendi:', req.params.id, durum);
    res.json({ message: 'Durum yeniləndi.', talep });
  } catch (err) {
    console.error('Durum güncelleme hatası:', err);
    res.status(500).json({ error: 'Durum yenilənə bilmədi.' });
  }
});

// Reklam talebi sil
app.delete('/api/admin/reklam-talep/:id', authenticateToken, async (req, res) => {
  try {
    const talep = await ReklamTalep.findByIdAndDelete(req.params.id);
    if (!talep) {
      return res.status(404).json({ error: 'Reklam tələbi tapılmadı.' });
    }
    console.log('Reklam talebi silindi:', req.params.id);
    res.json({ message: 'Reklam tələbi silindi.' });
  } catch (err) {
    console.error('Reklam talep silme hatası:', err);
    res.status(500).json({ error: 'Reklam tələbi silinə bilmədi.' });
  }
});

// İlan ekle
app.post('/api/ilan', checkImageSize, async (req, res) => {
  try {
    console.log('Gelen görsel sayısı:', req.body.sekiller?.length || 0);
    
    // Görsel boyutlarını logla
    if (req.body.sekiller) {
      const totalSize = req.body.sekiller.reduce((sum, img) => 
        sum + Buffer.byteLength(img, 'base64'), 0
      );
      console.log('Toplam görsel boyutu:', (totalSize / (1024 * 1024)).toFixed(2), 'MB');
    }
    
    const ilan = new Ilan(req.body);
    await ilan.save();
    console.log('İlan başarıyla kaydedildi. ID:', ilan._id);
    res.status(201).json({ 
      message: 'İlan uğurla əlavə edildi.',
      id: ilan._id 
    });
  } catch (err) {
    console.error('İlan ekleme hatası:', err);
    res.status(500).json({ error: 'İlan əlavə edilə bilmədi.', detail: err.message });
  }
});

// İlanları getir (sadece onaylanmış) - Pagination ile
app.get('/api/ilan', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const ilanlar = await Ilan.find({ onaylanmis: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Ilan.countDocuments({ onaylanmis: true });
    const totalPages = Math.ceil(total / limit);
    
    console.log(`İlanlar getiriliyor - Sayfa: ${page}/${totalPages}, Limit: ${limit}`);
    
    res.json({
      ilanlar,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error('İlanları alma hatası:', err);
    res.status(500).json({ error: 'İlanlar alınamadı.' });
  }
});

// Hafif ilan listesi (görseller olmadan) - Ana sayfa için
app.get('/api/ilan/list', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Sadece gerekli alanları getir (görselleri hariç tut)
    const ilanlar = await Ilan.find({ onaylanmis: true })
      .select('-sekiller -techizat -elave -vin') // Büyük alanları hariç tut
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Ilan.countDocuments({ onaylanmis: true });
    const totalPages = Math.ceil(total / limit);
    
    console.log(`Hafif ilan listesi - Sayfa: ${page}/${totalPages}`);
    
    res.json({
      ilanlar,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error('Hafif ilan listesi alma hatası:', err);
    res.status(500).json({ error: 'İlan listesi alınamadı.' });
  }
});

// Admin için tüm ilanları getir (korumalı) - Pagination ile
app.get('/api/admin/ilanlar', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50; // Admin için daha yüksek limit
    const skip = (page - 1) * limit;
    
    const ilanlar = await Ilan.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Ilan.countDocuments();
    const totalPages = Math.ceil(total / limit);
    
    console.log(`Admin ilanları - Sayfa: ${page}/${totalPages}, Toplam: ${total}`);
    
    res.json({
      ilanlar,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error('İlanları alma hatası:', err);
    res.status(500).json({ error: 'İlanlar alınamadı.' });
  }
});

// Tek ilan getir
app.get('/api/ilan/:id', async (req, res) => {
  try {
    const ilan = await Ilan.findById(req.params.id);
    if (!ilan) {
      return res.status(404).json({ error: 'İlan tapılmadı.' });
    }
    console.log('İlan detayı getiriliyor. ID:', req.params.id);
    res.json(ilan);
  } catch (err) {
    console.error('İlan detayı alma hatası:', err);
    res.status(500).json({ error: 'İlan detayı alınamadı.' });
  }
});

// İlanı onayla (korumalı)
app.put('/api/admin/ilan/:id/onayla', authenticateToken, async (req, res) => {
  try {
    const ilan = await Ilan.findByIdAndUpdate(
      req.params.id, 
      { onaylanmis: true }, 
      { new: true }
    );
    if (!ilan) {
      return res.status(404).json({ error: 'İlan tapılmadı.' });
    }
    console.log('İlan onaylandı. ID:', req.params.id, 'Admin:', req.user.username);
    res.json({ message: 'İlan onaylandı.', ilan });
  } catch (err) {
    console.error('İlan onaylama hatası:', err);
    res.status(500).json({ error: 'İlan onaylanamadı.' });
  }
});

// İlan sil (korumalı)
app.delete('/api/ilan/:id', authenticateToken, async (req, res) => {
  try {
    const ilan = await Ilan.findByIdAndDelete(req.params.id);
    if (!ilan) {
      return res.status(404).json({ error: 'İlan tapılmadı.' });
    }
    console.log('İlan silindi. ID:', req.params.id, 'Admin:', req.user.username);
    res.json({ message: 'İlan uğurla silindi.' });
  } catch (err) {
    console.error('İlan silmə xətası:', err);
    res.status(500).json({ error: 'İlan silinə bilmədi.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
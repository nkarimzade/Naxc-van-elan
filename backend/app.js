require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.warn('⚠️ Sharp modülü yüklenemedi, görsel optimizasyonu devre dışı:', error.message);
}
const cloudinary = require('cloudinary').v2;

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Büyük resimler için limit artırıldı

// Cloudinary konfigürasyonu
if (process.env.CLOUDINARY_URL) {
  const urlMatch = process.env.CLOUDINARY_URL.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
  if (urlMatch) {
    cloudinary.config({
      cloud_name: urlMatch[3],
      api_key: urlMatch[1],
      api_secret: urlMatch[2]
    });
    console.log('✅ Cloudinary konfigürasyonu başarılı!');
    console.log(`   Cloud Name: ${urlMatch[3]}`);
  } else {
    console.error('❌ CLOUDINARY_URL formatı hatalı!');
  }
} else {
  console.warn('⚠️ CLOUDINARY_URL bulunamadı, görseller Cloudinary\'ye yüklenmeyecek!');
}

// Base64 görseli Cloudinary'ye yükle
const uploadImageToCloudinary = async (base64String, folder = 'ilanlar') => {
  try {
    // Base64'ten buffer'a çevir
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
    let buffer = Buffer.from(base64Data, 'base64');
    
    // Sharp varsa optimize et, yoksa direkt buffer kullan
    try {
      if (sharp) {
        const optimizedBuffer = await sharp(buffer)
          .resize(1200, 1200, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({ quality: 85 })
          .toBuffer();
        buffer = optimizedBuffer;
      }
    } catch (sharpError) {
      console.warn('⚠️ Sharp optimizasyonu atlandı, görsel direkt yüklenecek:', sharpError.message);
      // Sharp yoksa veya hata varsa direkt buffer kullan
    }
    
    // Cloudinary'ye yükle
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'image',
          format: 'jpg',
          transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary yükleme hatası:', error);
            reject(error);
          } else {
            console.log(`✅ Cloudinary'ye yüklendi: ${result.secure_url}`);
            resolve(result.secure_url);
          }
        }
      );
      
      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error('❌ Görsel işleme hatası:', error);
    throw error;
  }
};

// MongoDB bağlantısı
const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
  console.error('❌ MONGO_URL .env dosyasında tanımlı değil!');
  process.exit(1);
}

// Database adını test olarak ayarla (MongoDB Atlas'ta mevcut database)
let mongoConnectionUrl = MONGO_URL.trim();

// MongoDB connection string formatı: mongodb+srv://user:pass@host/database?options
// Database adını her zaman test olarak ayarla

// Regex ile URL'i parse et
// Format: mongodb+srv://user:pass@host/database?options
const mongoUrlRegex = /^(mongodb\+srv:\/\/[^\/]+)(\/[^?]*)?(\?.*)?$/;
const urlMatch = mongoConnectionUrl.match(mongoUrlRegex);

if (urlMatch) {
  const protocolAndHost = urlMatch[1]; // mongodb+srv://user:pass@host
  const queryString = urlMatch[3] || ''; // ?retryWrites=true&w=majority
  // Database adını test olarak ayarla (tek slash ile)
  mongoConnectionUrl = `${protocolAndHost}/test${queryString}`;
} else {
  // Regex eşleşmezse, manuel düzeltme
  // Önce çift slash'ları temizle (mongodb+srv:// kısmını koruyarak)
  mongoConnectionUrl = mongoConnectionUrl.replace(/([^:])\/\/+/g, '$1/');
  
  // Query string'i ayır
  const queryIndex = mongoConnectionUrl.indexOf('?');
  const queryPart = queryIndex !== -1 ? mongoConnectionUrl.substring(queryIndex) : '';
  const basePart = queryIndex !== -1 ? mongoConnectionUrl.substring(0, queryIndex) : mongoConnectionUrl;
  
  // Host kısmını bul
  const hostMatch = basePart.match(/^(mongodb\+srv:\/\/[^\/]+)/);
  if (hostMatch) {
    mongoConnectionUrl = `${hostMatch[1]}/test${queryPart}`;
  } else {
    // Son çare: basit ekleme
    if (basePart.endsWith('/')) {
      mongoConnectionUrl = `${basePart}test${queryPart}`;
    } else {
      mongoConnectionUrl = `${basePart}/test${queryPart}`;
    }
  }
}

// Final kontrol: mongodb+srv:// dışındaki çift slash'ları temizle
mongoConnectionUrl = mongoConnectionUrl.replace(/(mongodb\+srv:\/\/[^\/]+)\/\/+/g, '$1/');

// Debug: URL formatını kontrol et
const debugUrl = mongoConnectionUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
console.log('🔗 MongoDB bağlantı string\'i:', debugUrl);
console.log('🔍 Database adı kontrolü:', mongoConnectionUrl.match(/\/([^\/\?]+)(\?|$)/)?.[1] || 'bulunamadı');

mongoose.connect(mongoConnectionUrl)
  .then(() => {
    console.log('✅ MongoDB bağlantısı başarılı!');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
  })
  .catch((err) => {
    console.error('❌ MongoDB bağlantı hatası:', err);
  });

// İlan şeması
const ilanSchema = new mongoose.Schema({
  // Araç bilgileri
  marka: { type: String, required: true },
  model: { type: String, required: true },
  otherMarka: String,
  otherModel: String,
  buraxilis: { type: Number, required: true },
  ban: { type: String, required: true },
  muherrik: { type: String, required: true },
  yanacaq: { type: String, required: true },
  oturucu: { type: String, required: true },
  suret: { type: String, required: true },
  hecm: { type: Number, required: true },
  guc: { type: Number, required: true },
  yerler: Number,
  bazar: String,
  reng: { type: String, required: true },
  yurush: { type: Number, required: true },
  yurushTip: { type: String, default: 'km' },
  
  // Görseller ve özellikler
  sekiller: [{ type: String, required: true }], // Cloudinary URL veya Base64 formatında
  techizat: [String],
  
  // Araç durumu
  vuruq: { type: Boolean, default: false },
  renglenib: { type: Boolean, default: false },
  qezali: { type: Boolean, default: false },
  vin: String,
  elave: String,
  
  // Konum ve fiyat
  seher: { type: String, default: 'Naxçıvan' },
  qiymet: { type: Number, required: true },
  qiymetTip: { type: String, default: 'AZN' },
  kredit: { type: Boolean, default: false },
  barter: { type: Boolean, default: false },
  
  // İletişim bilgileri
  ad: { type: String, required: true },
  email: { type: String, required: true },
  telefon: { type: String, required: true },
  
  // Sistem bilgileri
  onaylandi: { type: Boolean, default: false },
  onayTarihi: Date,
  onaylayanAdmin: String,
  redSebebi: String,
  olusturmaTarihi: { type: Date, default: Date.now },
  guncellemeTarihi: { type: Date, default: Date.now }
});

const Ilan = mongoose.model('Ilan', ilanSchema);

// Reklam talep şeması
const reklamTalepSchema = new mongoose.Schema({
  ad: { type: String, required: true },
  email: { type: String, required: true },
  telefon: { type: String, required: true },
  sirket: String,
  reklamNovu: { type: String, required: true },
  mesaj: { type: String, required: true },
  budjce: String,
  durum: { 
    type: String, 
    default: 'Yeni',
    enum: ['Yeni', 'Cavablandırıldı', 'Ləğv edildi']
  },
  olusturmaTarihi: { type: Date, default: Date.now },
  guncellemeTarihi: { type: Date, default: Date.now }
});

// Collection adını açıkça belirt: 'reklamtalepler'
const ReklamTalep = mongoose.model('ReklamTalep', reklamTalepSchema, 'reklamtalepler');

// Admin şeması
const adminSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    default: 'admin',
    enum: ['admin', 'superadmin']
  },
  olusturmaTarihi: { 
    type: Date, 
    default: Date.now 
  },
  sonGirisTarihi: Date
});

// Şifreyi hash'le
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Şifre kontrolü metodu
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'naxauto-admin-secret-key-change-in-production';

// Admin authentication middleware
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Yetkilendirme gerekli', detail: 'Token bulunamadı' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await Admin.findById(decoded.adminId);
    
    if (!admin) {
      return res.status(401).json({ error: 'Geçersiz token', detail: 'Admin bulunamadı' });
    }
    
    req.admin = admin;
    next();
  } catch (error) {
    console.error('❌ Admin authentication hatası:', error);
    res.status(401).json({ error: 'Geçersiz token', detail: error.message });
  }
};

// Yeni ilan oluştur
app.post('/api/ilan', async (req, res) => {
  try {
    console.log('📝 Yeni ilan isteği alındı...');
    const ilanData = req.body;
    
    console.log('📋 Gelen veriler:', {
      marka: ilanData.marka,
      model: ilanData.model,
      otherMarka: ilanData.otherMarka,
      otherModel: ilanData.otherModel,
      sekiller: ilanData.sekiller ? ilanData.sekiller.length : 0
    });
    
    // Zorunlu alanları kontrol et
    const requiredFields = ['buraxilis', 'ban', 'muherrik', 'yanacaq', 'oturucu', 'suret', 'hecm', 'guc', 'reng', 'yurush', 'qiymet', 'ad', 'email', 'telefon'];
    
    // Marka kontrolü
    if (!ilanData.marka) {
      console.log('❌ Eksik alan: marka');
      return res.status(400).json({ 
        error: 'Eksik bilgi', 
        detail: 'Marka alanı zorunludur' 
      });
    }
    
    // Model kontrolü - Diğər marka seçildiğinde otherModel kontrol et
    if (ilanData.marka === 'Diğər') {
      if (!ilanData.otherMarka || !ilanData.otherModel) {
        console.log('❌ Diğər marka için eksik alan:', { otherMarka: ilanData.otherMarka, otherModel: ilanData.otherModel });
        return res.status(400).json({ 
          error: 'Eksik bilgi', 
          detail: 'Diğər marka seçildiğinde marka ve model adını yazmalısınız' 
        });
      }
    } else {
      // Normal marka seçildiğinde model kontrol et
      if (!ilanData.model) {
        console.log('❌ Eksik alan: model');
        return res.status(400).json({ 
          error: 'Eksik bilgi', 
          detail: 'Model alanı zorunludur' 
        });
      }
    }
    
    for (const field of requiredFields) {
      if (!ilanData[field]) {
        console.log(`❌ Eksik alan: ${field}`);
        return res.status(400).json({ 
          error: 'Eksik bilgi', 
          detail: `${field} alanı zorunludur` 
        });
      }
    }
    
    // Görsel kontrolü
    if (!ilanData.sekiller || ilanData.sekiller.length < 1) {
      return res.status(400).json({ 
        error: 'Görsel hatası', 
        detail: 'En az 1 görsel gereklidir' 
      });
    }
    
    // Görselleri Cloudinary'ye yükle veya base64 olarak kaydet
    console.log('📸 Görseller işleniyor...');
    const uploadedImageUrls = [];
    const cloudinaryConfigured = !!process.env.CLOUDINARY_URL;
    
    if (!cloudinaryConfigured) {
      console.warn('⚠️ Cloudinary konfigürasyonu yok, görseller base64 olarak kaydedilecek');
    }
    
    for (let i = 0; i < ilanData.sekiller.length; i++) {
      const base64Image = ilanData.sekiller[i];
      const originalSizeKB = (base64Image.length * 0.75) / 1024;
      
      if (cloudinaryConfigured) {
        console.log(`📸 Görsel ${i + 1}/${ilanData.sekiller.length}: ${originalSizeKB.toFixed(1)}KB -> Cloudinary'ye yükleniyor...`);
        
        try {
          const cloudinaryUrl = await uploadImageToCloudinary(base64Image, 'ilanlar');
          uploadedImageUrls.push(cloudinaryUrl);
          console.log(`✅ Görsel ${i + 1} Cloudinary'ye yüklendi: ${cloudinaryUrl.substring(0, 50)}...`);
        } catch (error) {
          console.error(`❌ Görsel ${i + 1} Cloudinary yükleme hatası:`, error.message);
          console.log(`⚠️ Görsel ${i + 1} base64 olarak kaydedilecek`);
          // Fallback: base64 olarak kaydet
          uploadedImageUrls.push(base64Image);
        }
      } else {
        // Cloudinary yoksa base64 olarak kaydet
        console.log(`📸 Görsel ${i + 1}/${ilanData.sekiller.length}: ${originalSizeKB.toFixed(1)}KB -> Base64 olarak kaydediliyor...`);
        uploadedImageUrls.push(base64Image);
      }
    }
    
    if (cloudinaryConfigured) {
      const cloudinaryCount = uploadedImageUrls.filter(url => url.startsWith('https://res.cloudinary.com')).length;
      const base64Count = uploadedImageUrls.length - cloudinaryCount;
      console.log(`✅ Görseller işlendi: ${cloudinaryCount} Cloudinary, ${base64Count} Base64`);
    } else {
      console.log(`✅ Tüm görseller base64 olarak kaydedildi: ${uploadedImageUrls.length} adet`);
    }
    
    // Marka ve model bilgilerini düzenle
    const finalMarka = ilanData.marka === 'Diğər' ? ilanData.otherMarka : ilanData.marka;
    const finalModel = (ilanData.marka === 'Diğər' || ilanData.model === 'Diğər') ? ilanData.otherModel : ilanData.model;
    
    // Debug log'ları
    console.log('🔍 Model kontrolü:', {
      marka: ilanData.marka,
      model: ilanData.model,
      otherMarka: ilanData.otherMarka,
      otherModel: ilanData.otherModel,
      finalMarka,
      finalModel
    });
    
    // Model kontrolü - hem model hem otherModel alanlarını kontrol et
    if (!finalModel || finalModel.trim() === '') {
      console.log('❌ Model hatası: Model alanı boş');
      return res.status(400).json({ 
        error: 'Model hatası', 
        detail: 'Model alanı zorunludur. Lütfen model seçin veya yazın.' 
      });
    }
    
    // Marka kontrolü
    if (!finalMarka || finalMarka.trim() === '') {
      console.log('❌ Marka hatası: Marka alanı boş');
      return res.status(400).json({ 
        error: 'Marka hatası', 
        detail: 'Marka alanı zorunludur. Lütfen marka seçin veya yazın.' 
      });
    }
    
    const yeniIlan = new Ilan({
      ...ilanData,
      marka: finalMarka,
      model: finalModel,
      sekiller: uploadedImageUrls, // Cloudinary URL'leri veya Base64
      onaylandi: false
    });
    
    await yeniIlan.save();
    
    console.log(`✅ Yeni ilan oluşturuldu: ${finalMarka} ${finalModel}`);
    
    res.status(201).json({ 
      message: 'İlan başarıyla oluşturuldu ve onay için gönderildi',
      ilanId: yeniIlan._id,
      imageCount: uploadedImageUrls.length
    });
    
  } catch (error) {
    console.error('❌ İlan oluşturma hatası:', error);
    console.error('❌ Hata detayları:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      error: 'Sunucu hatası', 
      detail: error.message || 'İlan oluşturulurken bir hata oluştu',
      errorType: error.name
    });
  }
});

// Onaylanmış ilanları getir (public)
app.get('/api/ilan', async (req, res) => {
  try {
    const ilanlar = await Ilan.find({ onaylandi: true })
      .sort({ olusturmaTarihi: -1 })
      .limit(50);
    
    res.json(ilanlar);
  } catch (error) {
    console.error('İlan getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Belirli bir ilanı getir (public)
app.get('/api/ilan/:id', async (req, res) => {
  try {
    const ilan = await Ilan.findOne({ _id: req.params.id, onaylandi: true });
    
    if (!ilan) {
      return res.status(404).json({ error: 'İlan bulunamadı' });
    }
    
    res.json(ilan);
  } catch (error) {
    console.error('İlan getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Admin login endpoint
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Kullanıcı adı ve şifre gerekli' });
    }
    
    // Admin'i bul
    const admin = await Admin.findOne({ username: username.toLowerCase().trim() });
    
    if (!admin) {
      return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
    }
    
    // Şifreyi kontrol et
    const isPasswordValid = await admin.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
    }
    
    // Son giriş tarihini güncelle
    admin.sonGirisTarihi = new Date();
    await admin.save();
    
    // JWT token oluştur
    const token = jwt.sign(
      { adminId: admin._id, username: admin.username, role: admin.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log(`✅ Admin girişi başarılı: ${admin.username}`);
    
    res.json({
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        role: admin.role,
        sonGirisTarihi: admin.sonGirisTarihi
      }
    });
    
  } catch (error) {
    console.error('❌ Admin login hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası', detail: error.message });
  }
});

// Admin oluşturma endpoint (Postman için)
app.post('/api/admin/create', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Kullanıcı adı ve şifre gerekli' });
    }
    
    // Kullanıcı adı kontrolü
    const existingAdmin = await Admin.findOne({ username: username.toLowerCase().trim() });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Bu kullanıcı adı zaten kullanılıyor' });
    }
    
    // Admin oluştur
    const admin = new Admin({
      username: username.toLowerCase().trim(),
      password: password,
      role: role === 'superadmin' ? 'superadmin' : 'admin'
    });
    
    await admin.save();
    
    console.log(`✅ Admin oluşturuldu: ${admin.username}`);
    
    res.status(201).json({
      message: 'Admin başarıyla oluşturuldu',
      admin: {
        id: admin._id,
        username: admin.username,
        role: admin.role,
        olusturmaTarihi: admin.olusturmaTarihi
      }
    });
    
  } catch (error) {
    console.error('❌ Admin oluşturma hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası', detail: error.message });
  }
});

// Admin için optimize edilmiş ilan listesi (sadece gerekli alanlar ve ilk görsel)
app.get('/api/admin/ilanlar', authenticateAdmin, async (req, res) => {
  try {
    console.log('📋 Admin ilanlar isteği alındı...');
    const startTime = Date.now();
    // Sadece gerekli alanlar ve ilk görsel
    const ilanlar = await Ilan.find({}, {
      marka: 1,
      model: 1,
      otherMarka: 1,
      otherModel: 1,
      qiymet: 1,
      qiymetTip: 1,
      onaylandi: 1,
      olusturmaTarihi: 1,
      sekiller: { $slice: 1 },
      buraxilis: 1,
      seher: 1,
      ad: 1,
      telefon: 1,
      email: 1
    })
    .sort({ olusturmaTarihi: -1 })
    .lean();
    const endTime = Date.now();
    console.log(`✅ Admin ilanlar gönderildi: ${ilanlar.length} adet (${endTime - startTime}ms)`);
    res.json(ilanlar);
  } catch (error) {
    console.error('❌ Admin ilan getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası', detail: error.message });
  }
});

// Admin için ilan onayla/reddet
app.put('/api/admin/ilan/:id', authenticateAdmin, async (req, res) => {
  try {
    const { onaylandi, redSebebi, adminAdi } = req.body;
    
    if (typeof onaylandi !== 'boolean') {
      return res.status(400).json({ error: 'Geçersiz onay durumu' });
    }
    
    const updateData = {
      onaylandi,
      guncellemeTarihi: new Date()
    };
    
    if (onaylandi) {
      updateData.onayTarihi = new Date();
      updateData.onaylayanAdmin = adminAdi;
      updateData.redSebebi = null;
    } else {
      updateData.redSebebi = redSebebi || 'Belirtilmemiş';
      updateData.onayTarihi = null;
      updateData.onaylayanAdmin = null;
    }
    
    const ilan = await Ilan.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!ilan) {
      return res.status(404).json({ error: 'İlan bulunamadı' });
    }
    
    res.json({ 
      message: onaylandi ? 'İlan onaylandı' : 'İlan reddedildi',
      ilan 
    });
    
  } catch (error) {
    console.error('İlan onaylama hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Admin için ilan sil
app.delete('/api/admin/ilan/:id', authenticateAdmin, async (req, res) => {
  try {
    const ilan = await Ilan.findByIdAndDelete(req.params.id);
    
    if (!ilan) {
      return res.status(404).json({ error: 'İlan bulunamadı' });
    }
    
    res.json({ 
      message: 'İlan başarıyla silindi',
      ilanId: req.params.id 
    });
    
  } catch (error) {
    console.error('İlan silme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Reklam talep oluştur (public)
app.post('/api/reklam-talep', async (req, res) => {
  try {
    console.log('📝 Reklam talep isteği alındı...');
    const { ad, email, telefon, sirket, reklamNovu, mesaj, budjce } = req.body;
    
    if (!ad || !email || !telefon || !reklamNovu || !mesaj) {
      return res.status(400).json({ 
        error: 'Eksik bilgi', 
        detail: 'Ad, email, telefon, reklam növü və mesaj zorunludur' 
      });
    }
    
    const yeniTalep = new ReklamTalep({
      ad,
      email,
      telefon,
      sirket: sirket || '',
      reklamNovu,
      mesaj,
      budjce: budjce || ''
    });
    
    await yeniTalep.save();
    
    console.log(`✅ Yeni reklam talebi oluşturuldu: ${ad} - ${reklamNovu}`);
    
    res.status(201).json({ 
      message: 'Reklam talebi başarıyla gönderildi',
      talepId: yeniTalep._id
    });
    
  } catch (error) {
    console.error('❌ Reklam talep oluşturma hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası', detail: error.message });
  }
});

// Admin için reklam taleplerini getir
app.get('/api/admin/reklam-talepler', authenticateAdmin, async (req, res) => {
  try {
    const talepler = await ReklamTalep.find()
      .sort({ olusturmaTarihi: -1 })
      .lean();
    
    res.json(talepler);
  } catch (error) {
    console.error('❌ Reklam talepleri getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası', detail: error.message });
  }
});

// Admin için reklam talep durumunu güncelle
app.put('/api/admin/reklam-talep/:id/durum', authenticateAdmin, async (req, res) => {
  try {
    const { durum } = req.body;
    
    if (!durum || !['Yeni', 'Cavablandırıldı', 'Ləğv edildi'].includes(durum)) {
      return res.status(400).json({ error: 'Geçersiz durum' });
    }
    
    const talep = await ReklamTalep.findByIdAndUpdate(
      req.params.id,
      { durum, guncellemeTarihi: new Date() },
      { new: true }
    );
    
    if (!talep) {
      return res.status(404).json({ error: 'Talep bulunamadı' });
    }
    
    res.json({ message: 'Talep durumu güncellendi', talep });
    
  } catch (error) {
    console.error('❌ Reklam talep durum güncelleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası', detail: error.message });
  }
});

// Admin için reklam talep sil
app.delete('/api/admin/reklam-talep/:id', authenticateAdmin, async (req, res) => {
  try {
    const talep = await ReklamTalep.findByIdAndDelete(req.params.id);
    
    if (!talep) {
      return res.status(404).json({ error: 'Talep bulunamadı' });
    }
    
    res.json({ message: 'Talep başarıyla silindi', talepId: req.params.id });
    
  } catch (error) {
    console.error('❌ Reklam talep silme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası', detail: error.message });
  }
});

// Cloudinary kontrol endpoint'i - Son ilanın görsellerini kontrol et
app.get('/api/test/cloudinary-check', async (req, res) => {
  try {
    const sonIlan = await Ilan.findOne({ onaylandi: true })
      .sort({ olusturmaTarihi: -1 })
      .lean();
    
    if (!sonIlan) {
      return res.json({ 
        message: 'Henüz onaylanmış ilan yok',
        cloudinaryKullaniliyor: false
      });
    }
    
    const ilkGorsel = sonIlan.sekiller && sonIlan.sekiller.length > 0 ? sonIlan.sekiller[0] : null;
    const cloudinaryKullaniliyor = ilkGorsel && ilkGorsel.startsWith('https://res.cloudinary.com');
    
    res.json({
      ilanId: sonIlan._id,
      marka: sonIlan.marka,
      model: sonIlan.model,
      gorselSayisi: sonIlan.sekiller ? sonIlan.sekiller.length : 0,
      ilkGorsel: ilkGorsel ? ilkGorsel.substring(0, 80) + '...' : 'Görsel yok',
      cloudinaryKullaniliyor: cloudinaryKullaniliyor,
      gorselTipi: ilkGorsel ? (cloudinaryKullaniliyor ? 'Cloudinary URL' : 'Base64 (Eski format)') : 'Yok'
    });
  } catch (error) {
    console.error('❌ Cloudinary kontrol hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası', detail: error.message });
  }
});

// İstatistikler
app.get('/api/admin/istatistikler', authenticateAdmin, async (req, res) => {
  try {
    console.log('📊 İstatistik isteği alındı...');
    const startTime = Date.now();
    
    const [toplamIlan, onaylanmisIlan, bekleyenIlan, reddedilmisIlan] = await Promise.all([
      Ilan.countDocuments(),
      Ilan.countDocuments({ onaylandi: true }),
      Ilan.countDocuments({ onaylandi: false }),
      Ilan.countDocuments({ onaylandi: false, redSebebi: { $exists: true, $ne: null } })
    ]);
    
    const endTime = Date.now();
    console.log(`✅ İstatistikler hesaplandı (${endTime - startTime}ms):`, {
      toplamIlan,
      onaylanmisIlan,
      bekleyenIlan,
      reddedilmisIlan
    });
    
    res.json({
      toplamIlan,
      onaylanmisIlan,
      bekleyenIlan,
      reddedilmisIlan
    });
  } catch (error) {
    console.error('❌ İstatistik hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Sunucu başlat
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend ${PORT} portunda çalışıyor!`);
});

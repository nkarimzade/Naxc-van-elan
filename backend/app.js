require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const sharp = require('sharp');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Büyük resimler için limit artırıldı

// Node.js için görsel sıkıştırma
const compressImageNode = async (base64String, maxSizeKB = 150) => {
  try {
    // Base64'ten buffer'a çevir
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Sharp ile sıkıştır
    let quality = 60; // Başlangıç kalitesini düşürdük
    let compressedBuffer;
    
    do {
      compressedBuffer = await sharp(buffer)
        .resize(800, 800, { // Boyutu daha da küçülttük
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .jpeg({ quality })
        .toBuffer();
      
      const sizeKB = compressedBuffer.length / 1024;
      console.log(`📸 Görsel sıkıştırma: ${sizeKB.toFixed(1)}KB, Kalite: ${quality}%`);
      
      if (sizeKB <= maxSizeKB || quality <= 5) { // Minimum kaliteyi daha da düşürdük
        break;
      }
      
      quality -= 15; // Daha hızlı kalite düşürme
    } while (quality > 5);
    
    // Buffer'ı base64'e çevir
    const compressedBase64 = `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
    return compressedBase64;
    
  } catch (error) {
    console.error('❌ Görsel sıkıştırma hatası:', error);
    return base64String; // Hata durumunda orijinal görseli döndür
  }
};

// MongoDB bağlantısı
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('MongoDB bağlantısı başarılı!'))
  .catch((err) => console.error('MongoDB bağlantı hatası:', err));

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
  sekiller: [{ type: String, required: true }], // Base64 formatında
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
    
    // Görselleri sıkıştır
    console.log('📸 Görseller sıkıştırılıyor...');
    const compressedImages = [];
    
    for (let i = 0; i < ilanData.sekiller.length; i++) {
      const originalImage = ilanData.sekiller[i];
      const originalSizeKB = (originalImage.length * 0.75) / 1024;
      
      console.log(`📸 Görsel ${i + 1}: ${originalSizeKB.toFixed(1)}KB -> sıkıştırılıyor...`);
      
      try {
        const compressedImage = await compressImageNode(originalImage, 150); // 150KB limit
        const compressedSizeKB = (compressedImage.length * 0.75) / 1024;
        
        console.log(`✅ Görsel ${i + 1}: ${originalSizeKB.toFixed(1)}KB -> ${compressedSizeKB.toFixed(1)}KB`);
        compressedImages.push(compressedImage);
        
      } catch (error) {
        console.error(`❌ Görsel ${i + 1} sıkıştırma hatası:`, error);
        compressedImages.push(originalImage); // Hata durumunda orijinal görseli kullan
      }
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
      sekiller: compressedImages, // Sıkıştırılmış görseller
      onaylandi: false
    });
    
    await yeniIlan.save();
    
    console.log(`✅ Yeni ilan oluşturuldu: ${finalMarka} ${finalModel}`);
    
    res.status(201).json({ 
      message: 'İlan başarıyla oluşturuldu ve onay için gönderildi',
      ilanId: yeniIlan._id,
      imageCount: compressedImages.length
    });
    
  } catch (error) {
    console.error('❌ İlan oluşturma hatası:', error);
    res.status(500).json({ 
      error: 'Sunucu hatası', 
      detail: 'İlan oluşturulurken bir hata oluştu' 
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

// Admin için optimize edilmiş ilan listesi (sadece gerekli alanlar ve ilk görsel)
app.get('/api/admin/ilanlar', async (req, res) => {
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
app.put('/api/admin/ilan/:id', async (req, res) => {
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
app.delete('/api/admin/ilan/:id', async (req, res) => {
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

// Admin için reklam taleplerini getir (şimdilik boş dizi)
app.get('/api/admin/reklam-talepler', (req, res) => {
  res.json([]);
});

// İstatistikler
app.get('/api/admin/istatistikler', async (req, res) => {
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
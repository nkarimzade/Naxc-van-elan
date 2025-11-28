require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB Atlas bağlantısı
const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
  console.error('❌ MONGO_URL .env dosyasında tanımlı değil!');
  process.exit(1);
}

// Database adını zorunlu olarak naxauto yap
let mongoConnectionUrl = MONGO_URL;

// MongoDB connection string formatı: mongodb+srv://user:pass@host/database?options
// Database adını her zaman naxauto olarak ayarla
const urlMatch = mongoConnectionUrl.match(/^(mongodb\+srv:\/\/[^\/]+)(\/[^?]+)?(\?.*)?$/);
if (urlMatch) {
  const baseUrl = urlMatch[1]; // mongodb+srv://user:pass@host
  const queryString = urlMatch[3] || ''; // ?retryWrites=true&w=majority
  mongoConnectionUrl = `${baseUrl}/naxauto${queryString}`;
} else {
  // Eğer format uymazsa, basit ekleme yap
  if (mongoConnectionUrl.includes('?')) {
    mongoConnectionUrl = mongoConnectionUrl.replace('?', '/naxauto?');
  } else if (!mongoConnectionUrl.endsWith('/')) {
    mongoConnectionUrl = mongoConnectionUrl + '/naxauto';
  } else {
    mongoConnectionUrl = mongoConnectionUrl + 'naxauto';
  }
}

async function clearDatabase() {
  try {
    console.log('🗄️ Veritabanına bağlanılıyor...');
    await mongoose.connect(mongoConnectionUrl);
    console.log('✅ Veritabanına bağlandı!');

    // İlan şeması
    const ilanSchema = new mongoose.Schema({}, { strict: false });
    const Ilan = mongoose.model('Ilan', ilanSchema);

    // Tüm ilanları say
    const count = await Ilan.countDocuments();
    console.log(`📊 Mevcut ilan sayısı: ${count}`);

    if (count > 0) {
      // Tüm ilanları sil
      const result = await Ilan.deleteMany({});
      console.log(`🗑️ ${result.deletedCount} ilan silindi!`);
    } else {
      console.log('ℹ️ Silinecek ilan yok.');
    }

    // Yeni sayım
    const newCount = await Ilan.countDocuments();
    console.log(`📊 Yeni ilan sayısı: ${newCount}`);

    console.log('✅ Veritabanı temizlendi!');
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Veritabanı bağlantısı kapatıldı.');
  }
}

clearDatabase(); 
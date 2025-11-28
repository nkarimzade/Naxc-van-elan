require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB Atlas bağlantısı
const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
  console.error('❌ MONGO_URL .env dosyasında tanımlı değil!');
  process.exit(1);
}

// Database adını test olarak ayarla (MongoDB Atlas'ta mevcut database)
let mongoConnectionUrl = MONGO_URL.trim();

// MongoDB connection string formatı: mongodb+srv://user:pass@host/database?options
// Database adını her zaman test olarak ayarla
const mongoUrlRegex = /^(mongodb\+srv:\/\/[^\/]+)(\/[^?]*)?(\?.*)?$/;
const urlMatch = mongoConnectionUrl.match(mongoUrlRegex);

if (urlMatch) {
  const baseUrl = urlMatch[1]; // mongodb+srv://user:pass@host
  const queryString = urlMatch[3] || ''; // ?retryWrites=true&w=majority
  mongoConnectionUrl = `${baseUrl}/test${queryString}`;
} else {
  // Eğer format uymazsa, basit ekleme yap
  if (mongoConnectionUrl.includes('?')) {
    mongoConnectionUrl = mongoConnectionUrl.replace('?', '/test?');
  } else if (!mongoConnectionUrl.endsWith('/')) {
    mongoConnectionUrl = mongoConnectionUrl + '/test';
  } else {
    mongoConnectionUrl = mongoConnectionUrl + 'test';
  }
}

// Final kontrol: çift slash'ları temizle
mongoConnectionUrl = mongoConnectionUrl.replace(/(mongodb\+srv:\/\/[^\/]+)\/\/+/g, '$1/');

async function clearDatabase() {
  try {
    console.log('🗄️ Veritabanına bağlanılıyor...');
    await mongoose.connect(mongoConnectionUrl);
    console.log('✅ Veritabanına bağlandı!');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);

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

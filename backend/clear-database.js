const mongoose = require('mongoose');

// MongoDB Atlas bağlantısı
const MONGO_URL = 'mongodb+srv://naxauto:naxauto@cluster0.rfycebg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function clearDatabase() {
  try {
    console.log('🗄️ Veritabanına bağlanılıyor...');
    await mongoose.connect(MONGO_URL);
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
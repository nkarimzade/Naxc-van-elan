const mongoose = require('mongoose');

// MongoDB Atlas bağlantısı
const MONGO_URL = 'mongodb+srv://naxauto:naxauto@cluster0.rfycebg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function checkIlanlar() {
  try {
    console.log('🗄️ Veritabanına bağlanılıyor...');
    await mongoose.connect(MONGO_URL);
    console.log('✅ Veritabanına bağlandı!');

    // İlan şeması
    const ilanSchema = new mongoose.Schema({}, { strict: false });
    const Ilan = mongoose.model('Ilan', ilanSchema);

    // Tüm ilanları say
    const count = await Ilan.countDocuments();
    console.log(`📊 Toplam ilan sayısı: ${count}`);

    if (count > 0) {
      // İlanları listele
      const ilanlar = await Ilan.find().sort({ olusturmaTarihi: -1 });
      console.log('\n📋 İlanlar:');
      ilanlar.forEach((ilan, index) => {
        console.log(`${index + 1}. ID: ${ilan._id}`);
        console.log(`   Marka: ${ilan.marka}`);
        console.log(`   Model: ${ilan.model}`);
        console.log(`   Onaylandı: ${ilan.onaylandi}`);
        console.log(`   Oluşturma: ${ilan.olusturmaTarihi}`);
        console.log(`   Görsel sayısı: ${ilan.sekiller ? ilan.sekiller.length : 0}`);
        console.log('---');
      });
    } else {
      console.log('ℹ️ Veritabanında ilan yok.');
    }
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Veritabanı bağlantısı kapatıldı.');
  }
}

checkIlanlar(); 
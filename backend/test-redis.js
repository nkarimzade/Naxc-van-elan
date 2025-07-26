const redis = require('redis');

// Redis bağlantısı
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
  console.log('❌ Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Redis bağlantısı başarılı!');
});

async function testRedis() {
  try {
    console.log('🔄 Redis bağlantısı test ediliyor...');
    
    // Bağlantıyı başlat
    await redisClient.connect();
    
    // Test verisi yaz
    await redisClient.set('test', 'Redis çalışıyor!');
    console.log('✅ Test verisi yazıldı');
    
    // Test verisini oku
    const testValue = await redisClient.get('test');
    console.log('📖 Test verisi:', testValue);
    
    // Test verisini sil
    await redisClient.del('test');
    console.log('🗑️ Test verisi silindi');
    
    // Cache test
    const startTime = Date.now();
    await redisClient.setEx('cache:test', 60, JSON.stringify({ message: 'Cache test', timestamp: Date.now() }));
    const cacheData = await redisClient.get('cache:test');
    const endTime = Date.now();
    
    console.log('⚡ Cache test:', JSON.parse(cacheData));
    console.log(`⏱️ Cache işlem süresi: ${endTime - startTime}ms`);
    
    // Memory kullanımı
    const memory = await redisClient.memoryUsage();
    console.log('💾 Bellek kullanımı:', memory);
    
    // Bağlantıyı kapat
    await redisClient.quit();
    console.log('✅ Redis test tamamlandı!');
    
  } catch (error) {
    console.error('❌ Redis test hatası:', error);
    console.log('\n🔧 Çözüm önerileri:');
    console.log('1. Redis servisinin çalıştığından emin olun');
    console.log('2. redis-cli ping komutu ile test edin');
    console.log('3. Redis URL\'ini kontrol edin');
    console.log('4. Firewall ayarlarını kontrol edin');
  }
}

testRedis(); 
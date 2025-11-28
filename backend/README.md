# Naxçıvan Elan Backend

Bu backend, ilan yönetim sistemi için geliştirilmiştir ve Redis cache sistemi ile optimize edilmiştir.

## 🚀 Özellikler

- **İlan Yönetimi**: İlan oluşturma, onaylama, reddetme ve silme
- **Redis Cache**: Hızlı veri erişimi için cache sistemi
- **Görsel Sıkıştırma**: Otomatik görsel optimizasyonu
- **Admin Paneli**: İlan yönetimi ve istatistikler
- **MongoDB**: Veritabanı yönetimi

## 📦 Kurulum

### 1. Bağımlılıkları Yükle
```bash
npm install
```

### 2. Redis Kurulumu

#### Windows için:
1. [Redis for Windows](https://github.com/microsoftarchive/redis/releases) indirin
2. Kurulumu tamamlayın
3. Redis servisini başlatın

#### macOS için:
```bash
brew install redis
brew services start redis
```

#### Linux için:
```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
```

### 3. Ücretsiz Redis Servisleri (Alternatif)

Redis'i yerel kurmak istemiyorsanız, ücretsiz servisler kullanabilirsiniz:

#### Redis Cloud (Ücretsiz):
1. [Redis Cloud](https://redis.com/try-free/) sitesine gidin
2. Ücretsiz hesap oluşturun
3. Database oluşturun
4. Connection string'i alın

#### Upstash (Ücretsiz):
1. [Upstash](https://upstash.com/) sitesine gidin
2. Ücretsiz hesap oluşturun
3. Redis database oluşturun
4. Connection string'i alın

### 4. Environment Variables

`.env` dosyası oluşturun:
```env
MONGO_URL=mongodb+srv://naxauto:naxauto@cluster0.rfycebg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
REDIS_URL=redis://localhost:6379
PORT=5000
```

### 5. Uygulamayı Başlat
```bash
npm start
```

## 🔥 Cache Sistemi

### Cache Süreleri:
- **Ana Sayfa İlanları**: 5 dakika
- **İlan Detayları**: 10 dakika
- **Admin İlan Listesi**: 2 dakika
- **İstatistikler**: 5 dakika
- **Reklam Talepleri**: 5 dakika

### Cache Temizleme:
- Yeni ilan eklendiğinde otomatik temizlenir
- İlan onaylandığında/reddedildiğinde temizlenir
- İlan silindiğinde temizlenir
- Admin panelinden manuel temizlenebilir

## 📊 API Endpoints

### İlan Yönetimi:
- `POST /api/ilan` - Yeni ilan oluştur
- `GET /api/ilan` - Onaylanmış ilanları getir
- `GET /api/ilan/:id` - Belirli bir ilanı getir

### Admin Endpoints:
- `GET /api/admin/ilanlar` - Tüm ilanları getir (admin)
- `PUT /api/admin/ilan/:id` - İlan onayla/reddet
- `DELETE /api/admin/ilan/:id` - İlan sil
- `DELETE /api/admin/ilanlar/tumunu-sil` - Tüm ilanları sil
- `GET /api/admin/istatistikler` - İstatistikleri getir

### Cache Endpoints:
- `GET /api/cache/status` - Cache durumunu kontrol et
- `DELETE /api/cache/clear` - Cache'i temizle

## 🎯 Performans Optimizasyonları

### Backend:
- Redis cache ile veri erişimi hızlandırıldı
- MongoDB sorguları optimize edildi
- Görsel sıkıştırma ile dosya boyutları küçültüldü
- Lean queries kullanıldı

### Frontend:
- 60 saniye timeout ile uzun süreli istekler
- Loading states ile kullanıcı deneyimi
- Error handling ile hata yönetimi

## 🔧 Geliştirme

### Development Mode:
```bash
npm run dev
```

### Production:
```bash
npm start
```

## 📈 Performans Metrikleri

Cache sistemi ile:
- **İlk istek**: 2-3 saniye (MongoDB'den)
- **Sonraki istekler**: 50-100 milisaniye (Redis'ten)
- **100x hız artışı** sağlanır

## 🛠️ Sorun Giderme

### Redis Bağlantı Hatası:
```bash
# Redis servisinin çalışıp çalışmadığını kontrol et
redis-cli ping
```

### Cache Temizleme:
```bash
# Tüm cache'i temizle
redis-cli flushall
```

### Log Kontrolü:
```bash
# Redis loglarını kontrol et
tail -f /var/log/redis/redis-server.log
```

## 📝 Notlar

- Redis cache sistemi opsiyoneldir, Redis olmadan da çalışır
- Cache hatası durumunda sistem normal şekilde devam eder
- Production'da Redis Cloud veya Upstash kullanmanız önerilir
- Cache süreleri ihtiyaca göre ayarlanabilir 
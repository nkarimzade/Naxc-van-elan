import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Basit admin kontrolü - gerçek uygulamada backend'de kontrol edilmeli
      if (formData.username === 'admin' && formData.password === 'admin123') {
        // Admin bilgilerini localStorage'a kaydet
        localStorage.setItem('adminPassword', formData.password);
        localStorage.setItem('adminUser', JSON.stringify({
          username: formData.username,
          role: 'admin'
        }));
        
        console.log('✅ Admin girişi başarılı:', formData.username);
        navigate('/admin');
        
      } else {
        setError('❌ Yanlış kullanıcı adı veya şifre!');
      }
      
    } catch (error) {
      console.error('❌ Giriş hatası:', error);
      setError('❌ Giriş sırasında hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h2>🔐 Admin Girişi</h2>
          <p>NaxAuto Admin Paneli</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="input-container">
            <label htmlFor="username">👤 Kullanıcı Adı</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Kullanıcı adınızı girin"
              autoComplete="username"
            />
          </div>

          <div className="input-container">
            <label htmlFor="password">🔒 Şifre</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Şifrenizi girin"
              autoComplete="current-password"
            />
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={loading || !formData.username || !formData.password}
          >
            {loading ? '🔄 Giriş yapılıyor...' : '🚀 Giriş Yap'}
          </button>
        </form>

        <div className="admin-login-footer">
          <div className="login-info">
            <h4>📋 Test Bilgileri:</h4>
            <p><strong>Kullanıcı Adı:</strong> admin</p>
            <p><strong>Şifre:</strong> admin123</p>
          </div>
          <p>⚠️ Bu test hesabıdır. Gerçek uygulamada güvenli bir sistem kullanın.</p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin; 
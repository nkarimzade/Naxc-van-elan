import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
      const response = await axios.post('https://naxc-van-elan-o2sr.onrender.com/api/admin/login', formData);
      const { token, admin } = response.data;
      
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(admin));
      
      navigate('/admin');
      
    } catch (error) {
      console.error('Giriş hatası:', error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Giriş edilə bilmədi. Xahiş edirik yenidən cəhd edin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h2>Admin Girişi</h2>
          <p>NaxAuto Admin Paneli</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="input-container">
            <label htmlFor="username">İstifadəçi Adı</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="İstifadəçi adınızı daxil edin"
            />
          </div>

          <div className="input-container">
            <label htmlFor="password">Şifrə</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Şifrənizi daxil edin"
            />
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={loading || !formData.username || !formData.password}
          >
            {loading ? 'Giriş edilir...' : 'Daxil ol'}
          </button>
        </form>

        <div className="admin-login-footer">
          <p>Admin hesabınız yoxdursa, sistem administratoru ilə əlaqə saxlayın.</p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin; 
import React, { useState } from 'react';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import axios from 'axios';

const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    social_link: '',
    password: '',
    confirmPassword: '',
    receiveNotifications: false
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Họ và tên không được để trống';
    if (!formData.phone) newErrors.phone = 'Số ĐT không được để trống';
    if (!formData.email) newErrors.email = 'Địa chỉ email không được để trống';
    if (!formData.email.includes('@')) newErrors.email = 'Địa chỉ email không hợp lệ';
    if (!formData.password) newErrors.password = 'Mật khẩu không được để trống';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    
    if (Object.keys(validationErrors).length === 0) {
      try {
        setLoading(true);
        
        // Định nghĩa URL cơ sở API - sử dụng cổng 5000 cho json-server
        const API_BASE_URL = 'http://localhost:5000';
        
        try {
          // Kiểm tra xem email đã tồn tại chưa
          const existingUsers = await axios.get(`${API_BASE_URL}/users?email=${encodeURIComponent(formData.email)}`, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          
          if (existingUsers.data.length > 0) {
            setErrors({ email: 'Email này đã được đăng ký' });
            setLoading(false);
            return;
          }
        } catch (error) {
          console.log('Lỗi kiểm tra email, tiếp tục đăng ký:', error);
          // Tiếp tục đăng ký ngay cả khi kiểm tra thất bại
        }
        
        // Chuẩn bị dữ liệu người dùng theo cấu trúc của bạn
        const userData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          social_link: formData.social_link || '',
          password: formData.password,
          role: 'user',
          is_active: true
        };
        
        console.log('Đang gửi dữ liệu đến:', `${API_BASE_URL}/users`);
        console.log('Dữ liệu người dùng:', userData);
        
        // Gửi đến json-server với cấu hình phù hợp
        const response = await axios.post(`${API_BASE_URL}/users`, userData, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        console.log('User registered successfully:', response.data);
        setSuccess(true);
        
        // Reset form after successful submission
        setFormData({
          name: '',
          phone: '',
          email: '',
          social_link: '',
          password: '',
          confirmPassword: '',
          receiveNotifications: false
        });
      } catch (error) {
        console.error('Registration error:', error);
        setErrors({ submit: 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.' });
      } finally {
        setLoading(false);
      }
    } else {
      setErrors(validationErrors);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      social_link: '',
      password: '',
      confirmPassword: '',
      receiveNotifications: false
    });
    setErrors({});
    setSuccess(false);
  };

  return (
    <div className="bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center mb-4 text-sm text-gray-500">
          <a href="/" className="hover:text-green-500">Home</a>
          <span className="mx-2">/</span>
          <span className="text-gray-700">Đăng ký</span>
        </div>

        <div className="bg-white p-6 rounded shadow">
          {success ? (
            <div className="text-center py-8">
              <div className="text-green-500 text-5xl mb-4">✓</div>
              <h2 className="text-2xl font-semibold mb-4">Đăng ký thành công!</h2>
              <p className="text-gray-600 mb-6">Tài khoản của bạn đã được tạo thành công.</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleReset}
                  className="px-6 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-100 transition-colors"
                >
                  Đăng ký tài khoản khác
                </button>
                <a
                  href="/login"
                  className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  Đăng nhập ngay
                </a>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-green-500 mb-6 uppercase">Thông tin cá nhân</h2>
              
              <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-gray-700 mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 focus:outline-none focus:border-green-500`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">
                  Số ĐT <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 focus:outline-none focus:border-green-500`}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">
                  Địa chỉ email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 focus:outline-none focus:border-green-500`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">
                  Liên kết mạng xã hội
                </label>
                <input
                  type="url"
                  name="social_link"
                  value={formData.social_link}
                  onChange={handleChange}
                  placeholder="https://www.facebook.com/your.profile"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-green-500"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="flex items-center text-gray-700">
                <input
                  type="checkbox"
                  name="receiveNotifications"
                  checked={formData.receiveNotifications}
                  onChange={handleChange}
                  className="mr-2 h-4 w-4 text-green-500"
                />
                Đăng ký nhận thông tin qua email
              </label>
            </div>
            
            <h2 className="text-xl font-semibold text-green-500 mb-6 mt-8 uppercase">Thông tin tài khoản</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-gray-700 mb-2">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 focus:outline-none focus:border-green-500`}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">
                  Nhập lại mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 focus:outline-none focus:border-green-500`}
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
            
            {errors.submit && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {errors.submit}
              </div>
            )}
            
            <div className="flex flex-wrap gap-4 mt-6">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-100 transition-colors"
                disabled={loading}
              >
                QUAY LẠI
              </button>
              
              <button
                type="submit"
                className={`px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    ĐANG XỬ LÝ...
                  </>
                ) : 'ĐĂNG KÝ'}
              </button>
            </div>
          </form>
          </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;

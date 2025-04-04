import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthEvents } from '../components/Header'; // Import AuthEvents từ Header
import { toast } from 'react-toastify';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Kiểm tra nếu đã đăng nhập thì chuyển hướng
  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (storedUser) {
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Vui lòng nhập email';
    if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    
    if (Object.keys(validationErrors).length === 0) {
      try {
        setLoading(true);
        
        // Gửi yêu cầu đến JSON server để kiểm tra tài khoản
        const API_URL = 'http://localhost:5000';
        const response = await axios.get(`${API_URL}/users?email=${encodeURIComponent(formData.email)}`);
        
        if (response.data.length === 0) {
          setErrors({ auth: 'Email hoặc mật khẩu không đúng' });
          setLoading(false);
          return;
        }
        
        const user = response.data[0];
        
        // Kiểm tra mật khẩu
        if (user.password !== formData.password) {
          setErrors({ auth: 'Email hoặc mật khẩu không đúng' });
          setLoading(false);
          return;
        }
        
        // Lưu thông tin người dùng (trừ mật khẩu) vào storage
        const userData = {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          social_link: user.social_link || '',
          role: user.role || 'user'
        };
        
        // Lưu vào localStorage hoặc sessionStorage tùy theo lựa chọn "Ghi nhớ"
        if (formData.rememberMe) {
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          sessionStorage.setItem('user', JSON.stringify(userData));
        }
        
        // Phát sự kiện đăng nhập thành công
        AuthEvents.publish('auth-change', userData);
        
        setSuccess(true);
        
        // Kiểm tra xem có sản phẩm đang xem trước khi đăng nhập không
        const lastViewedProduct = sessionStorage.getItem('lastViewedProduct');
        
        // Đợi 1.5 giây để hiển thị thông báo thành công
        setTimeout(() => {
          if (lastViewedProduct) {
            // Nếu có, chuyển hướng về trang sản phẩm đó
            const product = JSON.parse(lastViewedProduct);
            sessionStorage.removeItem('lastViewedProduct'); // Xóa thông tin sau khi sử dụng
            toast.success('Đăng nhập thành công! Đang quay lại trang sản phẩm.');
            navigate(`/product/${product.id}`);
          } else {
            // Nếu không, chuyển hướng về trang chủ
            navigate('/');
          }
        }, 1500);
        
      } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        setErrors({ auth: 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.' });
        setLoading(false);
      }
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <div className="bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center mb-4 text-sm text-gray-500">
          <a href="/" className="hover:text-green-500">Home</a>
          <span className="mx-2">/</span>
          <span className="text-gray-700">Đăng nhập</span>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Phần đăng nhập */}
          <div className="bg-white p-6 rounded shadow md:w-1/2">
            {success ? (
              <div className="text-center py-8">
                <div className="text-green-500 text-5xl mb-4">✓</div>
                <h2 className="text-2xl font-semibold mb-4">Đăng nhập thành công!</h2>
                <p className="text-gray-600">Đang chuyển hướng...</p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-green-500 mb-6 uppercase">Thông tin cá nhân</h2>
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                      Email của bạn
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
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                      Mật khẩu
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
                  
                  <div className="mb-4">
                    <label className="flex items-center text-gray-700">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                        className="mr-2 h-4 w-4 text-green-500"
                      />
                      Ghi nhớ tài khoản
                    </label>
                    <a href="/quen-mat-khau" className="text-sm text-green-500 hover:underline float-right">
                      Bạn quên mật khẩu?
                    </a>
                  </div>
                  
                  {errors.auth && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                      {errors.auth}
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    className={`px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors w-full ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        ĐANG XỬ LÝ...
                      </div>
                    ) : 'ĐĂNG NHẬP'}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Phần "Bạn chưa có tài khoản?" */}
          <div className="bg-white p-6 rounded shadow md:w-1/2">
            <h2 className="text-xl font-semibold text-green-500 mb-6 uppercase">Bạn chưa có tài khoản?</h2>
            
            <p className="text-gray-600 mb-6">
              Đăng ký tài khoản ngay để có thể mua hàng nhanh chóng và sẽ được hưởng những ưu đãi cùng với rất nhiều chính sách và ưu đãi cho các thành viên của chúng tôi.
            </p>
            
            <a
              href="/dang-ky"
              className="inline-block px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              ĐĂNG KÝ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

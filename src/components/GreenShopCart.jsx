import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import CheckoutPopup from './CheckoutPopup';
import SuccessPopup from './SuccessPopup';
import { AuthEvents } from './Header';

const GreenShopCart = () => {
  const navigate = useNavigate();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    email: '',
    paymentMethod: 'COD'
  });

  // Kiểm tra người dùng đã đăng nhập chưa
  useEffect(() => {
    const checkUserLogin = () => {
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setCurrentUser(userData);
          // Cập nhật formData với thông tin người dùng
          setFormData(prevData => ({
            ...prevData,
            fullName: userData.name || '',
            phone: userData.phone || '',
            email: userData.email || '',
          }));
        } catch (error) {
          console.error('Lỗi khi đọc thông tin người dùng:', error);
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
    };

    checkUserLogin();
  }, [navigate]);

  // Lấy giỏ hàng của người dùng
  useEffect(() => {
    const fetchCart = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/orders?user_id=${currentUser.id}&status=trong giỏ hàng`);
        
        if (response.data.length > 0) {
          setCart(response.data[0]);
          setCartItems(response.data[0].trees || []);
        } else {
          // Tạo giỏ hàng trống nếu chưa có
          const newCart = {
            user_id: currentUser.id,
            user_name: currentUser.name,
            status: "trong giỏ hàng",
            trees: [],
            address: "",
            phone: currentUser.phone || "",
            created_at: new Date().toISOString(),
            total: 0
          };
          
          const createResponse = await axios.post('http://localhost:5000/orders', newCart);
          setCart(createResponse.data);
          setCartItems([]);
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin giỏ hàng:', error);
        toast.error('Không thể tải giỏ hàng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [currentUser]);

  // Cập nhật số lượng sản phẩm
  const handleQuantityChange = async (productId, quantity) => {
    if (!cart || quantity < 1) return;
    
    setUpdatingItem(productId);
    
    try {
      // Cập nhật số lượng sản phẩm trong state
      const updatedItems = cartItems.map(item => {
        if (item.id === productId) {
          return { ...item, quantity };
        }
        return item;
      });
      
      // Cập nhật tổng tiền
      const updatedTotal = updatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity, 
        0
      );
      
      // Cập nhật state trước để UI phản hồi nhanh hơn
      setCartItems(updatedItems);
      setCart({ ...cart, trees: updatedItems, total: updatedTotal });
      
      // Gửi yêu cầu cập nhật lên server
      await axios.patch(`http://localhost:5000/orders/${cart.id}`, {
        trees: updatedItems,
        total: updatedTotal
      });
      
      // Thông báo sự thay đổi giỏ hàng cho các component khác
      AuthEvents.publish('cart-update', null);
      
    } catch (error) {
      console.error('Lỗi khi cập nhật số lượng:', error);
      toast.error('Cập nhật số lượng thất bại. Vui lòng thử lại.');
      // Fetch lại giỏ hàng nếu có lỗi để đảm bảo dữ liệu đồng bộ
      if (currentUser) {
        const response = await axios.get(`http://localhost:5000/orders?user_id=${currentUser.id}&status=trong giỏ hàng`);
        if (response.data.length > 0) {
          setCart(response.data[0]);
          setCartItems(response.data[0].trees || []);
        }
      }
    } finally {
      setUpdatingItem(null);
    }
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const handleRemoveItem = async (productId) => {
    if (!cart) return;
    
    setDeletingItem(productId);
    
    try {
      // Lọc bỏ sản phẩm khỏi danh sách trong state
      const updatedItems = cartItems.filter(item => item.id !== productId);
      
      // Cập nhật tổng tiền
      const updatedTotal = updatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity, 
        0
      );
      
      // Cập nhật state trước để UI phản hồi nhanh hơn
      setCartItems(updatedItems);
      setCart({ ...cart, trees: updatedItems, total: updatedTotal });
      
      // Gửi yêu cầu cập nhật lên server
      await axios.patch(`http://localhost:5000/orders/${cart.id}`, {
        trees: updatedItems,
        total: updatedTotal
      });
      
      // Thông báo sự thay đổi giỏ hàng cho các component khác
      AuthEvents.publish('cart-update', null);
      
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
      
    } catch (error) {
      console.error('Lỗi khi xóa sản phẩm:', error);
      toast.error('Xóa sản phẩm thất bại. Vui lòng thử lại.');
      // Fetch lại giỏ hàng nếu có lỗi để đảm bảo dữ liệu đồng bộ
      if (currentUser) {
        const response = await axios.get(`http://localhost:5000/orders?user_id=${currentUser.id}&status=trong giỏ hàng`);
        if (response.data.length > 0) {
          setCart(response.data[0]);
          setCartItems(response.data[0].trees || []);
        }
      }
    } finally {
      setDeletingItem(null);
    }
  };

  // Cập nhật tất cả sản phẩm (từ các input number)
  const handleUpdateCart = async () => {
    if (!cart) return;
    
    try {
      // Chúng ta đã cập nhật state khi người dùng thay đổi số lượng
      // nên chỉ cần gửi yêu cầu cập nhật lên server
      await axios.patch(`http://localhost:5000/orders/${cart.id}`, {
        trees: cartItems,
        total: subtotal
      });
      
      // Thông báo sự thay đổi giỏ hàng cho các component khác
      AuthEvents.publish('cart-update', null);
      
      toast.success('Đã cập nhật giỏ hàng');
      
    } catch (error) {
      console.error('Lỗi khi cập nhật giỏ hàng:', error);
      toast.error('Cập nhật giỏ hàng thất bại. Vui lòng thử lại.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleItemQuantityInputChange = (e, productId) => {
    const quantity = parseInt(e.target.value);
    if (isNaN(quantity) || quantity < 1) return;
    
    // Chỉ cập nhật state, chưa gửi request lên server
    const updatedItems = cartItems.map(item => {
      if (item.id === productId) {
        return { ...item, quantity };
      }
      return item;
    });
    
    setCartItems(updatedItems);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi thanh toán.');
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    if (!currentUser || !cart) {
      toast.error('Vui lòng đăng nhập để đặt hàng');
      return;
    }
    
    try {
      // Tạo đơn hàng mới từ giỏ hàng hiện tại
      const orderData = {
        user_id: currentUser.id,
        user_name: formData.fullName,
        status: "đã đặt",
        trees: cartItems,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        payment_method: formData.paymentMethod,
        created_at: new Date().toISOString(),
        total: subtotal + tax
      };
      
      // Gửi yêu cầu tạo đơn hàng mới
      await axios.post('http://localhost:5000/orders', orderData);
      
      // Làm trống giỏ hàng hiện tại
      await axios.patch(`http://localhost:5000/orders/${cart.id}`, {
        trees: [],
        total: 0
      });
      
      // Cập nhật state
      setCartItems([]);
      setCart({ ...cart, trees: [], total: 0 });
      
      // Thông báo sự thay đổi giỏ hàng cho các component khác
      AuthEvents.publish('cart-update', null);
      
      // Đóng popup checkout và hiển thị popup thành công
      setIsCheckoutOpen(false);
      setIsSuccessOpen(true);
      
    } catch (error) {
      console.error('Lỗi khi đặt hàng:', error);
      toast.error('Đặt hàng thất bại. Vui lòng thử lại sau.');
    }
  };

  const handleClosePopup = () => {
    setIsCheckoutOpen(false);
    setIsSuccessOpen(false);
  };

  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="text-sm text-gray-500">
          <a href="/" className="hover:text-green-500">Home</a> / Giỏ hàng
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        <h2 className="text-2xl text-green-500 font-medium py-4">GIỎ HÀNG</h2>
        
        {cartItems.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <p className="text-gray-500 mb-4">Giỏ hàng của bạn đang trống.</p>
            <a 
              href="/products" 
              className="inline-block px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Tiếp tục mua sắm
            </a>
          </div>
        ) : (
          <>
            <div className="w-full border-collapse">
              <div className="flex bg-green-500 text-white">
                <div className="w-24 p-3 text-center font-normal">HÌNH ẢNH</div>
                <div className="flex-grow p-3 text-left font-normal">TÊN SẢN PHẨM</div>
                <div className="w-32 p-3 text-center font-normal">ĐƠN GIÁ</div>
                <div className="w-32 p-3 text-center font-normal">SỐ LƯỢNG</div>
                <div className="w-32 p-3 text-center font-normal">THÀNH TIỀN</div>
                <div className="w-16 p-3 text-center font-normal">XÓA</div>
              </div>
              
              {cartItems.map((item) => (
                <div key={item.id} className="flex bg-white border-b">
                  <div className="w-24 p-4 text-center">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover mx-auto" />
                  </div>
                  <div className="flex-grow p-4 flex items-center">
                    <a href={`/products/${item.id}`} className="text-green-500 hover:text-green-600">{item.name}</a>
                  </div>
                  <div className="w-32 p-4 text-center flex items-center justify-center">
                    {item.price.toLocaleString()} đ
                  </div>
                  <div className="w-32 p-4 text-center flex items-center justify-center">
                    <div className="flex border border-gray-300 rounded">
                      <button 
                        className="px-2 bg-gray-100 border-r border-gray-300"
                        onClick={() => handleQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                        disabled={updatingItem === item.id}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemQuantityInputChange(e, item.id)}
                        onBlur={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                        className="w-12 h-8 text-center outline-none"
                      />
                      <button 
                        className="px-2 bg-gray-100 border-l border-gray-300"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={updatingItem === item.id}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="w-32 p-4 text-center flex items-center justify-center font-medium">
                    {(item.price * item.quantity).toLocaleString()} đ
                  </div>
                  <div className="w-16 p-4 text-center flex items-center justify-center">
                    <button 
                      className="text-gray-400 hover:text-red-500"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={deletingItem === item.id}
                    >
                      {deletingItem === item.id ? (
                        <div className="animate-spin h-5 w-5 border-2 border-red-500 border-t-transparent rounded-full"></div>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Buttons and Summary */}
            <div className="mt-6 flex justify-between">
              {/* Right side buttons */}
              <div className="flex-1"></div>
              <div className="flex gap-2">
                <button 
                  className="h-12 px-4 bg-white border border-gray-300 rounded text-gray-600 hover:bg-gray-100 flex items-center justify-center"
                  onClick={handleUpdateCart}
                >
                  CẬP NHẬT HÀNG
                </button>
                <a
                  href="/products"
                  className="h-12 px-4 bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center"
                >
                  TIẾP TỤC MUA
                </a>
              </div>
            </div>
            
            {/* Summary in bordered box */}
            <div className="mt-6 flex justify-end">
              <div className="w-96 border border-gray-200 rounded bg-white">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">TỔNG TIỀN (CHƯA THUẾ)</span>
                    <span className="text-green-500 font-medium">{subtotal.toLocaleString()} đ</span>
                  </div>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-700">THUẾ (VAT 10%)</span>
                    <span className="text-green-500 font-medium">{tax.toLocaleString()} đ</span>
                  </div>
                  
                  <div className="flex justify-between items-center bg-green-500 text-white p-3 mb-4">
                    <span className="font-medium">TỔNG PHẢI THANH TOÁN</span>
                    <span className="font-medium">{total.toLocaleString()} đ</span>
                  </div>
                  
                  <div className="flex justify-end">
                    <button 
                      onClick={handleCheckout}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      THANH TOÁN
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Popups */}
      {isCheckoutOpen && (
        <CheckoutPopup 
          formData={formData}
          total={total}
          onInputChange={handleInputChange}
          onSubmit={handleSubmitOrder}
          onClose={handleClosePopup}
        />
      )}

      {isSuccessOpen && (
        <SuccessPopup onClose={handleClosePopup} />
      )}
    </div>
  );
};

export default GreenShopCart;

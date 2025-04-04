import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCartIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import { AuthEvents } from './Header';

const CartDisplay = () => {
  const [cartItemCount, setCartItemCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  // Hàm để lấy thông tin giỏ hàng
  const fetchCartInfo = async (userId) => {
    if (!userId) {
      setCartItemCount(0);
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/orders?user_id=${userId}&status=trong giỏ hàng`);
      
      if (response.data.length > 0) {
        // Tính tổng số lượng sản phẩm trong giỏ hàng
        const itemCount = response.data[0].trees.reduce((total, item) => {
          return total + item.quantity;
        }, 0);
        
        setCartItemCount(itemCount);
      } else {
        setCartItemCount(0);
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin giỏ hàng:', error);
      setCartItemCount(0);
    }
  };

  // Kiểm tra người dùng đã đăng nhập chưa và lấy thông tin giỏ hàng
  useEffect(() => {
    const checkUserAndCart = async () => {
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setCurrentUser(userData);
          
          // Lấy thông tin giỏ hàng từ API
          await fetchCartInfo(userData.id);
        } catch (error) {
          console.error('Lỗi khi đọc thông tin người dùng:', error);
          setCurrentUser(null);
          setCartItemCount(0);
        }
      } else {
        setCurrentUser(null);
        setCartItemCount(0);
      }
    };

    checkUserAndCart();
    
    // Thiết lập interval để cập nhật số lượng sản phẩm trong giỏ hàng mỗi 30 giây
    const intervalId = setInterval(() => {
      if (currentUser) {
        fetchCartInfo(currentUser.id);
      }
    }, 30000);
    
    // Lắng nghe sự kiện auth-change từ Header
    const unsubscribe = AuthEvents.subscribe('auth-change', (userData) => {
      if (userData) {
        setCurrentUser(userData);
        fetchCartInfo(userData.id);
      } else {
        setCurrentUser(null);
        setCartItemCount(0);
      }
    });
    
    // Cleanup interval và subscription khi component unmount
    return () => {
      clearInterval(intervalId);
      unsubscribe();
    };
  }, []);
  
  // Lắng nghe sự kiện cart-update nếu có component khác cập nhật giỏ hàng
  useEffect(() => {
    const unsubscribe = AuthEvents.subscribe('cart-update', () => {
      if (currentUser) {
        fetchCartInfo(currentUser.id);
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  return (
    <Link
      to="/cart"
      className="flex items-center justify-between ml-2 text-sm hover:text-gray-400"
    >
      <div className="relative">
        <ShoppingCartIcon className="size-4 md:size-6 mr-1" />
        {cartItemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {cartItemCount > 99 ? '99+' : cartItemCount}
          </span>
        )}
      </div>
      <span className="text-sm">{cartItemCount} Sản phẩm</span>
    </Link>
  );
};

export default CartDisplay;

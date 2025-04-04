import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';

const SuccessPopup = ({ onClose }) => {
  const navigate = useNavigate();

  const handleViewOrders = () => {
    onClose();
    navigate('/order-history');
  };

  const handleContinueShopping = () => {
    onClose();
    navigate('/products');
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md text-center">
        <div className="text-green-500 mb-4">
          <CheckCircleIcon className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Đặt hàng thành công!</h3>
        <p className="text-gray-600 mb-6">
          Cảm ơn quý khách đã mua hàng tại Green Shop. Đơn hàng của quý khách sẽ được xử lý trong thời gian sớm nhất.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button
            onClick={handleContinueShopping}
            className="px-4 py-2 border border-green-500 text-green-500 rounded hover:bg-green-50"
          >
            TIẾP TỤC MUA SẮM
          </button>
          <button
            onClick={handleViewOrders}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            XEM ĐƠN HÀNG
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPopup;

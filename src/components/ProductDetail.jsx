import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  StarIcon, MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon
} from '@heroicons/react/24/solid';
import { HeartIcon } from '@heroicons/react/24/outline';
import ReviewForm from './ReviewForm';
import axios from "axios";
import { toast } from 'react-toastify';
import { AuthEvents } from './Header';

export default function ProductDetail() {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("info");
  const [mainImage, setMainImage] = useState("/api/placeholder/400/400");
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const { id } = useParams();

  // Kiểm tra người dùng đã đăng nhập chưa
  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setCurrentUser(userData);
      } catch (error) {
        console.error('Lỗi khi đọc thông tin người dùng:', error);
      }
    }
  }, []);

  // Lấy thông tin sản phẩm
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/trees/${id}`);
        setProduct(response.data);
        setMainImage(response.data.image[0]);
      } catch (err) {
        setError("Không tìm thấy sản phẩm");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    // Kiểm tra đăng nhập
    if (!currentUser) {
      // Lưu thông tin sản phẩm hiện tại để sau khi đăng nhập có thể quay lại
      sessionStorage.setItem('lastViewedProduct', JSON.stringify({
        id: product.id,
        quantity: quantity
      }));

      toast.info("Vui lòng đăng nhập để mua hàng");
      navigate('/login');
      return;
    }

    setAddingToCart(true);

    try {
      // Kiểm tra xem đã có giỏ hàng cho người dùng chưa
      const cartResponse = await axios.get(`http://localhost:5000/orders?user_id=${currentUser.id}&status=trong giỏ hàng`);

      let cartId;
      let currentCart;

      if (cartResponse.data.length === 0) {
        // Nếu chưa có giỏ hàng, tạo mới
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
        cartId = createResponse.data.id;
        currentCart = createResponse.data;
      } else {
        // Nếu đã có giỏ hàng, lấy giỏ hàng đầu tiên
        currentCart = cartResponse.data[0];
        cartId = currentCart.id;
      }

      // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
      const existingProductIndex = currentCart.trees.findIndex(
        item => item.id === product.id
      );

      let updatedTrees = [...currentCart.trees];
      let updatedTotal = currentCart.total;

      if (existingProductIndex >= 0) {
        // Nếu sản phẩm đã có trong giỏ hàng, cập nhật số lượng
        updatedTrees[existingProductIndex].quantity += quantity;
      } else {
        // Nếu sản phẩm chưa có trong giỏ hàng, thêm mới
        updatedTrees.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image[0],
          quantity: quantity
        });
      }

      // Tính lại tổng tiền
      updatedTotal = updatedTrees.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // Cập nhật giỏ hàng
      await axios.patch(`http://localhost:5000/orders/${cartId}`, {
        trees: updatedTrees,
        total: updatedTotal
      });

      toast.success("Đã thêm sản phẩm vào giỏ hàng!");
      AuthEvents.publish('cart-update', null);
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      toast.error("Có lỗi xảy ra khi thêm vào giỏ hàng");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSubmitReview = async (newReview) => {
    if (!product) return;

    const updatedRatings = [newReview, ...product.ratings];

    setProduct({ ...product, ratings: updatedRatings });
    setActiveTab("reviews");

    try {
      await axios.patch(`http://localhost:5000/trees/${product.id}`, {
        ratings: updatedRatings,
      });
      console.log("Cập nhật rating thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật rating:", error);
    }
  };

  const handleInputChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  const handleQuantityChange = (type) => {
    if (type === 'increase') {
      setQuantity(prev => prev + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const renderStars = (count) => {
    return Array(count)
      .fill(0)
      .map((_, index) => <StarIcon key={index} className="h-4 w-4" />);
  };

  if (loading) {
    return <div className="text-center py-10">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (!product) {
    return <div className="text-center py-10">Không tìm thấy sản phẩm</div>;
  }

  return (
    <main className="container mx-auto px-4 py-4">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/2 p-4">
          <div className="border p-4 mb-4">
            <img src={mainImage} alt={product.name} className="w-full h-auto" />
          </div>
          <div className="flex space-x-2 overflow-x-auto">
            {product.image.map((thumb, index) => (
              <div
                key={index}
                className="border p-2 w-20 h-20 cursor-pointer"
                onClick={() => setMainImage(thumb)}
              >
                <img
                  src={thumb}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="md:w-1/2 p-4">
          <h1 className="text-2xl font-semibold mb-2">{product.name}</h1>

          <div className="flex text-yellow-400 mb-2">
            {renderStars(product.ratings?.[0]?.rating || 5)}
          </div>

          <div className="mb-4">
            <span className="text-red-500 text-xl font-bold">
              ₫ {product.price.toLocaleString()}
            </span>
            <span className="text-gray-500 line-through ml-2">
              ₫ {product.old_price.toLocaleString()}
            </span>
          </div>

          <div className="text-gray-700 mb-4">
            <p>{product.description}</p>
          </div>

          <div className="flex items-center mb-4">
            <label className="mr-2">Số lượng:</label>
            <div className="flex border">
              <button
                className="px-3 py-1 bg-gray-100 border-r"
                onClick={() => handleQuantityChange("decrease")}
              >
                -
              </button>
              <input
                type="text"
                value={quantity}
                onChange={handleInputChange}
                className="w-12 text-center py-1"
              />
              <button
                className="px-3 py-1 bg-gray-100 border-l"
                onClick={() => handleQuantityChange("increase")}
              >
                +
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <button
              className={`bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded flex items-center ${addingToCart ? 'opacity-70 cursor-not-allowed' : ''}`}
              onClick={handleAddToCart}
              disabled={addingToCart}
            >
              {addingToCart ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  ĐANG XỬ LÝ...
                </>
              ) : 'MUA NGAY'}
            </button>
            <button className="bg-white border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
            <button className="bg-white border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded">
              <HeartIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href="#"
              className="bg-blue-600 text-white px-2 py-1 text-xs rounded flex items-center"
            >
              <span className="mr-1">F</span> Share
            </a>
            <a
              href="#"
              className="bg-blue-400 text-white px-2 py-1 text-xs rounded flex items-center"
            >
              <span className="mr-1">T</span> Tweet
            </a>
            <a
              href="#"
              className="bg-red-600 text-white px-2 py-1 text-xs rounded flex items-center"
            >
              <span className="mr-1">P</span> Pin
            </a>
            <a
              href="#"
              className="bg-orange-500 text-white px-2 py-1 text-xs rounded flex items-center"
            >
              <span className="mr-1">R</span> Reddit
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t pt-6">
        <div className="flex border-b">
          <button
            className={`px-4 py-2 ${activeTab === 'info' ? 'border-b-2 border-green-500 text-green-500 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('info')}
          >
            THÔNG TIN SẢN PHẨM
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'reviews' ? 'border-b-2 border-green-500 text-green-500 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('reviews')}
          >
            KHÁCH HÀNG ĐÁNH GIÁ
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'tags' ? 'border-b-2 border-green-500 text-green-500 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('tags')}
          >
            THẺ - TAG
          </button>
        </div>

        {activeTab === "info" && (
          <div className="py-4">
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>Tên khoa học:</strong> {product.science_name}
              </p>
              <p>
                <strong>Họ thực vật:</strong> {product.information.family}
              </p>
              <p>
                <strong>Chiều cao:</strong> {product.information.height}
              </p>
              <p>{product.information.full_description}</p>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="py-4">
            <ReviewForm
              productId={product.id}
              onSubmitReview={handleSubmitReview}
            />

            {product.ratings.length > 0 ? (
              product.ratings.map((review, index) => (
                <div key={index} className="mb-4 border-b pb-4">
                  <p><strong>{review.username || review.user_id}</strong></p>
                  <div className="flex text-yellow-400">{renderStars(review.rating)}</div>
                  <p>{review.content}</p>
                  <p className="text-gray-500 text-sm">
                    {new Date(review.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">
                Chưa có đánh giá nào cho sản phẩm này.
              </p>
            )}
          </div>
        )}

        {activeTab === "tags" && (
          <div className="py-4">
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag, index) => (
                <a
                  key={index}
                  href="#"
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-200"
                >
                  {tag}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

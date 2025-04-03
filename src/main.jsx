import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { Provider } from "react-redux";
import { store } from "./store";
import "./index.css";
import App from "./App.jsx";
import ProductDetail from "./components/ProductDetail.jsx";
import RegistrationPage from "./components/RegistrationPage.jsx";
import LoginPage from "./components/LoginPage.jsx";
import GreenShopCart from "./components/GreenShopCart.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProductList from "./pages/ProductList.jsx";
import RequestPlant from "./pages/RequestPlant.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Statistics from "./pages/Statistics.jsx";
import UserList from "./pages/UserList.jsx";
import OrderList from "./pages/OrderList.jsx";
import CategoryList from "./pages/CategoryList.jsx";
import HistoryOrder from "./pages/HistoryOrder.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Dashboard />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<GreenShopCart />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/request-plant" element={<RequestPlant />} />
            <Route path="/order-history" element={<HistoryOrder />} />
          </Route>
          <Route path="/admin" element={<AdminDashboard />}>
            <Route index element={<Statistics />} />
            <Route path="/admin/users" element={<UserList />} />
            <Route path="/admin/orders" element={<OrderList />} />
            <Route path="/admin/categories" element={<CategoryList />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);

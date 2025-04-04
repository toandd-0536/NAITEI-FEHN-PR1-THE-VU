import { Outlet } from "react-router";
import Footer from "./components/Footer";
import Header from "./components/Header";
import WelcomePopup from "./components/WelcomePopup";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Header />
      <Outlet />
      <Footer />
      <WelcomePopup />
    </>
  );
}

export default App;

import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col noise-overlay">
      <Navbar />
      <main className="flex-1 pt-16 relative z-10 watermark-bg">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

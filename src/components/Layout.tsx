import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingNotes from './FloatingNotes';
import AdminPanel from './AdminPanel';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col noise-overlay">
      <FloatingNotes />
      <Navbar />
      <main className="flex-1 pt-16 relative z-10 watermark-bg">
        <Outlet />
      </main>
      <AdminPanel />
      <Footer />
    </div>
  );
};

export default Layout;

import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingNotes from './FloatingNotes';
import AdminPanel from './AdminPanel';
import DeviceRotationHint from './DeviceRotationHint';
import ExperienceBanner from './ExperienceBanner';

const Layout = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col noise-overlay">
      <ExperienceBanner />
      {!isLoginPage && <FloatingNotes />}
      {!isLoginPage && <Navbar />}
      <main className={`flex-1 ${isLoginPage ? 'pt-0' : 'pt-16'} relative z-10 watermark-bg`}>
        <Outlet />
      </main>
      {!isLoginPage && <AdminPanel />}
      <DeviceRotationHint />
      {!isLoginPage && <Footer />}
    </div>
  );
};

export default Layout;

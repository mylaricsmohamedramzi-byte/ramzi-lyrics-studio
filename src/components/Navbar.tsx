import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLang } from '@/contexts/LangContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Menu, X, Sun, Moon, Globe } from 'lucide-react';
import logoDark from '@/assets/logo-dark.png';
import logoLight from '@/assets/logo-light.png';

const navItems = [
  { path: '/', en: 'Home', ar: 'الرئيسية' },
  { path: '/videos', en: 'Videos', ar: 'فيديوهات' },
  { path: '/songs', en: 'Songs', ar: 'أغاني' },
  { path: '/melodies', en: 'Melodies', ar: 'ألحان' },
  { path: '/lyrics', en: 'Lyrics', ar: 'كلمات' },
  { path: '/songwriting-art', en: 'Songwriting Art', ar: 'فن كتابة الأغاني' },
  { path: '/copyright', en: 'Copyright', ar: 'حقوق الملكية' },
  { path: '/login', en: 'Login', ar: 'تسجيل الدخول' },
];

const Navbar = () => {
  const { t, toggleLang, lang } = useLang();
  const { isDark, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/90 border-b border-border/50 transition-colors duration-400">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <img
            src={isDark ? logoDark : logoLight}
            alt="Mohamed Ramzi"
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-2 text-sm rounded-md transition-all duration-200 hover:bg-primary/10 hover:text-primary ${
                location.pathname === item.path
                  ? 'text-primary font-semibold bg-primary/5'
                  : 'text-foreground/70'
              }`}
            >
              {t(item.en, item.ar)}
            </Link>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLang}
            className="p-2 rounded-md hover:bg-muted transition-colors text-foreground/70 hover:text-foreground"
            aria-label="Toggle language"
          >
            <Globe className="w-4 h-4" />
            <span className="text-xs ml-1 hidden sm:inline">{lang === 'en' ? 'عربي' : 'EN'}</span>
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-muted transition-colors text-foreground/70 hover:text-foreground"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors text-foreground/70"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`px-4 py-3 rounded-md transition-all duration-200 hover:bg-primary/10 ${
                  location.pathname === item.path
                    ? 'text-primary font-semibold bg-primary/5'
                    : 'text-foreground/70'
                }`}
              >
                {t(item.en, item.ar)}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

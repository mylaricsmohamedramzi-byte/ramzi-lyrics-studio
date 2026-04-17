import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLang } from '@/contexts/LangContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Menu, X, Sun, Moon, Globe } from 'lucide-react';
import logoDark from '@/assets/navbar-logo-dark.png';
import logoLight from '@/assets/navbar-logo-light.png';

const navItems = [
  { path: '/home', en: 'Home', ar: 'الرئيسية' },
  { path: '/videos', en: 'Videos', ar: 'فيديوهات' },
  { path: '/songs', en: 'Songs', ar: 'أغاني' },
  { path: '/melodies', en: 'Melodies', ar: 'ألحان' },
  { path: '/lyrics', en: 'Lyrics', ar: 'كلمات' },
  { path: '/songwriting-art', en: 'Songwriting Art', ar: 'فن كتابة الأغاني' },
  { path: '/copyright', en: 'Copyright', ar: 'حقوق الملكية' },
  { path: '/', en: 'Login', ar: 'تسجيل الدخول' },
];

const Navbar = () => {
  const { t, toggleLang, lang } = useLang();
  const { isDark, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navBg = isDark ? 'bg-background/90 border-border/50' : 'bg-black/95 border-white/10';
  const navText = isDark ? 'text-foreground/70' : 'text-white/80';
  const navTextActive = isDark ? 'text-primary bg-primary/5' : 'text-[#c9a84c] bg-white/5';
  const navHover = isDark ? 'hover:bg-primary/10 hover:text-primary' : 'hover:bg-white/10 hover:text-[#c9a84c]';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl ${navBg} border-b transition-colors duration-400`}>
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
              className={`px-3 py-2 text-sm rounded-md transition-all duration-200 ${navHover} ${
                location.pathname === item.path
                  ? `font-semibold ${navTextActive}`
                  : navText
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
            className={`p-2 rounded-md hover:bg-white/10 transition-colors ${navText} hover:text-[#c9a84c]`}
            aria-label="Toggle language"
          >
            <Globe className="w-4 h-4" />
            <span className="text-xs ml-1 hidden sm:inline">{lang === 'en' ? 'عربي' : 'EN'}</span>
          </button>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-md hover:bg-white/10 transition-colors ${navText} hover:text-[#c9a84c]`}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden p-2 rounded-md hover:bg-white/10 transition-colors ${navText}`}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className={`lg:hidden border-t ${isDark ? 'border-border/50 bg-background/95' : 'border-white/10 bg-black/95'} backdrop-blur-xl`}>
          <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`px-4 py-3 rounded-md transition-all duration-200 ${navHover} ${
                  location.pathname === item.path
                    ? `font-semibold ${navTextActive}`
                    : navText
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

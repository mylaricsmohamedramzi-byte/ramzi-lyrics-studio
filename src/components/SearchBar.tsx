import { Search, X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Unified search bar used across Songs / Melodies / Videos / Lyrics.
 * - Text color: white in dark mode, black in light mode
 * - Border turns red on hover/focus
 * - Diacritic-insensitive matching is handled by the consumer via
 *   `normalizeArabic()` from `@/lib/arabic`.
 */
const SearchBar = ({ value, onChange, placeholder, className = '' }: SearchBarProps) => {
  const { isDark } = useTheme();

  return (
    <div className={`max-w-md mx-auto w-full ${className}`}>
      <div className="relative group">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors"
          style={{ color: isDark ? '#ffffff99' : '#00000099' }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          dir="auto"
          className="unified-search w-full pl-11 pr-10 py-3 rounded-full border outline-none transition-colors duration-200"
          style={{
            background: isDark ? 'rgba(20,5,8,0.7)' : 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(12px)',
            color: isDark ? '#ffffff' : '#000000',
            borderColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)',
          }}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-red-500/20 transition-colors"
            style={{ color: isDark ? '#ffffff' : '#000000' }}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;

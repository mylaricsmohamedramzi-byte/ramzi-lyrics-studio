import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Plus, X, Save, Edit, Trash2, Shield, AlertTriangle } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLang } from '@/contexts/LangContext';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

// Type definitions
interface LyricLine {
  text: string;
  red: boolean;
}

export default function AdminPanel() {
  const { isDark } = useTheme();
  const { lang, t } = useLang();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(localStorage.getItem('isAdmin') === 'true');
  }, [location.pathname]);

  if (!isAdmin) return null;

  // Render context based on path
  const currentSection = location.pathname.includes('songs') ? 'songs' :
                         location.pathname.includes('melodies') ? 'melodies' :
                         location.pathname.includes('videos') ? 'videos' : null;

  if (!currentSection) return null;

  return (
    <>
      {/* Floating Admin Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center border-2 border-[#c9a84c] text-[#c9a84c]"
        style={{
          background: isDark ? 'rgba(20, 5, 8, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Shield className="w-6 h-6" />
      </motion.button>

      {/* Main Admin GUI Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border"
              style={{
                background: isDark ? 'rgba(20, 5, 8, 0.95)' : 'rgba(250, 245, 240, 0.95)',
                borderColor: 'rgba(201, 168, 76, 0.4)',
                direction: lang === 'ar' ? 'rtl' : 'ltr'
              }}
            >
              <div className="sticky top-0 z-10 flex justify-between items-center p-6 border-b"
                   style={{ borderColor: 'rgba(201, 168, 76, 0.2)', background: isDark ? 'rgba(20, 5, 8, 0.9)' : 'rgba(250, 245, 240, 0.9)' }}>
                <h2 className="text-2xl font-bold text-[#c9a84c] font-subheading flex items-center gap-3">
                  <Settings className="w-6 h-6" />
                  {t('Admin Dashboard', 'لوحة تحكم المسؤول')} - {currentSection}
                </h2>
                <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-black/10 text-[#c9a84c]">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <AdminForm section={currentSection} lang={lang} t={t} isDark={isDark} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Separate form component to manage state
function AdminForm({ section, lang, t, isDark }: any) {
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
  const [formData, setFormData] = useState<any>({
    title_ar: '', title_en: '', category: '', audio_url: '', cover_url: '', raw_lyrics: ''
  });
  const [lyricsLines, setLyricsLines] = useState<LyricLine[]>([]);

  // Update lyricsLines when raw_lyrics changes
  const handleRawLyricsChange = (text: string) => {
    setFormData({ ...formData, raw_lyrics: text });
    const lines = text.split('\n');
    setLyricsLines(lines.map(line => ({ text: line, red: false })));
  };

  const toggleRedLine = (index: number) => {
    const updated = [...lyricsLines];
    updated[index].red = !updated[index].red;
    setLyricsLines(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from(section).insert({
        title_ar: formData.title_ar,
        title_en: formData.title_en,
        category: formData.category,
        audio_url: formData.audio_url,
        cover_url: formData.cover_url,
        lyrics: lyricsLines, // Saves the Red Line Logic formatting as JSON
        created_at: new Date().toISOString()
      });

      if (error) throw error;

      toast.success(t('Content saved to database!', 'تم حفظ المحتوى في قاعدة البيانات!'));
      setMode('list');
      setFormData({ title_ar: '', title_en: '', category: '', audio_url: '', cover_url: '', raw_lyrics: '' });
      setLyricsLines([]);
    } catch (err: any) {
      toast.error(err.message || t('Error saving content', 'حدث خطأ أثناء الحفظ'));
    }
  };

  if (mode === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-foreground">
            {t('Manage Content', 'إدارة المحتوى')}
          </h3>
          <button
            onClick={() => setMode('add')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c9a84c] text-black font-bold hover:bg-[#d4b563] transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t('Add New', 'إضافة جديد')}
          </button>
        </div>
        
        {/* Placeholder for fetching items from DB */}
        <div className="p-8 text-center border-2 border-dashed rounded-2xl opacity-60" style={{ borderColor: '#c9a84c' }}>
          <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-[#c9a84c]" />
          <p>{t('Supabase Real-time connection pending. Showing mock list.', 'لم يتم ربط قاعدة البيانات بعد. يتم عرض قائمة تجريبية.')}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-[#c9a84c]">
          {mode === 'add' ? t('Add Content', 'إضافة محتوى') : t('Edit Content', 'تعديل المحتوى')}
        </h3>
        <button
          type="button"
          onClick={() => setMode('list')}
          className="px-4 py-2 rounded-xl text-foreground/60 hover:bg-black/10"
        >
          {t('Cancel', 'إلغاء')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-foreground/80 mb-2">{t('Title (Arabic)', 'العنوان (عربي)')}</label>
            <input type="text" required value={formData.title_ar} onChange={e => setFormData({...formData, title_ar: e.target.value})}
                   className="w-full p-3 rounded-xl bg-black/10 border border-[#c9a84c]/30 text-foreground focus:ring-1 focus:ring-[#c9a84c] outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-foreground/80 mb-2">{t('Title (English)', 'العنوان (إنجليزي)')}</label>
            <input type="text" required value={formData.title_en} onChange={e => setFormData({...formData, title_en: e.target.value})}
                   className="w-full p-3 rounded-xl bg-black/10 border border-[#c9a84c]/30 text-foreground focus:ring-1 focus:ring-[#c9a84c] outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-foreground/80 mb-2">{t('Category', 'التصنيف')}</label>
            <input type="text" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                   className="w-full p-3 rounded-xl bg-black/10 border border-[#c9a84c]/30 text-foreground focus:ring-1 focus:ring-[#c9a84c] outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-foreground/80 mb-2">{t('Audio/Video URL', 'رابط الصوت/الفيديو')}</label>
            <input type="url" value={formData.audio_url} onChange={e => setFormData({...formData, audio_url: e.target.value})}
                   className="w-full p-3 rounded-xl bg-black/10 border border-[#c9a84c]/30 text-foreground focus:ring-1 focus:ring-[#c9a84c] outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-foreground/80 mb-2">{t('Cover Image URL', 'رابط الغلاف')}</label>
            <input type="url" value={formData.cover_url} onChange={e => setFormData({...formData, cover_url: e.target.value})}
                   className="w-full p-3 rounded-xl bg-black/10 border border-[#c9a84c]/30 text-foreground focus:ring-1 focus:ring-[#c9a84c] outline-none" />
          </div>
        </div>

        {/* Advanced Lyrics Editor */}
        <div className="space-y-4 flex flex-col h-full">
          <div>
            <label className="block text-sm font-bold text-foreground/80 mb-2">
              {t('Raw Lyrics (Paste here)', 'الكلمات (ألصق هنا)')}
            </label>
            <textarea
              rows={4}
              value={formData.raw_lyrics}
              onChange={(e) => handleRawLyricsChange(e.target.value)}
              placeholder={t('Paste lyrics, one line per row...', 'ألصق الكلمات هنا، كل جملة في سطر...')}
              className="w-full p-3 rounded-xl bg-black/10 border border-[#c9a84c]/30 text-foreground focus:ring-1 focus:ring-[#c9a84c] outline-none resize-none"
            />
          </div>

          <div className="flex-1 flex flex-col min-h-[250px] border border-[#c9a84c]/30 rounded-xl overflow-hidden bg-black/5">
            <div className="p-3 bg-black/10 border-b border-[#c9a84c]/20">
              <span className="text-xs font-bold text-foreground/60 uppercase tracking-widest">
                {t('Red Line Logic Editor', 'محرر الخط الأحمر للكلمات')}
              </span>
            </div>
            <div className="flex-1 p-3 overflow-y-auto space-y-2 max-h-[300px] custom-scrollbar">
              {lyricsLines.length === 0 ? (
                <p className="text-center text-foreground/40 text-sm mt-10">
                  {t('No lyrics entered yet.', 'لم يتم إدخال كلمات بعد.')}
                </p>
              ) : (
                lyricsLines.map((line, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group">
                    <button
                      type="button"
                      onClick={() => toggleRedLine(index)}
                      className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                        line.red ? 'bg-red-500 border-red-500' : 'border-gray-500 group-hover:border-[#c9a84c]'
                      }`}
                    >
                      {line.red && <span className="w-2 h-2 bg-white rounded-full" />}
                    </button>
                    <span className={`text-sm truncate ${line.red ? 'text-red-500 font-bold' : 'text-foreground/80'}`}>
                      {line.text || '\u00A0'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-[#c9a84c]/20 flex justify-end">
        <button
          type="submit"
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#c9a84c] text-black font-bold text-lg hover:bg-[#d4b563] shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          <Save className="w-5 h-5" />
          {t('Save to Database', 'حفظ في قاعدة البيانات')}
        </button>
      </div>
    </form>
  );
}

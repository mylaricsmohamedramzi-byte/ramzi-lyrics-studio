import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '@/contexts/LangContext';
import { saveGuestProfile } from '@/lib/guestAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function GuestNameDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 60) {
      setError(t('Enter a name between 1 and 60 characters.', 'اكتب اسمًا من حرف إلى ٦٠ حرفًا.'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      let { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!data.session) {
        const signedIn = await supabase.auth.signInAnonymously();
        if (signedIn.error) throw signedIn.error;
        data = { session: signedIn.data.session, user: signedIn.data.user } as typeof data;
      }
      const userId = data.session?.user.id;
      if (!userId) throw new Error('Guest session was not created.');
      await saveGuestProfile(userId, trimmed);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('isGuest', 'true');
      localStorage.removeItem('isAdmin');
      onClose();
      navigate('/home');
      toast.success(t('Welcome to the gallery!', 'أهلاً بك في الموقع!'));
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : String(submitError);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5 rounded-2xl border border-primary/40 bg-background p-6 shadow-2xl" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div>
          <h2 className="text-xl font-bold text-foreground">{t('Choose a display name', 'اختر اسم العرض')}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t('Your name will appear beside your comments.', 'سيظهر اسمك بجانب تعليقاتك.')}</p>
        </div>
        <input
          autoFocus
          required
          maxLength={60}
          minLength={1}
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary"
          placeholder={t('Display name', 'اسم العرض')}
        />
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-foreground">{t('Cancel', 'إلغاء')}</button>
          <button type="submit" disabled={loading} className="rounded-lg bg-primary px-5 py-2 font-semibold text-primary-foreground disabled:opacity-60">{loading ? t('Please wait…', 'يرجى الانتظار…') : t('Continue', 'متابعة')}</button>
        </div>
      </form>
    </div>
  );
}
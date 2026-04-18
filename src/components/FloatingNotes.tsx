const NOTES = ['♩', '♪', '♫', '♬', '𝄞', '𝄢', '♭', '♮'];

/**
 * Decorative animated musical notes floating up the page.
 * Rendered fixed behind page content (z-0, pointer-events-none).
 */
const FloatingNotes = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    >
      {NOTES.map((note, i) => {
        const left = (i * 13 + 7) % 95;
        const size = 22 + ((i * 7) % 28);
        const duration = 8 + ((i * 3) % 9);
        const delay = (i * 1.3) % 6;
        return (
          <span
            key={i}
            className="absolute text-primary/15 dark:text-accent/20 select-none font-heading"
            style={{
              left: `${left}%`,
              top: '110%',
              fontSize: `${size}px`,
              animation: `floatNote ${duration}s linear infinite`,
              animationDelay: `${delay}s`,
            }}
          >
            {note}
          </span>
        );
      })}
    </div>
  );
};

export default FloatingNotes;

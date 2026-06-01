/**
 * Reusable Scroll Sense brand mark.
 * variant: 'light' renders a white rounded square (for dark backgrounds),
 *          'dark'  renders a dark rounded square (for light backgrounds / nav).
 * size controls the icon square in px; the wordmark scales alongside it.
 */
const Logo = ({ variant = 'dark', size = 28, showText = true }) => {
  const isLight = variant === 'light';
  const squareBg = isLight ? '#FAF8F5' : '#141210';
  const markStroke = isLight ? '#141210' : '#FAF8F5';
  const radius = Math.round(size * 0.28);

  return (
    <div className="brand-logo">
      <span
        className="logo-mark"
        style={{
          width: size,
          height: size,
          backgroundColor: squareBg,
          borderRadius: radius,
        }}
      >
        {/* Sunrise / arch over a horizon line */}
        <svg
          width={Math.round(size * 0.62)}
          height={Math.round(size * 0.62)}
          viewBox="0 0 24 24"
          fill="none"
          stroke={markStroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 16a8 8 0 0 1 16 0" />
          <path d="M2 20h20" />
          <path d="M12 4v2" />
          <path d="M5 9l1.2 1.2" />
          <path d="M19 9l-1.2 1.2" />
        </svg>
      </span>
      {showText && (
        <span className="brand-text" style={{ color: isLight ? 'var(--color-text-light)' : 'var(--color-text-dark)' }}>
          Scroll Sense
        </span>
      )}
    </div>
  );
};

export default Logo;

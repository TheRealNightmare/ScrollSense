const SocialButton = ({ icon, text, onClick, variant = 'light' }) => {
  return (
    <button
      onClick={onClick}
      className={`social-btn ${variant === 'dark' ? 'social-btn--dark' : ''}`}
      type="button"
    >
      {icon}
      <span>{text}</span>
    </button>
  );
};

export default SocialButton;

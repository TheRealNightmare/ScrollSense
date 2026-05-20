import React from 'react';

const SocialButton = ({ icon, text, onClick }) => {
  return (
    <button onClick={onClick} className="social-btn">
      {icon}
      <span>{text}</span>
    </button>
  );
};

export default SocialButton;
import React from 'react';

interface HamsterSVGProps {
  mood?: 'normal' | 'sick' | 'victory';
  className?: string;
}

export const HamsterSVG: React.FC<HamsterSVGProps> = ({ mood = 'normal', className = 'w-full h-full' }) => {
  if (mood === 'sick') {
    return (
      <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="52" cy="40" r="16" fill="#88d49e" stroke="#111111" strokeWidth="1.8" />
        <circle cx="148" cy="40" r="16" fill="#88d49e" stroke="#111111" strokeWidth="1.8" />
        <circle cx="52" cy="40" r="8" fill="#52b788" />
        <circle cx="148" cy="40" r="8" fill="#52b788" />
        
        {/* Main Body */}
        <path
          d="M 45,75 C 30,105 32,155 100,165 C 168,155 170,105 155,75 C 145,40 120,30 100,30 C 80,30 55,40 45,75 Z"
          fill="#88d49e"
          stroke="#111111"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        {/* Belly */}
        <path
          d="M 42,95 C 28,115 32,158 100,162 C 168,158 172,115 158,95 C 140,75 125,72 100,72 C 75,72 60,75 42,95 Z"
          fill="#d8f3dc"
          stroke="#111111"
          strokeWidth="1.8"
        />
        {/* Dizzy X Eyes */}
        <path d="M 62,78 L 74,90 M 74,78 L 62,90" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 126,78 L 138,90 M 138,78 L 126,90" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
        {/* Sad Queasy Mouth */}
        <path d="M 85,108 Q 100,95 115,108" stroke="#111111" strokeWidth="2" fill="none" strokeLinecap="round" />
        
        {/* Sick droop paws */}
        <ellipse cx="80" cy="118" rx="7" ry="10" fill="#d8f3dc" stroke="#111111" strokeWidth="1.8" />
        <ellipse cx="120" cy="118" rx="7" ry="10" fill="#d8f3dc" stroke="#111111" strokeWidth="1.8" />
        <ellipse cx="65" cy="168" rx="11" ry="5" fill="#d8f3dc" stroke="#111111" strokeWidth="1.8" />
        <ellipse cx="135" cy="168" rx="11" ry="5" fill="#d8f3dc" stroke="#111111" strokeWidth="1.8" />

        <text x="32" y="55" fontSize="22">💫</text>
        <text x="144" y="55" fontSize="22">🤢</text>
      </svg>
    );
  }

  if (mood === 'victory') {
    return (
      <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="45" cy="40" r="18" fill="#f39c12" stroke="#111111" strokeWidth="1.8" />
        <circle cx="155" cy="40" r="18" fill="#f39c12" stroke="#111111" strokeWidth="1.8" />
        <circle cx="45" cy="40" r="9" fill="#e67e22" />
        <circle cx="155" cy="40" r="9" fill="#e67e22" />

        <path
          d="M 35,70 C 15,105 15,170 100,175 C 185,170 185,105 165,70 C 145,35 120,25 100,25 C 80,25 55,35 35,70 Z"
          fill="#f39c12"
          stroke="#111111"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M 32,95 C 15,120 18,172 100,172 C 182,172 185,120 168,95 C 145,70 125,65 100,65 C 75,65 55,70 32,95 Z"
          fill="#ffffff"
          stroke="#111111"
          strokeWidth="1.8"
        />
        {/* Happy Curved Eyes */}
        <path d="M 60,82 Q 70,70 80,82" stroke="#111111" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M 120,82 Q 130,70 140,82" stroke="#111111" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Big Pink Cheeks */}
        <circle cx="53" cy="95" r="14" fill="#ff85a1" opacity="0.8" />
        <circle cx="147" cy="95" r="14" fill="#ff85a1" opacity="0.8" />
        {/* Open Smile */}
        <path d="M 85,98 Q 100,122 115,98 Z" fill="#e63946" stroke="#111111" strokeWidth="1.8" />

        {/* Paws */}
        <ellipse cx="76" cy="116" rx="8" ry="11" fill="#ffffff" stroke="#111111" strokeWidth="1.8" />
        <ellipse cx="124" cy="116" rx="8" ry="11" fill="#ffffff" stroke="#111111" strokeWidth="1.8" />
        <ellipse cx="62" cy="172" rx="12" ry="6" fill="#ffffff" stroke="#111111" strokeWidth="1.8" />
        <ellipse cx="138" cy="172" rx="12" ry="6" fill="#ffffff" stroke="#111111" strokeWidth="1.8" />

        <text x="24" y="45" fontSize="22">✨</text>
        <text x="148" y="45" fontSize="22">🎉</text>
      </svg>
    );
  }

  // Normal cute hamster
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="52" cy="40" r="16" fill="#f39c12" stroke="#111111" strokeWidth="1.8" />
      <circle cx="148" cy="40" r="16" fill="#f39c12" stroke="#111111" strokeWidth="1.8" />
      <circle cx="52" cy="40" r="8" fill="#e67e22" />
      <circle cx="148" cy="40" r="8" fill="#e67e22" />

      {/* Main Body */}
      <path
        d="M 45,75 C 30,105 32,155 100,165 C 168,155 170,105 155,75 C 145,40 120,30 100,30 C 80,30 55,40 45,75 Z"
        fill="#f39c12"
        stroke="#111111"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Belly Area */}
      <path
        d="M 42,95 C 28,115 32,158 100,162 C 168,158 172,115 158,95 C 140,75 125,72 100,72 C 75,72 60,75 42,95 Z"
        fill="#ffffff"
        stroke="#111111"
        strokeWidth="1.8"
      />

      {/* Eyes */}
      <circle cx="68" cy="85" r="6" fill="#111111" />
      <circle cx="132" cy="85" r="6" fill="#111111" />
      <circle cx="66" cy="83" r="2" fill="#ffffff" />
      <circle cx="130" cy="83" r="2" fill="#ffffff" />

      {/* Cheeks */}
      <circle cx="56" cy="95" r="8" fill="#ffb4a2" opacity="0.75" />
      <circle cx="144" cy="95" r="8" fill="#ffb4a2" opacity="0.75" />

      {/* Mouth */}
      <path
        d="M 88,96 C 92,103 98,103 100,98 C 102,103 108,103 112,96"
        stroke="#111111"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />

      {/* Paws */}
      <ellipse cx="80" cy="118" rx="7" ry="10" fill="#ffffff" stroke="#111111" strokeWidth="1.8" />
      <ellipse cx="120" cy="118" rx="7" ry="10" fill="#ffffff" stroke="#111111" strokeWidth="1.8" />
      <ellipse cx="65" cy="168" rx="11" ry="5" fill="#ffffff" stroke="#111111" strokeWidth="1.8" />
      <ellipse cx="135" cy="168" rx="11" ry="5" fill="#ffffff" stroke="#111111" strokeWidth="1.8" />
    </svg>
  );
};

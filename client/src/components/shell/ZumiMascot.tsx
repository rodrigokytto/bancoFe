import React from "react";

interface ZumiProps {
  size?: number;
  className?: string;
}

export const ZumiMascot: React.FC<ZumiProps> = ({ size = 40, className = "" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Zumi, o mascote do Zuma"
      className={`inline-block shrink-0 ${className}`}
    >
      {/* Corpo do salmão */}
      <ellipse cx="30" cy="34" rx="24" ry="17" fill="#E8613A" />
      {/* Cauda */}
      <path d="M50 34 L63 22 L60 34 L63 46 Z" fill="#C94E2A" />
      {/* Listras de gordura do salmão fresco */}
      <path d="M14 26 Q30 22 46 26" stroke="#FFFFFF" strokeWidth="2.4" fill="none" opacity="0.9" />
      <path d="M12 34 Q30 30 48 34" stroke="#FFFFFF" strokeWidth="2.4" fill="none" opacity="0.9" />
      <path d="M14 42 Q30 39 46 42" stroke="#FFFFFF" strokeWidth="2.4" fill="none" opacity="0.9" />
      {/* Faixa ninja (headband) */}
      <rect x="7" y="24" width="38" height="8" rx="3" fill="#17181C" />
      <path d="M8 27 L1 21 M8 29 L0 31" stroke="#17181C" strokeWidth="3" strokeLinecap="round" />
      {/* Olhos expressivos */}
      <circle cx="20" cy="28" r="3.6" fill="#FFFFFF" />
      <circle cx="21" cy="28.4" r="1.8" fill="#17181C" />
      <circle cx="32" cy="28" r="3.6" fill="#FFFFFF" />
      <circle cx="33" cy="28.4" r="1.8" fill="#17181C" />
      {/* Sorriso simpático */}
      <path d="M20 40 Q26 45 32 40" stroke="#17181C" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {/* Hashis nas costas */}
      <path d="M40 10 L48 28 M44 9 L50 27" stroke="#8B5E34" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
};

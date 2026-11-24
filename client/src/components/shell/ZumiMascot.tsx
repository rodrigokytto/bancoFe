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
      aria-label="BancoFé Emblema Institucional"
      className={`inline-block shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id="bancofeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0c4a34" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d4af37" />
        </linearGradient>
      </defs>

      {/* Escudo / Base Institucional */}
      <rect x="6" y="6" width="52" height="52" rx="16" fill="url(#bancofeGrad)" />
      
      {/* Borda Glow Suave */}
      <rect x="6" y="6" width="52" height="52" rx="16" fill="none" stroke="#34d399" strokeWidth="1.5" opacity="0.6" />

      {/* Frontão do Templo / Banco (Landmark) */}
      <path d="M16 26 L32 16 L48 26 Z" fill="url(#goldGrad)" />

      {/* Arquítrabe */}
      <rect x="18" y="27" width="28" height="3" rx="1" fill="#FFFFFF" opacity="0.9" />

      {/* 4 Colunas do Core Bancário */}
      <rect x="20" y="32" width="4" height="13" rx="1.5" fill="#FFFFFF" opacity="0.95" />
      <rect x="27" y="32" width="4" height="13" rx="1.5" fill="#FFFFFF" opacity="0.95" />
      <rect x="34" y="32" width="4" height="13" rx="1.5" fill="#FFFFFF" opacity="0.95" />
      <rect x="41" y="32" width="4" height="13" rx="1.5" fill="#FFFFFF" opacity="0.95" />

      {/* Base / Piso */}
      <rect x="16" y="47" width="32" height="3.5" rx="1" fill="url(#goldGrad)" />
    </svg>
  );
};

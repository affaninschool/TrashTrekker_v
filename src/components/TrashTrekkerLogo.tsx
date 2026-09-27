import React from 'react';
import logoImg from '../assets/images/trash_trekker_logo_1787557904763.jpg';

interface LogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  textClassName?: string;
  subtextClassName?: string;
}

export const TrashTrekkerLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  textClassName = 'text-slate-100 font-bold',
  subtextClassName = 'text-emerald-400 font-semibold',
}) => {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
    '2xl': 'w-28 h-28',
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className={`relative rounded-full overflow-hidden shrink-0 ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-500/10 bg-slate-900 ${sizeMap[size]}`}>
        <img
          src={logoImg}
          alt="Trash-Trekker: Autonomous River Systems Logo"
          className="w-full h-full object-cover select-none"
          referrerPolicy="no-referrer"
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`tracking-tight ${textClassName}`}>Trash-Trekker</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
              MK-IV
            </span>
          </div>
          <span className={`text-[10px] uppercase tracking-widest ${subtextClassName}`}>
            Autonomous River Systems · Swarm Fleet
          </span>
        </div>
      )}
    </div>
  );
};

// Backward-compatibility export alias
export const EcoDriveXLogo = TrashTrekkerLogo;

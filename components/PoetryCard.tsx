
import React, { useState } from 'react';
import { Heart, Copy, Check } from 'lucide-react';
import { Poetry } from '../types';

interface PoetryCardProps {
  poetry: Poetry;
  index: number;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

const PoetryCard: React.FC<PoetryCardProps> = ({ poetry, index, isFavorite, onToggleFavorite }) => {
  const [copied, setCopied] = useState(false);

  // Rotate through deep, warm dark colors based on index for a journal aesthetic
  const colors = [
    'bg-[#1C1A19]', // Deep Charcoal
    'bg-[#1A191C]', // Deep Blue-grey
    'bg-[#191C1A]', // Deep Forest-grey
    'bg-[#1C1B19]', // Deep Warm-grey
  ];
  const bgColor = colors[index % colors.length];

  const formatText = (str: string) => {
    return str.split('\n').map((line, i) => (
      <span key={i} className="block mb-2">
        {line.trim()}
      </span>
    ));
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(poetry.text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={`group relative p-10 md:p-14 rounded-[3rem] ${bgColor} border border-white/5 shadow-2xl transition-all duration-700 h-full flex flex-col justify-between overflow-hidden cursor-default hover:-translate-y-2 hover:border-[#C9A46A]/20`}>
      
      {/* Decorative page lines (journal look) adjusted for dark mode */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none [background-image:linear-gradient(#fff_1px,transparent_1px)] [background-size:100%_2.5rem] mt-16"></div>
      
      {/* Artistic corner accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-bl-[100%] transition-transform duration-1000 group-hover:scale-110"></div>

      {/* Action Buttons Container */}
      <div className="absolute top-10 right-10 z-20 flex gap-2">
        {/* Copy Button */}
        <button 
          onClick={handleCopy}
          className={`relative p-3 rounded-full transition-all duration-500 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-[#C9A46A]/30 text-[#C9A46A]/40 hover:text-[#C9A46A]`}
          title="Copy Poem"
        >
          {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
          {copied && (
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-widest text-green-400 animate-fade-in whitespace-nowrap">
              Copied!
            </span>
          )}
        </button>

        {/* Favorite Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.();
          }}
          className={`p-3 rounded-full transition-all duration-500 ${isFavorite ? 'text-red-400 bg-white/10 shadow-lg' : 'text-[#C9A46A]/20 hover:text-red-300 bg-transparent'}`}
        >
          <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} className={isFavorite ? 'animate-[heartBeat_0.4s_ease-out]' : ''} />
        </button>
      </div>

      <div className="relative z-10 flex flex-col">
        {/* Type indicator */}
        <div className="flex items-center gap-3 mb-10 opacity-40 group-hover:opacity-100 transition-opacity duration-700">
           <div className="w-2 h-2 rounded-full bg-[#C9A46A]"></div>
           <span className="text-[9px] font-inter font-bold uppercase tracking-[0.3em] text-[#E5E1D8]">
             {poetry.type}
           </span>
        </div>

        <div className="text-xl md:text-2xl leading-[1.8] text-[#E5E1D8] font-serif italic antialiased tracking-wide">
          {formatText(poetry.text)}
        </div>
      </div>

      <div className="mt-16 relative z-10">
        <div className="flex flex-col">
           <span className="text-[9px] text-[#C9A46A] uppercase font-inter font-black tracking-[0.3em] mb-1">
             Mussanif
           </span>
           <span className="text-lg font-serif font-medium text-[#E5E1D8]/70 group-hover:text-[#E5E1D8] transition-colors">
             {poetry.poet}
           </span>
        </div>
      </div>

      {/* Decorative flourish */}
      <div className="absolute bottom-10 left-10 text-[#C9A46A]/5 group-hover:text-[#C9A46A]/10 transition-all duration-1000">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="currentColor">
           <path d="M20 0C20 11.0457 11.0457 20 0 20C11.0457 20 20 28.9543 20 40C20 28.9543 28.9543 20 40 20C28.9543 20 20 11.0457 20 0Z" />
        </svg>
      </div>

      <style>{`
        @keyframes heartBeat {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translate(-50%, -5px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default PoetryCard;

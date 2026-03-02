
import React, { useState } from 'react';
import { Poetry } from '../types';

interface PoetryFormProps {
  onSubmit: (poem: Omit<Poetry, 'id'>) => void;
  onCancel: () => void;
}

const PoetryForm: React.FC<PoetryFormProps> = ({ onSubmit, onCancel }) => {
  const [text, setText] = useState('');
  const [poet, setPoet] = useState('');
  const [type, setType] = useState('shayari');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !poet.trim()) {
      setError('Lafzon aur naam ki zarurat hai...');
      return;
    }
    
    onSubmit({ text, poet, type });
    setText('');
    setPoet('');
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="relative">
        <label className="block text-[10px] font-inter font-black text-[#C9A46A] uppercase tracking-[0.25em] mb-4 ml-1">
          Shafaff Alfaaz
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Dil-e-jazbaat yahan darj karein..."
          className="w-full p-6 bg-[#121110] border border-white/5 rounded-3xl focus:outline-none focus:ring-4 focus:ring-[#C9A46A]/10 transition-all min-h-[160px] font-serif italic text-xl resize-none text-[#E5E1D8] placeholder:text-[#8C867E]/30"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="block text-[10px] font-inter font-black text-[#C9A46A] uppercase tracking-[0.25em] mb-4 ml-1">
            Aapka Naam
          </label>
          <input
            type="text"
            value={poet}
            onChange={(e) => setPoet(e.target.value)}
            placeholder="Shayer ka naam"
            className="w-full px-6 py-4 bg-[#121110] border border-white/5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#C9A46A]/10 transition-all text-sm font-medium text-[#E5E1D8] placeholder:text-[#8C867E]/30"
          />
        </div>

        <div>
          <label className="block text-[10px] font-inter font-black text-[#C9A46A] uppercase tracking-[0.25em] mb-4 ml-1">
            Sinf (Category)
          </label>
          <div className="relative">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-6 py-4 bg-[#121110] border border-white/5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#C9A46A]/10 transition-all text-xs font-inter font-bold text-[#E5E1D8] appearance-none cursor-pointer"
            >
              <option value="shayari">Shayari</option>
              <option value="ghazal">Ghazal</option>
              <option value="nazm">Nazm</option>
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#C9A46A] opacity-50">
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red-400 text-xs italic font-medium px-2 animate-pulse">
          {error}
        </div>
      )}

      <div className="flex flex-col-reverse md:flex-row items-center gap-6 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="text-[#8C867E] hover:text-[#E5E1D8] transition-all uppercase tracking-[0.2em] text-[10px] font-inter font-bold"
        >
          Rehne dein
        </button>
        <button
          type="submit"
          className="w-full md:w-auto px-12 py-4 bg-[#C9A46A] text-black rounded-full font-inter font-bold hover:bg-[#B8965E] transition-all uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-black/20"
        >
          Kaghaz Par Utaarein
        </button>
      </div>
    </form>
  );
};

export default PoetryForm;

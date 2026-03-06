
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, Search, RefreshCcw, BookOpen, X, ChevronDown, Check, Heart } from 'lucide-react';
import { Poetry, PoetryType } from './types';
import PoetryCard from './components/PoetryCard';
import PoetryForm from './components/PoetryForm';
import { supabase } from './supabase';

const App: React.FC = () => {
  const [allPoetry, setAllPoetry] = useState<Poetry[]>([]);
  const [displayPoetry, setDisplayPoetry] = useState<Poetry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<PoetryType>('all');
  const [filterPoet, setFilterPoet] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPoetDropdownOpen, setIsPoetDropdownOpen] = useState(false);
  const [poetSearchTerm, setPoetSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<Set<string | number>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const poetDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        let currentUserId = session?.user?.id;

        if (!currentUserId) {
          const { data, error } = await supabase.auth.signInAnonymously();
          if (error) throw error;
          currentUserId = data?.user?.id;
        }

        if (currentUserId) {
          setUserId(currentUserId);

          const { data: favs } = await supabase
            .from('Favorite_Shayries')
            .select('shayari_id')
            .eq('user_id', currentUserId);

          if (favs) {
            setFavorites(prev => {
              const next = new Set(prev);
              favs.forEach(f => next.add(f.shayari_id));
              return next;
            });
          }
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      }
    };
    initAuth();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      let initialData: Poetry[] = [];

      try {
        const { data, error } = await supabase.from('Shayari_Entries').select('*');
        if (error) {
          console.error("Error fetching data from Supabase:", error);
        } else if (data) {
          initialData = data.map((item: any) => ({
            id: item.id,
            poet: item.poet,
            type: item.type,
            text: item.text,
            createdAt: new Date(item.created_at).getTime()
          }));
        }

        const saved = localStorage.getItem('user_poetry');
        const userPoetry: Poetry[] = saved ? JSON.parse(saved) : [];
        const combined = [...userPoetry, ...initialData];

        // Shuffle the array randomly
        const shuffled = combined.sort(() => Math.random() - 0.5);

        setAllPoetry(shuffled);

        const savedFavs = localStorage.getItem('user_favorites');
        if (savedFavs) {
          setFavorites(new Set(JSON.parse(savedFavs)));
        }
      } catch (e) {
        setAllPoetry(initialData.sort(() => Math.random() - 0.5));
        console.error("Error loading data:", e);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    localStorage.setItem('user_favorites', JSON.stringify(Array.from(favorites)));
  }, [favorites]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (poetDropdownRef.current && !poetDropdownRef.current.contains(event.target as Node)) {
        setIsPoetDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const uniquePoets = useMemo(() => {
    const poets = allPoetry.map(p => p.poet);
    return Array.from(new Set(poets)).sort();
  }, [allPoetry]);

  const filteredPoetsForDropdown = useMemo(() => {
    if (!poetSearchTerm) return uniquePoets;
    return uniquePoets.filter(p => p.toLowerCase().includes(poetSearchTerm.toLowerCase()));
  }, [uniquePoets, poetSearchTerm]);

  const filteredPoetry = useMemo(() => {
    return allPoetry.filter(item => {
      const content = (item.text || '').toLowerCase();
      const author = (item.poet || '').toLowerCase();
      const query = searchTerm.toLowerCase();

      const matchesSearch = author.includes(query) || content.includes(query);

      let matchesType = false;
      if (filterType === 'all') matchesType = true;
      else if (filterType === 'favorites') matchesType = favorites.has(item.id);
      else matchesType = item.type === filterType;

      const matchesPoet = filterPoet === 'all' || item.poet === filterPoet;

      return matchesSearch && matchesType && matchesPoet;
    });
  }, [allPoetry, searchTerm, filterType, filterPoet, favorites]);

  useEffect(() => {
    setDisplayPoetry(filteredPoetry.slice(0, page * itemsPerPage));
  }, [filteredPoetry, page]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterType, filterPoet]);

  const handleAddPoetry = async (newPoem: Omit<Poetry, 'id'>) => {
    try {
      // Save directly to Supabase
      const { data, error } = await supabase
        .from('Shayari_Entries')
        .insert([
          {
            id: Date.now(), // Generating a unique bigint ID manually as the database expects one
            poet: newPoem.poet,
            type: newPoem.type,
            text: newPoem.text
          }
        ])
        .select();

      if (error) {
        console.error("Error saving to Supabase:", error);
        alert("Server pe save karne mein masla hua. Dobara koshish karein.");
        return;
      }

      if (data && data.length > 0) {
        const insertedItem = data[0];
        const poemWithId: Poetry = {
          id: insertedItem.id,
          poet: insertedItem.poet,
          type: insertedItem.type,
          text: insertedItem.text,
          createdAt: new Date(insertedItem.created_at).getTime(),
          isUserAdded: true
        };

        setAllPoetry(prev => [poemWithId, ...prev]);
        setIsFormOpen(false);
      }
    } catch (e) {
      console.error("Unknown error saving poetry:", e);
    }
  };

  const handleRefresh = () => {
    setAllPoetry(prev => [...prev].sort(() => Math.random() - 0.5));
    setPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFavorite = async (id: string | number) => {
    const isCurrentlyFavorite = favorites.has(id);

    setFavorites(prev => {
      const next = new Set(prev);
      if (isCurrentlyFavorite) next.delete(id);
      else next.add(id);
      return next;
    });

    if (!userId) return;

    try {
      if (isCurrentlyFavorite) {
        await supabase
          .from('Favorite_Shayries')
          .delete()
          .match({ user_id: userId, shayari_id: id });
      } else {
        await supabase
          .from('Favorite_Shayries')
          .insert({ user_id: userId, shayari_id: id });
      }
    } catch (err) {
      console.error("Error updating favorite in Supabase:", err);
    }
  };

  return (
    <div className="min-h-screen pb-12 relative">
      {/* Background blobs for artistic depth */}
      <div className="blob bg-[#C9A46A] w-96 h-96 top-0 left-[-10%]"></div>
      <div className="blob bg-[#7C6A8C] w-[30rem] h-[30rem] top-[30%] right-[-10%]"></div>
      <div className="blob bg-[#6A8C70] w-80 h-80 bottom-[10%] left-[5%]"></div>

      <header className="w-full max-w-5xl mx-auto px-6 pt-10 flex justify-between items-center z-50">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => {
            setFilterType('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <div className="w-10 h-10 rounded-xl bg-[#1C1A19] shadow-sm flex items-center justify-center text-[#C9A46A] group-hover:bg-[#C9A46A] group-hover:text-black transition-all duration-500">
            <BookOpen size={20} strokeWidth={1.5} />
          </div>
          <h1 className="text-xl font-medium text-[#E5E1D8] tracking-tight">Apana Kagaz</h1>
        </div>

        <div className="flex items-center gap-3">

          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#C9A46A] text-black rounded-full hover:bg-[#B8965E] transition-all shadow-lg shadow-[#C9A46A]/10 font-inter text-xs font-semibold uppercase tracking-widest"
          >
            <Plus size={16} />
            <span>Likhein</span>
          </button>
        </div>
      </header>

      <section className="mt-28 mb-32 text-center px-6 max-w-4xl mx-auto animate-[fadeIn_1.5s_ease-out]">
        <div className="inline-block px-4 py-1.5 mb-8 rounded-full bg-white/5 border border-[#C9A46A]/20 text-[10px] uppercase tracking-[0.3em] font-inter font-bold text-[#C9A46A]">
          Sukhan-e-Dil
        </div>
        <p className="text-[#E5E1D8] text-2xl md:text-4xl font-serif italic leading-[1.6] mb-8">
          Yeh jagah shor ke liye nahi, yeh un lamhon ke liye hai jo theharna chahte hain.
        </p>
        <div className="flex items-center justify-center gap-4">
          <div className="w-8 h-px bg-[#C9A46A]/20"></div>
          <p className="text-[#8C867E] text-xs font-inter font-medium tracking-widest uppercase">
            A quiet place for poetry
          </p>
          <div className="w-8 h-px bg-[#C9A46A]/20"></div>
        </div>
      </section>

      <div className="w-full max-w-4xl px-6 mb-24 mx-auto z-[60] relative">
        <div className="bg-[#1C1A19]/60 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/5 shadow-2xl shadow-black/40 flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="relative w-full md:w-64 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9A46A]/60" size={16} />
            <input
              type="text"
              placeholder="Talash karein..."
              className="pl-12 pr-4 w-full py-2.5 bg-[#121110] border border-white/5 rounded-full text-sm focus:outline-none focus:ring-4 focus:ring-[#C9A46A]/5 transition-all text-[#E5E1D8] placeholder:text-[#8C867E]/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap justify-center gap-6 font-inter text-[10px] font-bold uppercase tracking-[0.2em]">
            {(['all', 'ghazal', 'shayari', 'favorites'] as PoetryType[]).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`transition-all pb-1 border-b-2 flex items-center gap-1.5 ${filterType === type ? 'text-[#C9A46A] border-[#C9A46A]' : 'text-[#8C867E]/60 border-transparent hover:text-[#E5E1D8]'}`}
              >
                {type === 'favorites' && <Heart size={10} fill={filterType === 'favorites' ? 'currentColor' : 'none'} />}
                {type}
              </button>
            ))}
          </div>

          <div className="relative min-w-[180px]" ref={poetDropdownRef}>
            <button
              onClick={() => setIsPoetDropdownOpen(!isPoetDropdownOpen)}
              className="w-full flex items-center justify-between gap-4 pl-6 pr-4 py-2.5 bg-[#121110] border border-white/5 rounded-full text-xs font-inter font-bold text-[#8C867E] transition-all hover:border-[#C9A46A]/40 focus:outline-none"
            >
              <span className="truncate">{filterPoet === 'all' ? 'Sare Shayer' : filterPoet}</span>
              <ChevronDown size={14} className={`text-[#C9A46A] transition-transform duration-300 ${isPoetDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isPoetDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-[#1C1A19] border border-white/10 rounded-[2rem] shadow-2xl z-[70] overflow-hidden animate-[fadeIn_0.2s_ease-out]">
                <div className="p-3 border-b border-white/5">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C9A46A]/40" size={12} />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Shayer dhoondein..."
                      className="w-full pl-8 pr-3 py-2 bg-[#121110] rounded-full text-[11px] focus:outline-none border-none font-inter text-[#E5E1D8]"
                      value={poetSearchTerm}
                      onChange={(e) => setPoetSearchTerm(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto no-scrollbar py-2">
                  <button
                    onClick={() => { setFilterPoet('all'); setIsPoetDropdownOpen(false); setPoetSearchTerm(''); }}
                    className={`w-full text-left px-6 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center justify-between ${filterPoet === 'all' ? 'text-[#C9A46A] bg-[#C9A46A]/5' : 'text-[#8C867E] hover:bg-white/5'}`}
                  >
                    Sare Shayer
                    {filterPoet === 'all' && <Check size={12} />}
                  </button>
                  {filteredPoetsForDropdown.map((poet) => (
                    <button
                      key={poet}
                      onClick={() => { setFilterPoet(poet); setIsPoetDropdownOpen(false); setPoetSearchTerm(''); }}
                      className={`w-full text-left px-6 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center justify-between ${filterPoet === poet ? 'text-[#C9A46A] bg-[#C9A46A]/5' : 'text-[#8C867E] hover:bg-white/5'}`}
                    >
                      {poet}
                      {filterPoet === poet && <Check size={12} />}
                    </button>
                  ))}
                  {filteredPoetsForDropdown.length === 0 && (
                    <div className="px-6 py-4 text-[10px] text-[#8C867E]/40 italic text-center">Koi nahi mila</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="w-full max-w-5xl px-6 mx-auto z-10">
        {displayPoetry.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {displayPoetry.map((item, idx) => (
              <div
                key={item.id}
                className="animate-[slideUp_0.8s_ease-out]"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <PoetryCard
                  poetry={item}
                  index={idx}
                  isFavorite={favorites.has(item.id)}
                  onToggleFavorite={() => toggleFavorite(item.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-40 text-[#8C867E]/40 italic font-serif text-2xl">
            {filterType === 'favorites' ? 'Koi pasandeeda ashaar nahi mile...' : 'Lafzon ki talaash jari hai...'}
          </div>
        )}

        <div className="flex flex-col items-center gap-12 mt-16">
          {displayPoetry.length < filteredPoetry.length && (
            <button
              onClick={() => setPage(p => p + 1)}
              className="px-10 py-4 bg-white/5 border border-[#C9A46A]/30 text-[#C9A46A] text-[10px] uppercase tracking-[0.3em] font-bold rounded-full hover:bg-[#C9A46A] hover:text-black transition-all duration-500 shadow-lg shadow-black/20 active:scale-95"
            >
              Aur Padhiein
            </button>
          )}

          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 text-[#8C867E]/60 hover:text-[#C9A46A] transition-all text-[10px] uppercase tracking-[0.2em] font-bold group"
          >
            <RefreshCcw size={14} className="group-hover:rotate-180 transition-transform duration-700" />
            Nayi Shuruat
          </button>
        </div>
      </main>

      <footer className="mt-24 w-full py-12 text-center border-t border-white/5">
        <p className="text-[#E5E1D8] font-serif text-2xl italic mb-4">Apana Kagaz</p>

        <p className="text-[#8C867E]/40 text-[9px] tracking-[0.4em] uppercase font-bold font-inter">Made for the lovers of words</p>
      </footer>

      {isFormOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]"
          onClick={() => setIsFormOpen(false)}
        >
          <div
            className="bg-[#1C1A19] w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden relative border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setIsFormOpen(false)} className="absolute top-8 right-8 text-[#8C867E]/40 hover:text-[#E5E1D8] transition-all p-2 bg-white/5 rounded-full hover:bg-white/10">
              <X size={20} />
            </button>
            <div className="p-12 md:p-16">
              <div className="w-10 h-1 bg-[#C9A46A]/30 rounded-full mb-8"></div>
              <h3 className="text-3xl font-serif mb-3 text-[#E5E1D8]">Kalam Uthayein</h3>
              <p className="text-[#8C867E] mb-12 text-sm italic">Lafzon ko bayaan hone dijiye.</p>
              <PoetryForm onSubmit={handleAddPoetry} onCancel={() => setIsFormOpen(false)} />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp { 
          from { opacity: 0; transform: translateY(40px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default App;

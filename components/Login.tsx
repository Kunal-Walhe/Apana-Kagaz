import React, { useState } from 'react';
import { supabase } from '../supabase';

interface LoginProps {
    onClose?: () => void;
}

const Login: React.FC<LoginProps> = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const { error } = await supabase.auth.signInWithOtp({
            email: email
        });

        if (error) {
            setMessage(`Khata: ${error.message}`);
        } else {
            setMessage("Login link aapke email par bhej diya gaya hai.");
            setEmail('');
        }
        setLoading(false);
    };

    return (
        <div className="space-y-8">
            <div className="text-center mb-10">
                <h3 className="text-3xl font-serif mb-3 text-[#E5E1D8]">Dakhila</h3>
                <p className="text-[#8C867E] text-sm italic">Apni pehchan darj karein</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label className="block text-[10px] font-inter font-black text-[#C9A46A] uppercase tracking-[0.25em] mb-4 ml-1">
                        Email Pata
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="apna@email.com"
                        required
                        className="w-full px-6 py-4 bg-[#121110] border border-white/5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#C9A46A]/10 transition-all text-sm font-medium text-[#E5E1D8] placeholder:text-[#8C867E]/30"
                    />
                </div>

                {message && (
                    <div className="text-[#C9A46A] text-xs italic font-medium px-2 text-center">
                        {message}
                    </div>
                )}

                <div className="flex flex-col items-center gap-6 pt-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-12 py-4 bg-[#C9A46A] text-black rounded-full font-inter font-bold hover:bg-[#B8965E] transition-all uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-black/20 disabled:opacity-50"
                    >
                        {loading ? 'Intizaar...' : 'Daakhil Hon'}
                    </button>

                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-[#8C867E] hover:text-[#E5E1D8] transition-all uppercase tracking-[0.2em] text-[10px] font-inter font-bold"
                        >
                            Rehne dein
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default Login;

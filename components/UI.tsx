import React, { useState, useCallback, PropsWithChildren, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronDown, CheckCircle, Sparkles, Lightbulb, Volume2, Square, Upload, Music, Type } from 'lucide-react';
import { Theme, ContentItem, FiqhItem } from '../types';
import { explainText, speakText } from '../services/geminiService';

export const NavIcon = ({ icon, active, onClick }: { icon: React.ReactNode, active: boolean, onClick: () => void }) => (
  <motion.button 
    whileTap={{ scale: 0.8 }} 
    onClick={onClick} 
    className={`p-3.5 rounded-2xl transition-all relative ${active ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/30' : 'opacity-40 hover:opacity-100'}`}
  >
    {icon}
    {active && <motion.div layoutId="nav-glow" className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full -z-10" />}
  </motion.button>
);

interface SectionWrapperProps {
  title: string;
  onBack: () => void;
  action?: React.ReactNode;
}

export const SectionWrapper = ({ title, children, onBack, action }: PropsWithChildren<SectionWrapperProps>) => (
  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-xl transition-colors opacity-60 hover:opacity-100">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl sm:text-2xl font-black">{title}</h2>
      </div>
      <div className="self-end sm:self-auto">
        {action}
      </div>
    </div>
    {children}
  </motion.div>
);

export const CategoryCard = ({ title, desc, icon, color, onClick, isVisionMode, isDarkMode }: any) => {
  const colors: any = {
    orange: { bg: "bg-orange-500/10", text: "text-orange-500", iconBg: "bg-orange-500/20" },
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-500", iconBg: "bg-emerald-500/20" },
    blue: { bg: "bg-blue-500/10", text: "text-blue-500", iconBg: "bg-blue-500/20" },
    purple: { bg: "bg-purple-500/10", text: "text-purple-500", iconBg: "bg-purple-500/20" },
    pink: { bg: "bg-pink-500/10", text: "text-pink-500", iconBg: "bg-pink-500/20" },
    cyan: { bg: "bg-cyan-500/10", text: "text-cyan-500", iconBg: "bg-cyan-500/20" },
  };

  const vColor = colors[color as string] || colors.emerald;

  const noiseSvg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")`;

  if (isVisionMode) {
    return (
      <motion.button 
        whileHover={{ scale: 1.02, y: -2 }} 
        whileTap={{ scale: 0.98 }} 
        onClick={onClick} 
        className={`relative p-4 sm:p-6 rounded-[24px] overflow-hidden group transition-all duration-300 w-full ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'} border border-t-white/20 border-l-white/20 shadow-lg backdrop-blur-xl flex flex-col items-center text-center sm:items-start sm:text-left h-full`}
      >
        <div className={`absolute inset-0 ${vColor.bg} opacity-50`} />
        <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay" style={{ backgroundImage: noiseSvg }} />
        <div className="relative z-10 flex flex-col items-center sm:items-start w-full">
          <div className={`w-12 h-12 rounded-2xl ${vColor.iconBg} backdrop-blur-md flex items-center justify-center ${vColor.text} mb-3 sm:mb-4 shadow-sm border border-white/10`}>
            {icon}
          </div>
          <h3 className={`text-sm sm:text-lg font-bold mb-1 leading-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{title}</h3>
          <p className={`text-[10px] sm:text-xs font-medium leading-tight ${isDarkMode ? 'text-white/60' : 'text-slate-500'} line-clamp-2`}>{desc}</p>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </motion.button>
    );
  }
  return null;
};

export const AccordionItem = ({ title, content, theme, apiKey, fontScale = 1 }: { title: string, content: string, theme: Theme, apiKey?: string, fontScale?: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  const handleExplain = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (explanation) { setExplanation(null); return; }
    setIsExplaining(true);
    try {
      const res = await explainText(`${title} - ${content}`, apiKey);
      setExplanation(res);
    } catch (err) { console.error(err); } finally { setIsExplaining(false); }
  };

  return (
    <div className={`${theme.card} rounded-[28px] border-2 overflow-hidden transition-all ${isOpen ? 'border-emerald-500/20' : 'border-transparent'}`}>
      <button onClick={() => setIsOpen(!isOpen)} className="w-full p-6 flex justify-between items-center text-left hover:bg-white/5 transition-colors">
        <span className="font-bold text-lg" style={{ fontSize: `${1.125 * fontScale}rem` }}>{title}</span>
        <div className={`p-2 rounded-full transition-transform ${isOpen ? 'rotate-180 bg-emerald-500 text-white' : 'bg-white/5'}`}><ChevronDown size={20} /></div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="p-6 pt-0 opacity-70 leading-relaxed whitespace-pre-wrap border-t border-white/5 mt-2" style={{ fontSize: `${0.875 * fontScale}rem` }}>{content}</div>
            <div className="px-6 pb-6">
                <button onClick={handleExplain} className="flex items-center gap-2 text-xs font-bold text-emerald-500 hover:text-emerald-400 transition-colors uppercase tracking-widest">
                    {isExplaining ? <Sparkles size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    {explanation ? "Скрыть разъяснение" : "Подробнее от AI"}
                </button>
                <AnimatePresence>{explanation && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-sm leading-relaxed">{explanation}</motion.div>)}</AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const CardItem = ({ data, theme, isDarkMode, title, apiKey, isAdmin, fontScale = 1 }: { data: ContentItem, theme: Theme, isDarkMode: boolean, title?: string, apiKey?: string, isAdmin?: boolean, fontScale?: number }) => {
  const [view, setView] = useState<'ar'|'tr'|'ru'>('ar'); 
  const [count, setCount] = useState(0);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  
  // Custom Audio State (User Upload)
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Gemini Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExplain = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (explanation) { setExplanation(null); return; }
    setIsExplaining(true);
    try {
      const textToExplain = data.ar || data.ru || "";
      const res = await explainText(textToExplain, apiKey);
      setExplanation(res);
    } catch (err) { console.error(err); } finally { setIsExplaining(false); }
  }, [data, explanation, apiKey]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setCustomAudioUrl(url);
    }
  };

  const handlePlayAudio = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Stop all audio logic
    if (isPlaying) {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        if (audioSourceRef.current) {
            audioSourceRef.current.stop();
        }
        setIsPlaying(false);
        return;
    }

    // Priority 1: User uploaded audio
    if (customAudioUrl) {
        if (!audioRef.current) {
            audioRef.current = new Audio(customAudioUrl);
            audioRef.current.onended = () => setIsPlaying(false);
        }
        audioRef.current.play();
        setIsPlaying(true);
        return;
    }

    // Priority 2: Gemini TTS
    if (!data.ar) return;

    setIsAudioLoading(true);
    try {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
        }
        
        if (audioCtxRef.current.state === 'suspended') {
            await audioCtxRef.current.resume();
        }

        const buffer = await speakText(data.ar, audioCtxRef.current, apiKey);
        
        const source = audioCtxRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtxRef.current.destination);
        source.onended = () => setIsPlaying(false);
        
        audioSourceRef.current = source;
        source.start();
        setIsPlaying(true);
    } catch (error) {
        console.error("Play failed", error);
        alert("Ошибка воспроизведения. Проверьте API ключ в настройках.");
    } finally {
        setIsAudioLoading(false);
    }
  };

  const isCompleted = data.target ? count >= data.target : false;

  const basmala = "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ";
  const istiadha = "أَعُوذُ بِاللهِ مِنْ الشَّيْطَانِ الرَّجِيمِ";
  
  const content = data[view] || "N/A";
  let displayContent = content;
  let headerText = null;

  if (view === 'ar') {
     const trimmedContent = content.trim();
     if (trimmedContent.startsWith(basmala)) {
        headerText = basmala;
        displayContent = content.replace(basmala, '').trim();
     } else if (trimmedContent.startsWith(istiadha)) {
        headerText = istiadha;
        let rest = content.replace(istiadha, '').trim();
        // Remove dot if present at start of remaining text
        if (rest.startsWith('.')) {
            rest = rest.substring(1).trim();
        }
        displayContent = rest;
     }
  }

  return (
    <motion.div layout className={`${theme.card} p-6 rounded-[32px] border-2 transition-all ${isCompleted ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-transparent shadow-xl'}`}>
      {title && <h3 className="font-bold text-lg mb-4 text-emerald-500 flex items-center gap-2"><div className="w-1.5 h-6 bg-emerald-500 rounded-full" /> {title}</h3>}
      <div className="flex justify-between items-center mb-6">
        <div className="flex bg-white/5 p-1 rounded-xl">
          <button onClick={() => setView('ar')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${view === 'ar' ? 'bg-emerald-500 text-white' : 'opacity-40 hover:opacity-100'}`}>Араб</button>
          {data.tr && <button onClick={() => setView('tr')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${view === 'tr' ? 'bg-emerald-500 text-white' : 'opacity-40 hover:opacity-100'}`}>Тр</button>}
          {data.ru && <button onClick={() => setView('ru')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${view === 'ru' ? 'bg-emerald-500 text-white' : 'opacity-40 hover:opacity-100'}`}>Перевод</button>}
        </div>
        <div className="flex gap-2">
           {isAdmin && (
            <>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="audio/*" className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className={`p-2.5 rounded-xl transition-all ${customAudioUrl ? 'bg-blue-500 text-white' : 'bg-white/5 text-blue-500'}`}>
                <Upload size={18} />
              </button>
            </>
           )}
          <button onClick={handleExplain} className={`p-2.5 rounded-xl transition-all ${explanation ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/20' : 'bg-white/5 text-yellow-500'}`}>
            {isExplaining ? <Sparkles size={18} className="animate-spin"/> : <Lightbulb size={18} />}
          </button>
          <button 
            onClick={handlePlayAudio} 
            disabled={(!data.ar && !customAudioUrl) || isAudioLoading}
            className={`p-2.5 rounded-xl transition-all ${isPlaying ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-white/5 hover:text-emerald-500'} ${(!data.ar && !customAudioUrl) ? 'opacity-30 cursor-not-allowed' : ''}`}
          >
            {isAudioLoading ? <Sparkles size={18} className="animate-spin"/> : isPlaying ? <Square size={18} fill="currentColor" /> : (customAudioUrl ? <Music size={18} /> : <Volume2 size={18} />)}
          </button>
        </div>
      </div>
      <div onClick={() => data.target && setCount(c => Math.min(c + 1, data.target!))} className="cursor-pointer py-4 group">
         {headerText && (
            <p className="text-center font-serif text-emerald-500/80 mb-6" style={{ fontSize: `${1.5 * fontScale}rem` }}>
                {headerText}
            </p>
         )}
         <p 
            className={`leading-relaxed transition-all ${view === 'ar' ? 'text-right font-serif' : 'text-left font-medium opacity-90'} whitespace-pre-wrap`} 
            dir={view === 'ar' ? 'rtl' : 'ltr'}
            style={{ 
              fontSize: view === 'ar' ? `${1.875 * fontScale}rem` : `${1.125 * fontScale}rem`,
              lineHeight: view === 'ar' ? '2' : '1.6'
            }}
         >
            {displayContent}
         </p>
         {data.target && !isCompleted && <div className="mt-4 text-[10px] font-bold text-emerald-500/60 uppercase group-hover:text-emerald-500 transition-colors">Нажмите, чтобы засчитать →</div>}
      </div>
      <AnimatePresence>{explanation && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mt-6 p-5 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 relative"><div className="flex items-center gap-2 mb-3 text-yellow-500 font-bold text-xs uppercase tracking-widest"><Sparkles size={14}/> Мудрость AI</div><p className="text-sm leading-relaxed opacity-90 italic">{explanation}</p></motion.div>)}</AnimatePresence>
      {data.target && (<div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center"><div className="flex items-center gap-2"><div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isCompleted ? 'bg-emerald-500 text-white' : 'bg-white/5 opacity-30'}`}><CheckCircle size={16} /></div><span className="text-xs font-black uppercase tracking-wider opacity-40">Прогресс</span></div><div className="text-3xl font-black tabular-nums"><span className={isCompleted ? 'text-emerald-500' : ''}>{count}</span><span className="text-sm opacity-20 ml-1">/ {data.target}</span></div></div>)}
    </motion.div>
  );
};

export const FiqhCard = ({ item, theme, isDarkMode, fontScale = 1 }: { item: FiqhItem, theme: Theme, isDarkMode: boolean, fontScale?: number }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      onClick={() => setIsOpen(!isOpen)}
      className={`${theme.card} p-6 rounded-[32px] border-2 border-transparent transition-all hover:border-emerald-500/20 cursor-pointer group select-none`}
    >
      <div className="flex justify-between items-start gap-4">
        <h3 className={`font-bold mb-2 leading-snug flex-1 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`} style={{ fontSize: `${1.125 * fontScale}rem` }}>
          <span className="opacity-50 mr-2">{item.id}.</span>{item.question}
        </h3>
        <div className={`p-2 rounded-full transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180 bg-emerald-500 text-white' : 'bg-white/5 text-emerald-500'}`}>
           <ChevronDown size={20} />
        </div>
      </div>
      
      {!isOpen && (
        <p className="text-xs opacity-40 font-bold uppercase tracking-wider mt-2">Нажмите, чтобы увидеть ответ</p>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            className="overflow-hidden"
          >
            <div className={`mt-4 p-4 rounded-2xl leading-relaxed whitespace-pre-wrap ${isDarkMode ? 'bg-white/5 text-gray-200' : 'bg-slate-50 text-slate-700'}`} style={{ fontSize: `${0.875 * fontScale}rem` }}>
              {item.answer}
            </div>
            {item.arabic && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="font-serif text-right leading-loose" dir="rtl" style={{ fontSize: `${1.5 * fontScale}rem` }}>
                  {item.arabic}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
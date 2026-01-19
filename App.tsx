
import React, { useState, useMemo, useRef, useCallback } from 'react';
import { 
  Home, Scroll, BookOpen, Timer, School, Settings, Sun, Moon, 
  Quote, Sparkles, CheckCircle, Sunrise, HelpCircle, 
  ClipboardList, Calculator, RotateCcw, XCircle, Eye, Bot, CalendarCheck, Gift, Phone, Type, UserCog, BookMarked
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QUIZ_DATA, PLAN_DATA, ALL_MORNING_AZKARS, ALL_EVENING_AZKARS, 
  SURAHS_DATA, FIQH_DATA, TAJWEED_DATA, DUA_DATA, MADRASA_LESSONS
} from './data';
import { Theme, SectionState } from './types';
import { generateStudyPlan } from './services/geminiService';
import { 
  TajweedIcon, DuaIcon, TasbihIcon, FiqhIcon 
} from './components/Icons';
import { 
  NavIcon, SectionWrapper, CategoryCard, CardItem, AccordionItem, FiqhCard 
} from './components/UI';
import { 
  SectionPlanModal, InlineQuiz, AiChatModal, UniversalQuizModal, SelfTestModal
} from './components/Modals';

// --- Custom Components ---

const MadrasaLogo = ({ size = 24, className }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

// --- Sub-Sections ---

const ActionButtons = ({ onOpenQuiz, onOpenSelfTest }: { onOpenQuiz: () => void; onOpenSelfTest?: () => void; }) => (
  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
      <button onClick={onOpenQuiz} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-emerald-500 text-white rounded-xl font-bold text-xs hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30">
        <ClipboardList size={14} />
        Полный тест
      </button>
      {onOpenSelfTest && (
          <button onClick={onOpenSelfTest} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-indigo-500 text-white rounded-xl font-bold text-xs hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/30">
            <Sparkles size={14} />
            Самопроверка
          </button>
      )}
  </div>
);

const AzkarSection = ({ theme, isDarkMode, mode = 'full', showQuiz, showPlan, setShowPlan, apiKey, onOpenQuiz, onOpenSelfTest, isAdmin, fontScale }: any) => {
  const [type, setType] = useState('morning');
  
  const allMorningAzkars = useMemo(() => [...ALL_MORNING_AZKARS], []);
  const allEveningAzkars = useMemo(() => [...ALL_EVENING_AZKARS], []);
  const madrasaLessonAzkars = useMemo(() => MADRASA_LESSONS, []);
  const listToShow = useMemo(() => {
     if (mode === 'madrasa') return madrasaLessonAzkars;
     return type === 'morning' ? allMorningAzkars : allEveningAzkars;
  }, [mode, type, madrasaLessonAzkars, allMorningAzkars, allEveningAzkars]);

  return (
    <div className="space-y-6">
      <ActionButtons onOpenQuiz={onOpenQuiz} onOpenSelfTest={onOpenSelfTest} />
      <AnimatePresence>{showQuiz && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><InlineQuiz theme={theme} quizData={QUIZ_DATA.azkars}/></motion.div>}</AnimatePresence>
      <AnimatePresence>{showPlan && <SectionPlanModal onClose={() => setShowPlan(false)} theme={theme} isDarkMode={isDarkMode} planData={PLAN_DATA.azkars}/>}</AnimatePresence>
      
      <div className="flex justify-between items-center">
        {mode === 'full' ? (
          <div className="inline-flex p-1.5 rounded-2xl bg-white/5 border border-white/5">
            <button onClick={() => setType('morning')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${type === 'morning' ? 'bg-orange-500 text-white shadow-lg' : 'opacity-40'}`}>Утро</button>
            <button onClick={() => setType('evening')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${type === 'evening' ? 'bg-indigo-600 text-white shadow-lg' : 'opacity-40'}`}>Вечер</button>
          </div>
        ) : (
          <div className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 font-bold text-sm uppercase tracking-wider border border-emerald-500/20">Уроки Медресе</div>
        )}
      </div>
      <div className="grid gap-4">
        {listToShow.map((azkar, i) => (
          <React.Fragment key={i}>
            <CardItem data={azkar} theme={theme} isDarkMode={isDarkMode} apiKey={apiKey} isAdmin={isAdmin} fontScale={fontScale} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const SurahSection = ({ theme, isDarkMode, showQuiz, showPlan, setShowPlan, apiKey, onOpenQuiz, onOpenSelfTest, isAdmin, fontScale }: any) => {
  return (
    <div className="grid gap-6">
      <ActionButtons onOpenQuiz={onOpenQuiz} onOpenSelfTest={onOpenSelfTest} />
      <AnimatePresence>{showQuiz && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><InlineQuiz theme={theme} quizData={QUIZ_DATA.surah}/></motion.div>}</AnimatePresence>
      <AnimatePresence>{showPlan && <SectionPlanModal onClose={() => setShowPlan(false)} theme={theme} isDarkMode={isDarkMode} planData={PLAN_DATA.surah}/>}</AnimatePresence>
      {SURAHS_DATA.map((s, i) => (
        <React.Fragment key={i}>
          <CardItem title={`${s.id}. ${s.name}`} data={s} theme={theme} isDarkMode={isDarkMode} apiKey={apiKey} isAdmin={isAdmin} fontScale={fontScale} />
        </React.Fragment>
      ))}
    </div>
  );
};

const DuaSection = ({ theme, isDarkMode, showQuiz, showPlan, setShowPlan, apiKey, onOpenQuiz, onOpenSelfTest, isAdmin, fontScale }: any) => {
  return (
    <div className="space-y-8">
      <ActionButtons onOpenQuiz={onOpenQuiz} onOpenSelfTest={onOpenSelfTest} />
      <AnimatePresence>{showQuiz && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><InlineQuiz theme={theme} quizData={QUIZ_DATA.dua}/></motion.div>}</AnimatePresence>
      <AnimatePresence>{showPlan && <SectionPlanModal onClose={() => setShowPlan(false)} theme={theme} isDarkMode={isDarkMode} planData={PLAN_DATA.dua}/>}</AnimatePresence>

      <div className="space-y-6">
        <h3 className="font-bold opacity-50 text-xs uppercase tracking-widest pl-2">Популярные дуа</h3>
        {DUA_DATA.map((dua, i) => (
           <React.Fragment key={i}>
             <CardItem title={dua.title} data={dua} theme={theme} isDarkMode={isDarkMode} apiKey={apiKey} isAdmin={isAdmin} fontScale={fontScale} />
           </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const FiqhSection = ({ theme, isDarkMode, showPlan, setShowPlan, onOpenQuiz, onOpenSelfTest, fontScale }: any) => (
  <div className="space-y-6">
    <ActionButtons onOpenQuiz={onOpenQuiz} onOpenSelfTest={onOpenSelfTest} />
    <AnimatePresence>{showPlan && <SectionPlanModal onClose={() => setShowPlan(false)} theme={theme} isDarkMode={isDarkMode} planData={PLAN_DATA.fiqh}/>}</AnimatePresence>
    <div className="grid gap-4">
      {FIQH_DATA.map((item, i) => (
        <React.Fragment key={i}>
          <FiqhCard item={item} theme={theme} isDarkMode={isDarkMode} fontScale={fontScale} />
        </React.Fragment>
      ))}
    </div>
  </div>
);

const TajweedSection = ({ theme, isDarkMode, showQuiz, showPlan, setShowPlan, apiKey, onOpenQuiz, onOpenSelfTest, fontScale }: any) => (
  <div className="space-y-4">
    <ActionButtons onOpenQuiz={onOpenQuiz} onOpenSelfTest={onOpenSelfTest} />
    <AnimatePresence>{showQuiz && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><InlineQuiz theme={theme} quizData={QUIZ_DATA.tajweed}/></motion.div>}</AnimatePresence>
    <AnimatePresence>{showPlan && <SectionPlanModal onClose={() => setShowPlan(false)} theme={theme} isDarkMode={isDarkMode} planData={PLAN_DATA.tajweed}/>}</AnimatePresence>
    {TAJWEED_DATA.map((item, i) => (
      <React.Fragment key={i}>
        <AccordionItem title={item.title!} content={item.content!} theme={theme} apiKey={apiKey} fontScale={fontScale} />
      </React.Fragment>
    ))}
  </div>
);

const TasbihSection = ({ theme, isDarkMode }: any) => {
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(0);
  const vibrationTimeout = useRef<any>(null);

  const dhikrText = useMemo(() => {
    if (count < 34) return "СУБХЬАНАЛЛАХl";
    if (count < 67) return "АЛЬХЬАМДУЛИЛЛАХl";
    return "АЛЛАХlУ АКБАР";
  }, [count]);

  const phaseColor = useMemo(() => {
    if (count < 34) return "text-emerald-500";
    if (count < 67) return "text-blue-500";
    return "text-orange-500";
  }, [count]);

  const increment = useCallback(() => {
    setCount(prev => {
        const next = prev >= 100 ? 1 : prev + 1;
        if (next === 1) setTotal(t => t + 1);
        return next;
    });
    if (vibrationTimeout.current) clearTimeout(vibrationTimeout.current);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(50);
  }, []);

  const reset = () => { setCount(0); };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-10">
      <div className={`relative w-72 h-72 rounded-full border-8 transition-colors duration-500 ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-slate-100 bg-white shadow-xl'} flex flex-col items-center justify-center overflow-hidden`}>
        <motion.div key={dhikrText} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`text-xs font-black uppercase tracking-widest mb-2 transition-colors duration-300 ${isDarkMode ? 'text-white/50' : 'text-slate-400'} ${count >= 34 && count < 67 ? 'text-blue-400' : ''}`}>{dhikrText}</motion.div>
        <motion.div key={count} initial={{ scale: 0.9, opacity: 0.8 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.1 }} className={`text-8xl font-black tabular-nums transition-colors duration-300 ${phaseColor}`}>{count}</motion.div>
        <div className="absolute bottom-10 text-[10px] font-black opacity-20 uppercase tracking-[0.2em]">Всего: {total}</div>
        <motion.button whileTap={{ scale: 0.98 }} onClick={increment} className="absolute inset-0 z-10 w-full h-full cursor-pointer" style={{ WebkitTapHighlightColor: 'transparent' }} />
      </div>
      <div className="flex gap-4">
        <button onClick={reset} className="p-4 bg-red-500/10 text-red-500 rounded-2xl flex items-center gap-2 font-bold text-sm uppercase transition-all hover:bg-red-500/20"><RotateCcw size={18} /> Сброс</button>
        <div className="px-6 py-4 bg-emerald-500/10 text-emerald-500 rounded-2xl font-black text-sm uppercase tracking-widest">Цель: 33 / 100</div>
      </div>
    </div>
  );
};

// --- Main App ---

const App = () => {
  const [activeTab, setActiveTab] = useState('home'); 
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isVisionMode, setIsVisionMode] = useState(true); 
  const [showSettings, setShowSettings] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false); 
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);
  const [showDevInfo, setShowDevInfo] = useState(false);
  const [selfTestData, setSelfTestData] = useState<{title: string, data: {question: string, answer: string}[]} | null>(null);
  
  // New States for Admin and Text Size
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [fontScale, setFontScale] = useState(1);

  const [userApiKey, setUserApiKey] = useState("sk-d200cba704f741d5bbc28ee627799a34"); 
  
  const [studyPlan, setStudyPlan] = useState<string[] | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [azkarMode, setAzkarMode] = useState('madrasa'); 
  
  const [activeSectionState, setActiveSectionState] = useState<Record<string, SectionState>>({
      azkars: { quiz: false, plan: false },
      surah: { quiz: false, plan: false },
      dua: { quiz: false, plan: false },
      fiqh: { quiz: false, plan: false },
      tajweed: { quiz: false, plan: false }
  });

  const toggleSectionFeature = (section: string, feature: keyof SectionState) => {
      setActiveSectionState(prev => ({
          ...prev,
          [section]: { ...prev[section], [feature]: !prev[section][feature] }
      }));
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const toggleVisionMode = () => setIsVisionMode(!isVisionMode);

  const generatePlan = async () => {
    setIsGeneratingPlan(true); setStudyPlan(null);
    try {
        const stats = `
        - Утренние азкары: ${ALL_MORNING_AZKARS.length} шт.
        - Вечерние азкары: ${ALL_EVENING_AZKARS.length} шт.
        - Суры (Джуз Амма): ${SURAHS_DATA.length} шт.
        - Фикх (вопросы и ответы): ${FIQH_DATA.length} шт.
        - Таджвид (правила): ${TAJWEED_DATA.length} шт.
        `;
        const res = await generateStudyPlan(userApiKey, stats);
        setStudyPlan(res);
    } catch(e) { console.error(e); alert("Ошибка при создании плана. Проверьте API ключ."); } finally { setIsGeneratingPlan(false); }
  };

  const theme: Theme = {
    bg: isDarkMode ? "bg-[#050505] text-white" : "bg-white text-[#0f172a]",
    card: isDarkMode ? "bg-[#0f0f0f] border-[#1f1f1f]" : "bg-white border-slate-200 shadow-sm",
    accent: "emerald",
    accentColor: "text-emerald-500",
    buttonPrimary: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20",
    input: isDarkMode ? "bg-[#1a1a1a] border-[#333] text-white" : "bg-white border-[#cbd5e1] text-slate-900",
  };

  const handleHomeAzkarClick = () => { setAzkarMode('madrasa'); setActiveTab('azkars'); };
  const handleNavAzkarClick = () => { setAzkarMode('full'); setActiveTab('azkars'); };

  const renderActions = (sectionKey: string) => (
     <div className="flex gap-2">
       <button onClick={() => toggleSectionFeature(sectionKey, 'plan')} className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-500 rounded-xl font-bold text-xs hover:bg-purple-500/20 transition-all border border-purple-500/20"><Calculator size={16} /><span className="hidden sm:inline">План</span></button>
       <button onClick={() => setShowAiChat(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-500 rounded-xl font-bold text-xs hover:bg-blue-500/20 transition-all border border-blue-500/20"><HelpCircle size={16} /><span className="hidden sm:inline">Задать вопрос</span><span className="sm:hidden">?</span></button>
       {sectionKey !== 'fiqh' && sectionKey !== 'surah' && sectionKey !== 'azkars' && sectionKey !== 'dua' && (
        <button onClick={() => toggleSectionFeature(sectionKey, 'quiz')} className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl font-bold text-xs hover:bg-emerald-500/20 transition-all border border-emerald-500/20"><ClipboardList size={16} /><span className="hidden sm:inline">Пройти тест</span><span className="sm:hidden">Тест</span></button>
       )}
     </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme.bg} selection:bg-emerald-500/30 font-sans overflow-x-hidden relative`}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className={`absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[140px] opacity-10 ${isDarkMode ? 'bg-emerald-600' : 'bg-emerald-300'}`} />
        <div className={`absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[140px] opacity-10 ${isDarkMode ? 'bg-blue-600' : 'bg-blue-200'}`} />
        <div className={`absolute inset-0 opacity-[0.03] ${isDarkMode ? 'invert' : ''}`} style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/arabic-bazazz.png")` }} />
      </div>

      <header className="relative z-50 flex justify-between items-center p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0">
            <MadrasaLogo size={22} />
          </div>
          <span className="font-bold text-sm md:text-lg tracking-tight leading-tight">Учебная платформа Медресе</span>
        </div>
        <div className="flex gap-2">
           <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowDevInfo(true)} className={`p-2.5 rounded-xl border flex items-center gap-2 ${isDarkMode ? 'bg-pink-500/10 border-pink-500/30 text-pink-500' : 'bg-pink-50 border-pink-200 text-pink-700'}`}><Gift size={20} /><span className="hidden sm:inline text-xs font-bold uppercase">Подарок</span></motion.button>
           <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowAiChat(true)} className={`p-2.5 rounded-xl border flex items-center gap-2 ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}><Sparkles size={20} /><span className="hidden sm:inline text-xs font-bold uppercase">AI-Помощник</span></motion.button>
           <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowSettings(true)} className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-[#111] border-[#333] text-gray-400' : 'bg-white border-gray-200 text-gray-600'}`}><Settings size={20} /></motion.button>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-32">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className={`p-6 sm:p-8 md:p-10 rounded-[32px] border ${isDarkMode ? 'bg-gradient-to-br from-[#151515] to-[#0a0a0a] border-white/5' : 'bg-white border-emerald-100'} relative overflow-hidden text-center shadow-2xl`}>
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none"><Quote size={150} /></div>
                  <div className="relative z-10">
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{
                        duration: 2.5,
                        ease: "easeInOut",
                        repeat: Infinity,
                      }}
                      className="mb-4 inline-block"
                    >
                      <BookMarked className="text-emerald-500" size={48} />
                    </motion.div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-6 leading-tight tracking-tight">Ваш путь к знаниям <br className="hidden sm:block"/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 drop-shadow-sm block sm:inline mt-2 sm:mt-0">в Медресе Дуба-Юрт</span></h1>
                    <div className={`relative p-5 sm:p-6 md:p-8 rounded-2xl mb-6 max-w-xl mx-auto text-left ${isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-white/60 border border-emerald-100'} backdrop-blur-sm`}>
                        <Quote className="absolute -top-3 -left-1 text-emerald-500 fill-emerald-500" size={24} />
                        <p className={`text-base sm:text-lg md:text-xl font-serif italic leading-relaxed tracking-wide ${isDarkMode ? 'text-emerald-100' : 'text-slate-800'}`}>Здесь собраны все уроки, которые вы проходите в медресе. Вы можете повторять их дома, слушать правильное чтение и проверять себя с помощью тестов.</p>
                        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-4 items-center">
                            <button onClick={generatePlan} className="flex items-center gap-2 px-5 py-3 bg-emerald-500 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">{isGeneratingPlan ? <Sparkles size={16} className="animate-spin" /> : <CalendarCheck size={16} />}{isGeneratingPlan ? "Генерация..." : "Создать план обучения"}</button>
                            {studyPlan && <span className="text-xs opacity-60">План обновлен!</span>}
                        </div>
                        <AnimatePresence>{studyPlan && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-6 bg-black/20 p-4 rounded-xl text-left relative">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="text-emerald-400 font-bold flex items-center gap-2 text-sm"><Sparkles size={14}/> Твой план на сегодня:</h4>
                                <button onClick={() => setStudyPlan(null)} className="opacity-40 hover:opacity-100 transition-opacity"><XCircle size={18} /></button>
                            </div>
                            <ul className="space-y-2">{Array.isArray(studyPlan) && studyPlan.map((task, idx) => (<li key={idx} className="flex items-start gap-2 text-sm opacity-90"><CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" /><span>{typeof task === 'string' ? task : JSON.stringify(task)}</span></li>))}</ul>
                        </motion.div>)}</AnimatePresence>
                    </div>
                  </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                <CategoryCard title="Азкары" desc="Утренние и вечерние защиты" icon={<Sunrise size={24} />} color="orange" isVisionMode={isVisionMode} isDarkMode={isDarkMode} onClick={handleHomeAzkarClick} />
                <CategoryCard title="Суры" desc="Ад-Духьа — Ан-Нас" icon={<BookOpen size={24} />} color="emerald" isVisionMode={isVisionMode} isDarkMode={isDarkMode} onClick={() => setActiveTab('surah')} />
                <CategoryCard title="ДуӀа" desc="На разные случаи жизни" icon={<DuaIcon size={32} />} color="blue" isVisionMode={isVisionMode} isDarkMode={isDarkMode} onClick={() => setActiveTab('dua')} />
                <CategoryCard title="ФикъхӀ" desc="Правила поклонения" icon={<FiqhIcon size={40} />} color="purple" isVisionMode={isVisionMode} isDarkMode={isDarkMode} onClick={() => setActiveTab('fiqh')} />
                <CategoryCard title="Таджвид" desc="Искусство чтения" icon={<TajweedIcon size={24} />} color="pink" isVisionMode={isVisionMode} isDarkMode={isDarkMode} onClick={() => setActiveTab('tajweed')} />
                <CategoryCard title="Тасбих" desc="Электронные четки" icon={<TasbihIcon size={32} />} color="cyan" isVisionMode={isVisionMode} isDarkMode={isDarkMode} onClick={() => setActiveTab('tasbih')} />
              </div>
            </motion.div>
          )}

          {activeTab === 'azkars' && (
            <SectionWrapper title={azkarMode === 'madrasa' ? "Уроки Медресе" : "Азкары (Полный список)"} onBack={() => setActiveTab('home')} action={renderActions('azkars')}>
              <AzkarSection theme={theme} isDarkMode={isDarkMode} mode={azkarMode} showQuiz={activeSectionState.azkars.quiz} showPlan={activeSectionState.azkars.plan} setShowPlan={() => toggleSectionFeature('azkars', 'plan')} apiKey={userApiKey} onOpenQuiz={() => setActiveQuiz('azkars')} onOpenSelfTest={() => setSelfTestData({ title: "Самопроверка: Азкары", data: [...ALL_MORNING_AZKARS.map((a, i) => ({ question: `Утренний азкар №${i + 1}`, answer: a.ar! })), ...ALL_EVENING_AZKARS.map((a, i) => ({ question: `Вечерний азкар №${i + 1}`, answer: a.ar! }))] })} isAdmin={isAdminMode} fontScale={fontScale} />
            </SectionWrapper>
          )}

          {activeTab === 'surah' && (
            <SectionWrapper title="Суры Къуръана" onBack={() => setActiveTab('home')} action={renderActions('surah')}>
              <SurahSection theme={theme} isDarkMode={isDarkMode} showQuiz={activeSectionState.surah.quiz} showPlan={activeSectionState.surah.plan} setShowPlan={() => toggleSectionFeature('surah', 'plan')} apiKey={userApiKey} onOpenQuiz={() => setActiveQuiz('surah')} onOpenSelfTest={() => setSelfTestData({ title: "Самопроверка: Суры", data: SURAHS_DATA.map(s => ({ question: `Сура "${s.name!}"`, answer: s.ar! })) })} isAdmin={isAdminMode} fontScale={fontScale} />
            </SectionWrapper>
          )}

          {activeTab === 'dua' && (
            <SectionWrapper title="ДуӀа" onBack={() => setActiveTab('home')} action={renderActions('dua')}>
              <DuaSection theme={theme} isDarkMode={isDarkMode} showQuiz={activeSectionState.dua.quiz} showPlan={activeSectionState.dua.plan} setShowPlan={() => toggleSectionFeature('dua', 'plan')} apiKey={userApiKey} onOpenQuiz={() => setActiveQuiz('dua')} onOpenSelfTest={() => setSelfTestData({ title: "Самопроверка: ДуӀа", data: DUA_DATA.map(d => ({ question: d.title!, answer: d.content && d.ar ? `${d.content}\n\n${d.ar}` : d.ar || d.content! })) })} isAdmin={isAdminMode} fontScale={fontScale} />
            </SectionWrapper>
          )}
          
          {activeTab === 'fiqh' && (
            <SectionWrapper title="ФикъхӀ" onBack={() => setActiveTab('home')} action={renderActions('fiqh')}>
              <FiqhSection theme={theme} isDarkMode={isDarkMode} showPlan={activeSectionState.fiqh.plan} setShowPlan={() => toggleSectionFeature('fiqh', 'plan')} onOpenQuiz={() => setActiveQuiz('fiqh')} onOpenSelfTest={() => setSelfTestData({ title: "Самопроверка: ФикъхӀ", data: FIQH_DATA.map(item => ({ question: item.question, answer: item.answer })) })} fontScale={fontScale} />
            </SectionWrapper>
          )}

          {activeTab === 'tajweed' && (
             <SectionWrapper title="Таджвид" onBack={() => setActiveTab('home')} action={renderActions('tajweed')}>
               <TajweedSection theme={theme} isDarkMode={isDarkMode} showQuiz={activeSectionState.tajweed.quiz} showPlan={activeSectionState.tajweed.plan} setShowPlan={() => toggleSectionFeature('tajweed', 'plan')} apiKey={userApiKey} onOpenQuiz={() => setActiveQuiz('tajweed')} onOpenSelfTest={() => setSelfTestData({ title: "Самопроверка: Таджвид", data: TAJWEED_DATA.map(t => ({ question: t.title!, answer: t.content! })) })} fontScale={fontScale} />
             </SectionWrapper>
          )}

          {activeTab === 'tasbih' && <SectionWrapper title="Тасбих" onBack={() => setActiveTab('home')}><TasbihSection theme={theme} isDarkMode={isDarkMode}/></SectionWrapper>}
        </AnimatePresence>
      </main>

      <nav className={`fixed bottom-6 left-1/2 -translate-x-1/2 ${isDarkMode ? 'bg-[#111]/90' : 'bg-white/90'} backdrop-blur-lg border ${isDarkMode ? 'border-white/10' : 'border-slate-200'} px-4 py-3 rounded-3xl flex items-center justify-between gap-1 sm:gap-6 shadow-2xl z-[100] w-[90%] max-w-[400px]`}>
        <NavIcon icon={<Home size={26} />} active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <NavIcon icon={<Scroll size={26} />} active={activeTab === 'azkars' && azkarMode === 'full'} onClick={handleNavAzkarClick} />
        
        <div className="mx-1">
          <NavIcon icon={isDarkMode ? <Sun size={26} /> : <Moon size={26} />} active={false} onClick={toggleTheme} />
        </div>

        <NavIcon icon={<BookOpen size={26} />} active={activeTab === 'surah'} onClick={() => setActiveTab('surah')} />
        <NavIcon icon={<Timer size={26} />} active={activeTab === 'tasbih'} onClick={() => setActiveTab('tasbih')} />
      </nav>

      <AnimatePresence>{showAiChat && (<AiChatModal onClose={() => setShowAiChat(false)} theme={theme} isDarkMode={isDarkMode} apiKey={userApiKey} />)}</AnimatePresence>
      <AnimatePresence>{activeQuiz && (<UniversalQuizModal onClose={() => setActiveQuiz(null)} theme={theme} isDarkMode={isDarkMode} section={activeQuiz} />)}</AnimatePresence>
      <AnimatePresence>{selfTestData && <SelfTestModal onClose={() => setSelfTestData(null)} theme={theme} isDarkMode={isDarkMode} title={selfTestData.title} data={selfTestData.data} />}</AnimatePresence>

      <AnimatePresence>
        {showDevInfo && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={`${theme.card} w-full max-w-md p-8 rounded-[32px] relative shadow-2xl text-center overflow-hidden`}>
               <div className={`absolute inset-0 opacity-10 ${isDarkMode ? 'bg-gradient-to-br from-pink-500/20 to-transparent' : 'bg-gradient-to-br from-pink-500/10 to-transparent'}`} />
               <button onClick={() => setShowDevInfo(false)} className="absolute top-6 right-6 opacity-40 hover:opacity-100 z-10"><XCircle size={28} /></button>
               
               <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl rotate-3 flex items-center justify-center text-white shadow-xl shadow-pink-500/30 mb-6">
                      <Gift size={40} strokeWidth={1.5} />
                  </div>
                  
                  <h3 className="text-xl font-black mb-1">Джамулаев Мовсар <br/> Саид-Хамзатович</h3>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-6 ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>Разработчик веб и мобильных приложений</p>
                  
                  <div className={`w-full p-5 rounded-2xl mb-6 border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'}`}>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Контакты для связи</p>
                      <a href="tel:89626554066" className="text-2xl font-black tracking-tight mb-3 block hover:text-emerald-500 transition-colors">8 (962) 655-40-66</a>
                      <div className="flex justify-center gap-2">
                          {['WhatsApp', 'BiP', 'Max'].map(messenger => (
                              <span key={messenger} className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase ${isDarkMode ? 'bg-white/10' : 'bg-white shadow-sm border border-slate-100'}`}>{messenger}</span>
                          ))}
                      </div>
                  </div>

                  <div className={`text-sm leading-relaxed p-4 rounded-xl border border-dashed ${isDarkMode ? 'border-white/10 text-white/60' : 'border-slate-200 text-slate-500'}`}>
                      "Если вы хотите создать на основе своей книги веб-версию или нативное приложение для смартфонов (Android / iOS) — свяжитесь со мной."
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={`${theme.card} w-full max-w-md p-8 rounded-[32px] relative shadow-2xl`}>
              <button onClick={() => setShowSettings(false)} className="absolute top-6 right-6 opacity-40 hover:opacity-100"><XCircle size={28} /></button>
              <div className="flex items-center gap-3 mb-6"> <Settings className="text-emerald-500" /> <h3 className="text-xl font-bold">Настройки</h3> </div>
              <div className="space-y-6">
                <div className={`p-4 rounded-2xl flex items-center justify-between border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-3"><div className={`p-2 rounded-xl ${isVisionMode ? 'bg-blue-500 text-white' : 'bg-gray-500/10 text-gray-500'}`}><Eye size={20} /></div><div><h4 className="font-bold text-sm">Vision Mode</h4><p className="text-[10px] opacity-60">Glassmorphism UI style</p></div></div>
                  <button onClick={toggleVisionMode} className={`w-12 h-7 rounded-full p-1 transition-colors ${isVisionMode ? 'bg-blue-500' : 'bg-gray-500/30'}`}><motion.div layout className="w-5 h-5 bg-white rounded-full shadow-sm" animate={{ x: isVisionMode ? 20 : 0 }}/></button>
                </div>

                <div className={`p-4 rounded-2xl flex items-center justify-between border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                   <div className="flex items-center gap-3"><div className={`p-2 rounded-xl ${isAdminMode ? 'bg-red-500 text-white' : 'bg-gray-500/10 text-gray-500'}`}><UserCog size={20} /></div><div><h4 className="font-bold text-sm">Режим Админа</h4><p className="text-[10px] opacity-60">Добавление аудио</p></div></div>
                   <button onClick={() => setIsAdminMode(!isAdminMode)} className={`w-12 h-7 rounded-full p-1 transition-colors ${isAdminMode ? 'bg-red-500' : 'bg-gray-500/30'}`}><motion.div layout className="w-5 h-5 bg-white rounded-full shadow-sm" animate={{ x: isAdminMode ? 20 : 0 }}/></button>
                </div>

                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center gap-3 mb-3"><div className="p-2 rounded-xl bg-purple-500/10 text-purple-500"><Type size={20} /></div><div><h4 className="font-bold text-sm">Размер текста</h4></div></div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setFontScale(s => Math.max(0.7, s - 0.1))} className="p-2 bg-white/10 rounded-lg hover:bg-white/20"><Type size={14} /></button>
                        <div className="flex-1 h-2 bg-gray-500/20 rounded-full overflow-hidden"><motion.div className="h-full bg-purple-500" animate={{ width: `${(fontScale - 0.7) / 0.8 * 100}%` }} /></div>
                        <button onClick={() => setFontScale(s => Math.min(1.5, s + 0.1))} className="p-2 bg-white/10 rounded-lg hover:bg-white/20"><Type size={20} /></button>
                    </div>
                </div>

                <div><label className="text-xs font-black uppercase opacity-50 mb-2 block">Gemini/DeepSeek API Key</label><input type="password" value={userApiKey} onChange={(e) => setUserApiKey(e.target.value)} placeholder="Введите ваш API ключ..." className={`w-full p-4 rounded-2xl border ${theme.input} text-sm focus:ring-2 ring-emerald-500 outline-none`} /><p className="text-[10px] opacity-40 mt-2">Ключ используется только в этом браузере для работы ИИ-функций. Поддерживается Google Gemini и DeepSeek.</p></div>
                <button onClick={() => setShowSettings(false)} className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest ${theme.buttonPrimary}`}>Сохранить изменения</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;

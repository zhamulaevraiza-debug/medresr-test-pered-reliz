

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, Calculator, Bot, Send, Sparkles, ClipboardList, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { Theme, PlanData, QuizData, Option, ChatMessage, FiqhItem } from '../types';
import { chatWithMentor } from '../services/geminiService';
import { FIQH_DATA, SURAHS_DATA, TAJWEED_DATA, QUIZ_DATA } from '../data';

export const SectionPlanModal = ({ onClose, theme, isDarkMode, planData }: { onClose: () => void, theme: Theme, isDarkMode: boolean, planData: PlanData }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`${theme.card} w-full max-w-md p-6 rounded-3xl relative shadow-2xl`}>
         <button onClick={onClose} className="absolute top-6 right-6 opacity-50"><XCircle /></button>
         <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calculator className="text-emerald-500"/> 
            {planData.title}
         </h3>
         <div className="space-y-4">
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                <div className="flex justify-between mb-2 opacity-70 text-sm"><span>Объем:</span><span className="font-bold">{planData.total}</span></div>
                <div className="flex justify-between mb-2 opacity-70 text-sm"><span>Срок:</span><span className="font-bold">{planData.period}</span></div>
                <div className="h-px bg-current opacity-10 my-3"/>
                <div className="flex justify-between text-lg font-bold text-emerald-500"><span>Цель:</span><span>{planData.weekly}</span></div>
            </div>
            <div className="text-sm opacity-80 leading-relaxed">
                <p className="mb-2">💡 <strong>Совет учителя:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                    {planData.advice.map((tip, i) => <li key={i}>{tip}</li>)}
                </ul>
            </div>
            <button onClick={onClose} className={`w-full py-3 rounded-xl font-bold mt-2 ${theme.buttonPrimary}`}>Принято, ин ша Аллах1</button>
         </div>
      </motion.div>
    </div>
  )
}

export const InlineQuiz = ({ theme, quizData }: { theme: Theme, quizData: QuizData }) => {
  const [selected, setSelected] = useState<Option | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleSelect = (option: Option) => {
      if (isAnswered) return;
      setSelected(option);
      setIsAnswered(true);
  };

  return (
    <div className={`${theme.card} p-6 rounded-[32px] border-2 mb-6 border-emerald-500/20`}>
        <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500"><ClipboardList size={20} /></div>
            <h3 className="font-bold text-lg">Мини-тест</h3>
        </div>
        <p className="text-lg font-medium mb-6 leading-snug">{quizData.text}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quizData.options.map((opt) => {
                let btnClass = `p-4 rounded-xl border-2 font-bold text-left text-sm sm:text-base transition-all duration-300 `;
                let animateProps: any = {};
                if (isAnswered) {
                    if (opt.isCorrect) {
                        btnClass += "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-[1.02]";
                        animateProps = { scale: [1, 1.02, 1] };
                    } else if (selected === opt) {
                        btnClass += "bg-red-500 border-red-500 text-white";
                        animateProps = { x: [0, -5, 5, -5, 5, 0] };
                    } else {
                        btnClass += "opacity-30 border-transparent bg-white/5";
                    }
                } else {
                    btnClass += "border-transparent bg-white/5 hover:bg-white/10 hover:border-white/10";
                }
                return (
                    <motion.button key={opt.id} onClick={() => handleSelect(opt)} className={btnClass} whileTap={!isAnswered ? { scale: 0.98 } : {}} animate={animateProps}>
                        {opt.text}
                    </motion.button>
                )
            })}
        </div>
    </div>
  );
};

export const UniversalQuizModal = ({ onClose, theme, isDarkMode, section }: { onClose: () => void, theme: Theme, isDarkMode: boolean, section: string }) => {
  const [questions, setQuestions] = useState<Array<{ questionText: string, options: string[], correctIndex: number, isArabic?: boolean }>>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const isFiqh = section === 'fiqh';

  useEffect(() => {
    let generatedQuiz: Array<{ questionText: string, options: string[], correctIndex: number, isArabic?: boolean }> = [];
    
    if (section === 'fiqh') {
        const shuffledItems = [...FIQH_DATA].sort(() => 0.5 - Math.random());
        generatedQuiz = shuffledItems.map(item => {
            const others = FIQH_DATA.filter(i => i.id !== item.id);
            const distractors = others.sort(() => 0.5 - Math.random()).slice(0, 3).map(i => i.answer);
            const allOptions = [...distractors, item.answer].sort(() => 0.5 - Math.random());
            return {
                questionText: item.question,
                options: allOptions,
                correctIndex: allOptions.indexOf(item.answer)
            };
        });
    } else if (section === 'surah') {
        const shuffledItems = [...SURAHS_DATA].sort(() => 0.5 - Math.random());
        generatedQuiz = shuffledItems.map(item => {
            const others = SURAHS_DATA.filter(i => i.name !== item.name);
            // If we have translations, use them. Otherwise use Arabic snippet identification
            if (item.ru) {
                const distractors = others.sort(() => 0.5 - Math.random()).slice(0, 3).map(i => i.ru || "");
                const allOptions = [...distractors, item.ru || ""].sort(() => 0.5 - Math.random());
                return {
                    questionText: `Как переводится сура "${item.name}"?`,
                    options: allOptions,
                    correctIndex: allOptions.indexOf(item.ru || "")
                };
            } else {
                // Fallback: Identify Surah from Arabic snippet (first few words)
                // Remove Basmala for clearer snippet
                const basmala = "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ";
                let snippet = item.ar?.replace(basmala, "").trim().split(" ").slice(0, 5).join(" ") + "..." || "";
                
                const distractors = others.sort(() => 0.5 - Math.random()).slice(0, 3).map(i => i.name || "");
                const allOptions = [...distractors, item.name || ""].sort(() => 0.5 - Math.random());
                
                return {
                    questionText: `Как называется эта сура?\n\n${snippet}`,
                    options: allOptions,
                    correctIndex: allOptions.indexOf(item.name || ""),
                    isArabic: true
                };
            }
        });
    } else if (section === 'tajweed') {
         const shuffledItems = [...TAJWEED_DATA].sort(() => 0.5 - Math.random());
         generatedQuiz = shuffledItems.map(item => {
            const others = TAJWEED_DATA.filter(i => i.title !== item.title);
            const distractors = others.sort(() => 0.5 - Math.random()).slice(0, 3).map(i => i.content || "");
            const allOptions = [...distractors, item.content || ""].sort(() => 0.5 - Math.random());
            return {
                questionText: `${item.title}?`,
                options: allOptions,
                correctIndex: allOptions.indexOf(item.content || "")
            };
         });
    } else {
        // Fallback for Azkars and Dua using QUIZ_DATA single question
        const q = QUIZ_DATA[section];
        if (q) {
            generatedQuiz = [{
                questionText: q.text,
                options: q.options.map(o => o.text),
                correctIndex: q.options.findIndex(o => o.isCorrect)
            }];
        }
    }

    setQuestions(generatedQuiz);
    setCurrentIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
  }, [section]);

  const handleAnswer = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    
    const isCorrect = index === questions[currentIndex].correctIndex;
    if (isCorrect) setScore(s => s + 1);

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(c => c + 1);
        setSelectedOption(null);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  if (questions.length === 0) return null;

  const currentQ = questions[currentIndex];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`${theme.card} w-full max-w-2xl p-6 rounded-[32px] relative shadow-2xl flex flex-col max-h-[90vh]`}>
         <button onClick={onClose} className="absolute top-6 right-6 text-emerald-500 hover:text-emerald-600 transition-colors z-10"><XCircle size={32} /></button>
         
         {!showResult ? (
           <div className="flex flex-col h-full overflow-y-auto no-scrollbar">
             <div className="mb-6 pr-12">
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-xl font-bold flex items-center gap-2 capitalize">
                    {isFiqh ? (
                        <div className="p-2 bg-purple-500 rounded-xl text-white shadow-lg shadow-purple-500/30">
                            <ClipboardList size={20}/>
                        </div>
                    ) : (
                        <ClipboardList className="text-emerald-500"/> 
                    )}
                    {isFiqh ? "ФикъхӀ: Полный тест" : `Тест: ${section}`}
                 </h3>
                 <span className="text-sm font-black opacity-50">{currentIndex + 1} / {questions.length}</span>
               </div>
               <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <motion.div 
                    className={`${isFiqh ? 'bg-purple-500' : 'bg-emerald-500'} h-2 rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                  />
               </div>
             </div>

             <div className="mb-8">
               {isFiqh ? (
                 <div className={`relative p-6 sm:p-8 rounded-[32px] mb-8 overflow-hidden ${isDarkMode ? 'bg-gradient-to-br from-purple-900/30 to-purple-900/10 border border-purple-500/20' : 'bg-gradient-to-br from-purple-50 to-white border border-purple-100'} shadow-lg`}>
                    <div className={`absolute top-0 left-0 w-1.5 h-full bg-purple-500`} />
                    <h4 className={`text-xl md:text-2xl font-bold leading-relaxed relative z-10 ${isDarkMode ? 'text-purple-100' : 'text-purple-900'}`}>{currentQ.questionText}</h4>
                    <div className="absolute top-[-10px] right-[-10px] opacity-5 text-purple-500 rotate-12"><HelpCircle size={100} /></div>
                 </div>
               ) : (
                 <h4 
                    className={`text-lg md:text-xl font-bold leading-relaxed mb-6 whitespace-pre-wrap ${currentQ.isArabic ? 'font-serif text-2xl text-center' : ''}`}
                    dir={currentQ.isArabic ? 'rtl' : 'ltr'}
                 >
                    {currentQ.questionText}
                 </h4>
               )}
               
               <div className="grid gap-3">
                 {currentQ.options.map((opt, idx) => {
                   let btnClass = "";
                   const isSelected = selectedOption === idx;
                   const isCorrect = idx === currentQ.correctIndex;
                   
                   if (isFiqh) {
                      btnClass = `p-5 rounded-2xl border-2 text-left text-base transition-all duration-300 font-medium relative overflow-hidden `;
                      if (selectedOption !== null) {
                        if (isCorrect) btnClass += "bg-emerald-500 border-emerald-500 text-white shadow-lg scale-[1.01] z-10";
                        else if (isSelected) btnClass += "bg-red-500 border-red-500 text-white shadow-lg opacity-80";
                        else btnClass += "opacity-40 border-transparent bg-white/5 blur-[1px]";
                      } else {
                        btnClass += isDarkMode 
                            ? "border-purple-500/20 bg-purple-900/10 hover:bg-purple-900/20 hover:border-purple-500/40 text-purple-100" 
                            : "border-purple-100 bg-white hover:bg-purple-50 hover:border-purple-200 text-slate-700 shadow-sm hover:shadow-md";
                      }
                   } else {
                       btnClass = `p-4 rounded-xl border-2 text-left text-sm transition-all duration-300 `;
                       if (selectedOption !== null) {
                         if (isCorrect) btnClass += "bg-emerald-500/20 border-emerald-500 text-emerald-500";
                         else if (isSelected) btnClass += "bg-red-500/20 border-red-500 text-red-500";
                         else btnClass += "opacity-50 border-transparent bg-white/5";
                       } else {
                         btnClass += "border-transparent bg-white/5 hover:bg-white/10 hover:border-emerald-500/30";
                       }
                   }

                   return (
                     <button key={idx} onClick={() => handleAnswer(idx)} className={btnClass} disabled={selectedOption !== null}>
                       {opt}
                     </button>
                   );
                 })}
               </div>
             </div>
           </div>
         ) : (
           <div className="flex flex-col items-center justify-center text-center py-10">
             <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white mb-6 shadow-xl ${isFiqh ? 'bg-purple-500 shadow-purple-500/30' : 'bg-emerald-500 shadow-emerald-500/30'}`}>
               <CheckCircle size={48} />
             </div>
             <h2 className="text-3xl font-black mb-2">Результат</h2>
             <p className={`text-6xl font-black mb-2 ${isFiqh ? 'text-purple-500' : 'text-emerald-500'}`}>{score}<span className="text-2xl opacity-30 text-current">/{questions.length}</span></p>
             <p className="text-sm opacity-50 uppercase tracking-widest font-bold mb-8">Правильных ответов</p>
             
             <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                   <div className={`${isFiqh ? 'text-purple-500' : 'text-emerald-500'} font-black text-xl`}>{Math.round((score / questions.length) * 100)}%</div>
                   <div className="text-[10px] opacity-50 uppercase">Успешность</div>
                </div>
                <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                   <div className="text-red-500 font-black text-xl">{questions.length - score}</div>
                   <div className="text-[10px] opacity-50 uppercase">Ошибок</div>
                </div>
             </div>
             
             <button onClick={onClose} className={`mt-8 px-8 py-4 rounded-2xl font-bold uppercase tracking-widest ${isFiqh ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20' : theme.buttonPrimary}`}>Завершить</button>
           </div>
         )}
      </motion.div>
    </div>
  );
}

export const AiChatModal = ({ onClose, theme, isDarkMode, apiKey }: { onClose: () => void, theme: Theme, isDarkMode: boolean, apiKey?: string }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'ai', text: 'Ассаляму алейкум! Я ваш помощник. Задайте вопрос по текущему уроку.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);
    try {
      const response = await chatWithMentor(userMsg, apiKey);
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Ошибка. Проверьте API ключ.' }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`${theme.card} w-full max-w-lg h-[600px] rounded-[32px] relative shadow-2xl flex flex-col overflow-hidden`}>
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-emerald-500/5">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white"><Bot size={20} /></div>
             <div><h3 className="font-bold">AI-Наставник</h3><p className="text-[10px] opacity-50 uppercase tracking-wider">Всегда на связи</p></div>
           </div>
           <button onClick={onClose} className="opacity-40 hover:opacity-100"><XCircle /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar" ref={scrollRef}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-emerald-500 text-white rounded-tr-sm' : `${isDarkMode ? 'bg-white/10' : 'bg-slate-100'} rounded-tl-sm`}`}>{msg.text}</div>
            </div>
          ))}
          {loading && <div className="flex justify-start"><div className={`p-4 rounded-2xl rounded-tl-sm ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`}><Sparkles size={16} className="animate-spin text-emerald-500" /></div></div>}
        </div>
        <div className="p-4 border-t border-white/5 bg-white/5 backdrop-blur-md">
          <div className="relative">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Задайте вопрос..." className={`w-full pl-5 pr-12 py-4 rounded-2xl border-none outline-none ${isDarkMode ? 'bg-black/30 text-white placeholder-white/30' : 'bg-white text-slate-900 placeholder-slate-400'}`} />
            <button onClick={handleSend} disabled={loading || !input.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50"><Send size={18} /></button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const SelfTestModal = ({ onClose, theme, isDarkMode, title, data }: { onClose: () => void, theme: Theme, isDarkMode: boolean, title: string, data: { question: string, answer: string }[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [knownCount, setKnownCount] = useState(0);
  const [unknownCount, setUnknownCount] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState<'idle' | 'known' | 'unknown'>('idle');

  const [questions] = useState(() => [...data].sort(() => 0.5 - Math.random()));

  const handleKnown = () => {
    setKnownCount(c => c + 1);
    setFeedback('known');
  };

  const handleUnknown = () => {
    setUnknownCount(c => c + 1);
    setFeedback('unknown');
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setFeedback('idle');
    } else {
      setShowResult(true);
    }
  };

  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`${theme.card} w-full max-w-lg p-6 rounded-[32px] relative shadow-2xl flex flex-col max-h-[90vh]`}>
        <button onClick={onClose} className="absolute top-6 right-6 opacity-50 hover:opacity-100 z-10"><XCircle size={28} /></button>
        
        {!showResult ? (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="mb-6 pr-10 shrink-0">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-lg flex items-center gap-2"><Sparkles className="text-indigo-500" size={20}/> {title}</h3>
                 <span className="text-sm font-bold opacity-50">{currentIndex + 1} / {questions.length}</span>
               </div>
               <div className="w-full bg-gray-200/50 rounded-full h-2 dark:bg-gray-700/50 overflow-hidden">
                  <motion.div className="bg-indigo-500 h-full rounded-full" animate={{ width: `${((currentIndex) / questions.length) * 100}%` }} />
               </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center overflow-y-auto px-1 py-2 no-scrollbar">
               <AnimatePresence mode="wait">
                 {feedback === 'idle' && (
                   <motion.div key="question" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-between h-full w-full py-2">
                       
                       <div className={`flex-1 w-full flex flex-col items-center justify-center p-8 rounded-[32px] mb-6 border-4 border-double shadow-xl relative overflow-hidden ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-100' : 'bg-indigo-50 border-indigo-100 text-indigo-900'}`}>
                           <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50`} />
                           <div className="mb-4 opacity-50"><HelpCircle size={40} /></div>
                           <h4 className="text-xl md:text-2xl font-black leading-relaxed">{currentQuestion.question}</h4>
                       </div>

                       <div className="flex flex-col gap-3 w-full mt-auto shrink-0">
                          <motion.button whileTap={{ scale: 0.98 }} onClick={handleKnown} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition-colors">Я знаю</motion.button>
                          <motion.button whileTap={{ scale: 0.98 }} onClick={handleUnknown} className={`w-full py-4 border-2 rounded-2xl font-bold text-lg transition-colors ${isDarkMode ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'}`}>Я не знаю</motion.button>
                       </div>
                   </motion.div>
                 )}

                 {feedback === 'known' && (
                   <motion.div key="known" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex flex-col items-center justify-center h-full w-full">
                      <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-6 shadow-xl shadow-emerald-500/40">
                        <CheckCircle size={48} />
                      </div>
                      <h5 className="text-3xl font-black text-emerald-500 mb-2">Ма ша Аллах1!</h5>
                      <p className="text-base opacity-60 mb-10">Отличный результат, так держать!</p>
                      <button onClick={nextQuestion} className={`w-full py-4 rounded-2xl font-bold mt-auto uppercase tracking-widest ${theme.buttonPrimary}`}>Следующий вопрос</button>
                   </motion.div>
                 )}

                 {feedback === 'unknown' && (
                   <motion.div key="unknown" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex flex-col items-center justify-start h-full w-full pt-4">
                      <div className="w-16 h-16 bg-orange-100 dark:bg-orange-500/20 rounded-full flex items-center justify-center text-orange-500 mb-4">
                        <Sparkles size={32} />
                      </div>
                      <h5 className="text-xl font-bold mb-2">Знание — это свет</h5>
                      <p className="text-sm opacity-60 mb-6 leading-relaxed max-w-xs">Не расстраивайся. Прочитай ответ внимательно и постарайся запомнить:</p>
                      <div className={`p-5 rounded-2xl text-left w-full mb-6 leading-relaxed whitespace-pre-wrap shadow-inner ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                        {currentQuestion.answer}
                      </div>
                      <button onClick={nextQuestion} className={`w-full py-4 rounded-2xl font-bold mt-auto uppercase tracking-widest ${theme.buttonPrimary}`}>Следующий вопрос</button>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          </div>
        ) : (
           <div className="flex flex-col items-center justify-center text-center py-6 h-full">
             <div className="w-24 h-24 bg-gradient-to-tr from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white mb-6 shadow-xl">
               <ClipboardList size={40} />
             </div>
             <h2 className="text-3xl font-black mb-2">Итоги</h2>
             <p className="text-sm opacity-50 uppercase tracking-widest font-bold mb
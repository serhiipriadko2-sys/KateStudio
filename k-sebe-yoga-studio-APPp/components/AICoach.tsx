
import React, { useState, useRef, useEffect } from 'react';
import { getGeminiChatStream, getThinkingResponse, generateYogaImage, generateVeoVideo, editYogaImage, analyzeMedia, createMeditation, generateSpeech, VisionAnalysisResult, MeditationResult } from '../services/geminiService';
import { Send, Image as ImageIcon, Sparkles, Loader2, Upload, Maximize2, X, AlertTriangle, Lightbulb, Palette, CheckCircle2, AlertCircle, Info, ChevronRight, Headphones, Play, Pause, RefreshCw, Volume2, Brain, Film, Wand2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

type Mode = 'chat' | 'vision' | 'meditation' | 'create';
type CreateSubMode = 'gen' | 'veo' | 'edit';

// --- Components ---

const FormattedText = ({ text }: { text: string }) => {
  if (!text) return null;
  return (
    <div className="space-y-3 text-sm leading-relaxed whitespace-pre-wrap">
       {text.split(/(\*\*.*?\*\*)/g).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
             return <strong key={j} className="font-semibold text-brand-dark">{part.slice(2, -2)}</strong>;
          }
          return <span key={j}>{part}</span>;
       })}
    </div>
  );
};

const AnalysisReport = ({ result }: { result: VisionAnalysisResult }) => {
    const getScoreColor = (score: number) => {
        if (score >= 8) return "text-emerald-500 bg-emerald-50 border-emerald-100";
        if (score >= 5) return "text-amber-500 bg-amber-50 border-amber-100";
        return "text-rose-500 bg-rose-50 border-rose-100";
    };

    const getStatusIcon = (status: string) => {
        if (status === 'Safe') return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
        if (status === 'Caution') return <AlertCircle className="w-5 h-5 text-amber-500" />;
        return <AlertTriangle className="w-5 h-5 text-rose-500" />;
    };

    return (
        <div className="bg-white rounded-[2rem] p-6 shadow-lg border border-stone-100 space-y-6 animate-in zoom-in-95 duration-500">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-2xl font-serif text-brand-text">{result.poseName}</h3>
                    <p className="text-sm text-stone-400 font-serif italic">{result.sanskritName}</p>
                    <div className="flex items-center gap-2 mt-2">
                        {getStatusIcon(result.safetyStatus)}
                        <span className="text-sm font-medium text-stone-500">
                            {result.safetyStatus === 'Safe' ? 'Безопасно' : result.safetyStatus === 'Caution' ? 'Есть риски' : 'Травмоопасно'}
                        </span>
                    </div>
                </div>
                <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl border ${getScoreColor(result.alignmentScore)}`}>
                    <span className="text-2xl font-bold">{result.alignmentScore}</span>
                    <span className="text-[10px] uppercase font-bold opacity-60">/10</span>
                </div>
            </div>

            {/* Anatomy & Energy Tags */}
            <div className="flex flex-wrap gap-2">
                {result.muscleGroups?.map((m, i) => (
                    <span key={i} className="px-2 py-1 bg-stone-100 text-stone-500 text-[10px] uppercase font-bold rounded-md">
                        {m}
                    </span>
                ))}
                {result.energyEffect && (
                    <span className="px-2 py-1 bg-brand-mint/30 text-brand-green text-[10px] uppercase font-bold rounded-md border border-brand-green/20">
                        {result.energyEffect}
                    </span>
                )}
            </div>

            {/* Bars */}
            <div className="space-y-4 pt-2">
                {/* Positives */}
                <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Сильные стороны
                    </h4>
                    <ul className="space-y-1">
                        {result.positivePoints.map((p, i) => (
                            <li key={i} className="text-sm text-stone-600 pl-4 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-emerald-400 before:rounded-full">
                                {p}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Corrections */}
                {result.corrections.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1">
                            <Info className="w-3 h-3" /> Зоны роста
                        </h4>
                        <ul className="space-y-1">
                            {result.corrections.map((p, i) => (
                                <li key={i} className="text-sm text-stone-600 pl-4 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-amber-400 before:rounded-full">
                                    {p}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Advice */}
            <div className="bg-brand-mint/20 rounded-xl p-4 border border-brand-green/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                     <Sparkles className="w-12 h-12" />
                </div>
                <h4 className="text-brand-green font-serif text-lg mb-2 flex items-center gap-2 relative z-10">
                    Совет Кати
                </h4>
                <p className="text-sm text-brand-text/80 leading-relaxed italic relative z-10">
                    "{result.expertAdvice}"
                </p>
            </div>
        </div>
    );
};

const SUGGESTED_PROMPTS = [
    "Как правильно делать Собаку мордой вниз?",
    "Посоветуй практику для больной спины",
    "Что такое Inside Flow?",
    "Составь план тренировок на месяц",
    "Расскажи про дыхание Уджайи"
];

const ART_STYLES = [
    { id: 'realistic', label: 'Реализм', promptMod: 'photorealistic, 8k, cinematic lighting' },
    { id: 'watercolor', label: 'Акварель', promptMod: 'soft watercolor painting, artistic, pastel colors' },
    { id: 'cyber', label: 'Кибер-Йога', promptMod: 'cyberpunk neon, futuristic city, glowing tattoos' },
    { id: 'oil', label: 'Масло', promptMod: 'oil painting on canvas, classical art style' },
];

export const AICoach: React.FC = () => {
  const { showToast } = useToast();
  const [mode, setMode] = useState<Mode>('chat');
  
  // Chat State
  const [messages, setMessages] = useState<{role: 'user'|'model', text: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Vision State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [visionPrompt, setVisionPrompt] = useState('Проверь мою технику выполнения');
  const [visionResult, setVisionResult] = useState<VisionAnalysisResult | string | null>(null);
  const [isVisionLoading, setIsVisionLoading] = useState(false);

  // Meditation State
  const [meditTopic, setMeditTopic] = useState('Снятие стресса после работы');
  const [meditDuration, setMeditDuration] = useState('5 минут');
  const [meditResult, setMeditResult] = useState<MeditationResult | null>(null);
  const [isMeditLoading, setIsMeditLoading] = useState(false);
  const [meditAudio, setMeditAudio] = useState<HTMLAudioElement | null>(null);
  const [isMeditPlaying, setIsMeditPlaying] = useState(false);
  const [isAudioGenLoading, setIsAudioGenLoading] = useState(false);

  // Create State (Art / Veo / Edit)
  const [createSubMode, setCreateSubMode] = useState<CreateSubMode>('gen');
  const [genPrompt, setGenPrompt] = useState('Девушка делает асану воин 2 на вершине горы');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [artStyle, setArtStyle] = useState(ART_STYLES[0]);
  const [genImage, setGenImage] = useState<string | null>(null);
  const [genVideo, setGenVideo] = useState<string | null>(null);
  const [isGenLoading, setIsGenLoading] = useState(false);
  
  // Edit State
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('Добавь горы на фон');

  useEffect(() => {
     return () => {
         if (meditAudio) {
             meditAudio.pause();
             meditAudio.src = "";
         }
     }
  }, [meditAudio]);

  const checkApiKey = () => {
      if (!process.env.API_KEY) {
          showToast("API ключ не настроен", "error");
          return false;
      }
      return true;
  };

  const handleSuggestionClick = (text: string) => {
      setChatInput(text);
  };

  // --- Chat Handlers (Streaming & Thinking) ---
  const handleChatSend = async (textOverride?: string) => {
    const textToSend = textOverride || chatInput;
    if (!textToSend.trim() || isChatLoading) return;
    if (!checkApiKey()) return;

    setChatInput('');
    setIsChatLoading(true);

    // Optimistic UI
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setMessages(prev => [...prev, { role: 'model', text: '' }]); 

    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

    try {
        if (isThinkingMode) {
            // Thinking Mode (2.5 Flash Thinking)
            const responseText = await getThinkingResponse(textToSend);
            setMessages(prev => {
                const newArr = [...prev];
                newArr[newArr.length - 1] = { role: 'model', text: responseText };
                return newArr;
            });
        } else {
            // Standard Streaming
            const stream = getGeminiChatStream(textToSend);
            let fullText = "";
            for await (const chunk of stream) {
                fullText += chunk;
                setMessages(prev => {
                    const newArr = [...prev];
                    newArr[newArr.length - 1] = { role: 'model', text: fullText };
                    return newArr;
                });
                if (chatEndRef.current) {
                    const parent = chatEndRef.current.parentElement;
                    if (parent && parent.scrollHeight - parent.scrollTop - parent.clientHeight < 200) {
                        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            }
        }
    } catch (e) {
        setMessages(prev => [...prev, { role: 'model', text: 'Ошибка соединения.' }]);
    } finally {
        setIsChatLoading(false);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  // --- Vision Handlers (Updated for Video) ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
          showToast("Файл слишком большой (макс 20MB)", "error");
          return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setVisionResult(null);
      
      // Auto prompt suggestion
      if (file.type.startsWith('video/')) {
          setVisionPrompt('Оцени ритм и плавность переходов');
      } else {
          setVisionPrompt('Проверь технику выполнения асаны');
      }
    }
  };

  const handleVisionAnalyze = async () => {
    if (!selectedFile || isVisionLoading) return;
    if (!checkApiKey()) return;

    setIsVisionLoading(true);
    setVisionResult(null);
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      const result = await analyzeMedia(base64String, selectedFile.type, visionPrompt);
      setVisionResult(result);
      setIsVisionLoading(false);
    };
    reader.readAsDataURL(selectedFile);
  };

  // --- Meditation Handlers ---
  const handleGenerateMeditation = async () => {
      if(!checkApiKey()) return;
      setIsMeditLoading(true);
      setMeditResult(null);
      if(meditAudio) {
          meditAudio.pause();
          setMeditAudio(null);
          setIsMeditPlaying(false);
      }

      const result = await createMeditation(meditTopic, meditDuration);
      setMeditResult(result);
      setIsMeditLoading(false);
  };

  const handlePlayMeditation = async () => {
      if(!meditResult) return;
      
      if (meditAudio) {
          if (isMeditPlaying) {
              meditAudio.pause();
              setIsMeditPlaying(false);
          } else {
              meditAudio.play();
              setIsMeditPlaying(true);
          }
          return;
      }

      setIsAudioGenLoading(true);
      const audioBase64 = await generateSpeech(meditResult.script);
      setIsAudioGenLoading(false);

      if (audioBase64) {
          const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
          audio.addEventListener('ended', () => setIsMeditPlaying(false));
          setMeditAudio(audio);
          audio.play();
          setIsMeditPlaying(true);
      } else {
          showToast("Не удалось создать аудио", "error");
      }
  };

  // --- Gen Handlers (Create Tab: Art, Veo, Edit) ---
  const handleEditFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setEditFile(file);
          setEditPreviewUrl(URL.createObjectURL(file));
          setGenImage(null);
      }
  };

  const handleCreateAction = async () => {
    if (!checkApiKey()) return;
    setIsGenLoading(true);
    setGenImage(null);
    setGenVideo(null);

    try {
        if (createSubMode === 'gen') {
            const fullPrompt = `${genPrompt}, ${artStyle.promptMod}`;
            const img = await generateYogaImage(fullPrompt, aspectRatio);
            setGenImage(img);
        } else if (createSubMode === 'veo') {
            const vidUrl = await generateVeoVideo(genPrompt);
            setGenVideo(vidUrl);
        } else if (createSubMode === 'edit') {
            if (!editFile) return;
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = (reader.result as string).split(',')[1];
                const img = await editYogaImage(base64, editFile.type, editPrompt);
                setGenImage(img);
                setIsGenLoading(false);
            };
            reader.readAsDataURL(editFile);
            return; 
        }
    } catch (e) {
        showToast("Ошибка генерации", "error");
    } finally {
        if (createSubMode !== 'edit') setIsGenLoading(false);
    }
  };

  if (!process.env.API_KEY) {
      return (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-stone-50 rounded-[2rem] border border-stone-100">
              <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif text-brand-text mb-2">Требуется API Ключ</h3>
              <p className="text-stone-500 max-w-sm">
                  Для работы AI функций необходимо добавить Google Gemini API ключ.
              </p>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-[2.5rem] shadow-xl shadow-stone-100/50 border border-stone-100 overflow-hidden">
      {/* Mode Switcher */}
      <div className="flex p-1.5 gap-1 bg-stone-50 border-b border-stone-100 mx-4 mt-4 rounded-2xl overflow-x-auto scrollbar-hide">
        {[
          { id: 'chat', label: 'Чат', icon: <Sparkles className="w-4 h-4" /> },
          { id: 'vision', label: 'Анализ', icon: <ImageIcon className="w-4 h-4" /> },
          { id: 'meditation', label: 'Медитация', icon: <Headphones className="w-4 h-4" /> },
          { id: 'create', label: 'Арт', icon: <Maximize2 className="w-4 h-4" /> },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id as Mode)}
            className={`flex-1 min-w-[90px] flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
              mode === m.id 
                ? 'bg-white text-brand-green shadow-sm ring-1 ring-black/5' 
                : 'text-stone-400 hover:text-stone-600 hover:bg-white/50'
            }`}
          >
            {m.icon}
            {m.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden relative">
        {/* --- CHAT MODE --- */}
        {mode === 'chat' && (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-0 animate-in fade-in duration-700">
                      <div className="w-16 h-16 bg-brand-mint/30 rounded-full flex items-center justify-center mb-4 text-brand-green">
                          <Sparkles className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-serif text-brand-text mb-2">Намасте!</h3>
                      <p className="text-stone-400 text-sm mb-8 max-w-xs">Я ваш персональный AI-помощник. Спросите меня о йоге, технике асан или философии.</p>
                      
                      <div className="flex flex-wrap justify-center gap-2 max-w-sm">
                          {SUGGESTED_PROMPTS.map((prompt, i) => (
                              <button 
                                key={i}
                                onClick={() => handleSuggestionClick(prompt)}
                                className="bg-stone-50 hover:bg-brand-green/10 hover:text-brand-green border border-stone-100 text-stone-500 text-xs px-4 py-2 rounded-full transition-colors"
                              >
                                  {prompt}
                              </button>
                          ))}
                      </div>
                  </div>
              )}

              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-brand-green text-white rounded-br-none' 
                      : 'bg-[#F8F9FA] text-stone-700 rounded-bl-none border border-stone-100'
                  }`}>
                    {msg.role === 'model' && msg.text === '' && isChatLoading && idx === messages.length - 1 ? (
                         <div className="flex gap-1.5 items-center py-2 px-1">
                             <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                             <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                             <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                         </div>
                    ) : (
                        <FormattedText text={msg.text} />
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            
            {/* Thinking Mode Toggle */}
            <div className="px-4 py-2 bg-white flex justify-end">
               <button 
                 onClick={() => setIsThinkingMode(!isThinkingMode)}
                 className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                     isThinkingMode ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm' : 'bg-stone-50 border-stone-100 text-stone-400'
                 }`}
               >
                   <Brain className={`w-3.5 h-3.5 ${isThinkingMode ? 'animate-pulse' : ''}`} />
                   Thinking Mode (Beta)
               </button>
            </div>

            <div className="p-4 bg-white">
              <div className={`relative flex items-center gap-2 bg-stone-50 rounded-full px-2 py-2 border transition-all ${isThinkingMode ? 'border-indigo-200 focus-within:ring-4 focus-within:ring-indigo-100' : 'border-stone-100 focus-within:ring-4 focus-within:ring-brand-green/5'}`}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                  placeholder={isThinkingMode ? "Задайте сложный вопрос..." : "Задайте вопрос..."}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-3 placeholder:text-stone-400"
                />
                <button 
                  onClick={() => handleChatSend()}
                  disabled={!chatInput.trim() || isChatLoading}
                  className={`p-2.5 text-white rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg ${isThinkingMode ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : 'bg-brand-green hover:bg-brand-green/90 shadow-brand-green/20'}`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- VISION MODE (Photo & Video) --- */}
        {mode === 'vision' && (
          <div className="h-full overflow-y-auto p-6 scrollbar-hide">
            <div className="text-center mb-6">
               <h3 className="text-xl font-serif text-brand-text mb-2">Анализ Техники</h3>
               <p className="text-sm text-stone-400">Загрузите фото или видео асаны, и я проверю технику.</p>
            </div>

            <div className="mb-6">
              {!previewUrl ? (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-stone-200 rounded-[2rem] cursor-pointer hover:bg-stone-50 hover:border-brand-green/30 transition-all group relative overflow-hidden">
                  <div className="absolute inset-0 bg-stone-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 flex flex-col items-center">
                      <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center text-stone-400 group-hover:scale-110 group-hover:text-brand-green transition-all mb-4">
                         <Upload className="w-8 h-8" />
                      </div>
                      <p className="text-sm text-stone-500 font-medium">Фото или Видео</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileSelect} />
                </label>
              ) : (
                <div className="relative rounded-[2rem] overflow-hidden border border-stone-100 bg-stone-900 group shadow-lg">
                   <button 
                     onClick={() => { setSelectedFile(null); setPreviewUrl(null); setVisionResult(null); setIsVisionLoading(false); }}
                     className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 z-20 backdrop-blur-md"
                   >
                     <X className="w-4 h-4" />
                   </button>
                   
                   {isVisionLoading && (
                      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-1 bg-brand-green shadow-[0_0_20px_rgba(87,167,115,1)] animate-[scan_2s_linear_infinite]"></div>
                          <div className="absolute inset-0 bg-brand-green/5"></div>
                          <div className="absolute bottom-6 left-0 right-0 text-center">
                             <span className="inline-block px-4 py-2 bg-black/60 backdrop-blur-md text-white text-xs font-bold uppercase rounded-full animate-pulse">
                                Изучаю биомеханику...
                             </span>
                          </div>
                      </div>
                   )}

                   {selectedFile?.type.startsWith('video/') ? (
                       <video src={previewUrl} className="w-full max-h-[400px] object-contain" controls />
                   ) : (
                       <img src={previewUrl} alt="Preview" className="w-full max-h-[400px] object-contain" />
                   )}
                </div>
              )}
            </div>

            {previewUrl && !visionResult && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                 <div className="relative">
                    <div className="absolute top-3 left-3 text-stone-400">
                        <Lightbulb className="w-4 h-4" />
                    </div>
                    <textarea
                        value={visionPrompt}
                        onChange={(e) => setVisionPrompt(e.target.value)}
                        className="w-full p-3 pl-10 bg-stone-50 rounded-2xl border border-stone-100 text-sm focus:outline-none focus:border-brand-green/50 resize-none transition-colors"
                        rows={2}
                        disabled={isVisionLoading}
                    />
                 </div>
                 
                 <button
                   onClick={handleVisionAnalyze}
                   disabled={isVisionLoading}
                   className="w-full py-4 bg-brand-green text-white rounded-xl font-medium hover:bg-brand-green/90 disabled:opacity-70 flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-green/20 hover:scale-[1.02] active:scale-95"
                 >
                   {isVisionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                   {isVisionLoading ? 'Идет анализ...' : 'Разобрать технику'}
                 </button>
              </div>
            )}

            {visionResult && (
              <div className="mt-8">
                 {typeof visionResult === 'string' ? (
                     <div className="p-6 bg-rose-50 rounded-[2rem] border border-rose-100 text-rose-800">
                         {visionResult}
                     </div>
                 ) : (
                     <AnalysisReport result={visionResult} />
                 )}
                 <button 
                    onClick={() => setVisionResult(null)}
                    className="w-full mt-4 py-3 text-stone-400 text-xs font-bold uppercase tracking-wider hover:text-stone-600 transition-colors"
                 >
                    Новый анализ
                 </button>
              </div>
            )}
          </div>
        )}

        {/* --- MEDITATION MODE --- */}
        {mode === 'meditation' && (
            <div className="h-full overflow-y-auto p-6 scrollbar-hide flex flex-col">
                <div className="text-center mb-6">
                    <h3 className="text-xl font-serif text-brand-text mb-2">Генератор Дзена</h3>
                    <p className="text-sm text-stone-400">Создайте персональную медитацию под ваше состояние.</p>
                </div>

                {!meditResult ? (
                    <div className="flex-1 flex flex-col justify-center space-y-6 animate-in fade-in">
                        <div className="space-y-2">
                             <label className="text-xs font-bold uppercase tracking-wider text-stone-400 ml-1">Тема / Намерение</label>
                             <textarea 
                                value={meditTopic}
                                onChange={(e) => setMeditTopic(e.target.value)}
                                className="w-full p-4 bg-stone-50 rounded-2xl border border-stone-100 text-sm focus:outline-none focus:border-brand-green/50 resize-none transition-colors h-24"
                                placeholder="Например: Снятие тревоги перед важной встречей..."
                             />
                        </div>
                        <div className="space-y-2">
                             <label className="text-xs font-bold uppercase tracking-wider text-stone-400 ml-1">Длительность</label>
                             <div className="flex gap-2">
                                {['5 минут', '10 минут', '20 минут'].map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setMeditDuration(d)}
                                        className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                                            meditDuration === d 
                                            ? 'bg-brand-green text-white shadow-md' 
                                            : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
                                        }`}
                                    >
                                        {d}
                                    </button>
                                ))}
                             </div>
                        </div>
                        <button
                            onClick={handleGenerateMeditation}
                            disabled={isMeditLoading}
                            className="w-full py-4 bg-brand-dark text-white rounded-xl font-medium hover:bg-black disabled:opacity-70 flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-[1.02] active:scale-95"
                        >
                            {isMeditLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-brand-yellow" />}
                            {isMeditLoading ? 'Создаю поток...' : 'Сгенерировать'}
                        </button>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col animate-in slide-in-from-bottom-8 duration-500">
                        <div className="bg-[#1a1a1a] text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[300px] mb-6">
                             {/* Visualizer BG */}
                             <div className={`absolute inset-0 bg-brand-green/20 blur-3xl transition-all duration-[2000ms] ${isMeditPlaying ? 'scale-150 opacity-100 animate-pulse' : 'scale-100 opacity-30'}`}></div>
                             
                             <div className="relative z-10 text-center mb-8">
                                 <h3 className="font-serif text-2xl mb-2">{meditResult.title}</h3>
                                 <p className="text-white/50 text-sm">Персональная практика • {meditResult.durationMin} мин</p>
                             </div>

                             <button 
                                onClick={handlePlayMeditation}
                                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95 relative z-10 ${
                                    isMeditPlaying ? 'bg-white text-brand-dark' : 'bg-brand-green text-white'
                                }`}
                             >
                                {isAudioGenLoading ? (
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                ) : isMeditPlaying ? (
                                    <Pause className="w-8 h-8" />
                                ) : (
                                    <Play className="w-8 h-8 pl-1" />
                                )}
                             </button>

                             {isMeditPlaying && <p className="text-white/30 text-xs mt-6 animate-pulse">Голос генерируется AI...</p>}
                        </div>

                        <div className="bg-stone-50 rounded-[2rem] p-6 border border-stone-100 flex-1 overflow-y-auto">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4">Текст практики</h4>
                            <div className="prose prose-sm text-stone-600 leading-relaxed whitespace-pre-wrap font-serif">
                                {meditResult.script}
                            </div>
                        </div>

                        <button 
                            onClick={() => {setMeditResult(null); if(meditAudio) { meditAudio.pause(); setIsMeditPlaying(false); }}}
                            className="mt-4 py-3 text-stone-400 text-xs font-bold uppercase tracking-wider hover:text-stone-600 transition-colors"
                        >
                            Создать новую
                        </button>
                    </div>
                )}
            </div>
        )}

        {/* --- CREATE MODE (Art, Veo, Edit) --- */}
        {mode === 'create' && (
          <div className="h-full overflow-y-auto p-6 scrollbar-hide">
             <div className="text-center mb-6">
               <h3 className="text-xl font-serif text-brand-text mb-2">Арт-Студия</h3>
               <div className="flex justify-center gap-2 mb-4">
                   <button onClick={() => setCreateSubMode('gen')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${createSubMode === 'gen' ? 'bg-brand-dark text-white' : 'bg-stone-100 text-stone-400'}`}>Фото</button>
                   <button onClick={() => setCreateSubMode('veo')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${createSubMode === 'veo' ? 'bg-brand-dark text-white' : 'bg-stone-100 text-stone-400'}`}>Видео (Veo)</button>
                   <button onClick={() => setCreateSubMode('edit')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${createSubMode === 'edit' ? 'bg-brand-dark text-white' : 'bg-stone-100 text-stone-400'}`}>Редактор</button>
               </div>
            </div>

            <div className="space-y-6">
               {/* 1. INPUT AREA */}
               <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-400 ml-1">
                      {createSubMode === 'edit' ? 'Загрузите фото и опишите изменение' : 'Идея'}
                  </label>
                  
                  {createSubMode === 'edit' && (
                      <div className="mb-4">
                          {!editFile ? (
                              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-stone-200 rounded-2xl cursor-pointer hover:bg-stone-50">
                                  <Upload className="w-6 h-6 text-stone-400 mb-2" />
                                  <span className="text-xs text-stone-500">Выбрать фото</span>
                                  <input type="file" className="hidden" accept="image/*" onChange={handleEditFileSelect} />
                              </label>
                          ) : (
                              <div className="relative rounded-2xl overflow-hidden h-40 bg-stone-100">
                                  <img src={editPreviewUrl!} alt="Edit Target" className="w-full h-full object-contain" />
                                  <button onClick={() => setEditFile(null)} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full"><X className="w-4 h-4"/></button>
                              </div>
                          )}
                      </div>
                  )}

                  <textarea
                    value={createSubMode === 'edit' ? editPrompt : genPrompt}
                    onChange={(e) => createSubMode === 'edit' ? setEditPrompt(e.target.value) : setGenPrompt(e.target.value)}
                    className="w-full p-4 bg-stone-50 rounded-2xl border border-stone-100 text-sm focus:outline-none focus:border-brand-green/50 resize-none transition-colors"
                    rows={createSubMode === 'veo' ? 2 : 3}
                    placeholder={
                        createSubMode === 'veo' ? "Атмосферный водопад в лесу, кинематографично..." :
                        createSubMode === 'edit' ? "Добавь горы на задний план..." :
                        "Йога в лесу на рассвете..."
                    }
                  />
               </div>

               {/* 2. CONFIG AREA */}
               {createSubMode === 'gen' && (
                   <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-stone-400 ml-1">Формат</label>
                          <div className="flex flex-wrap gap-2">
                            {['1:1', '3:4', '16:9'].map(ratio => (
                              <button
                                key={ratio}
                                onClick={() => setAspectRatio(ratio)}
                                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border w-full ${
                                  aspectRatio === ratio 
                                    ? 'bg-brand-dark text-white border-brand-dark shadow-md' 
                                    : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
                                }`}
                              >
                                {ratio}
                              </button>
                            ))}
                          </div>
                       </div>
                       
                       <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-stone-400 ml-1 flex items-center gap-1"><Palette className="w-3 h-3"/> Стиль</label>
                          <div className="flex flex-wrap gap-1">
                              {ART_STYLES.map((style) => (
                                  <button
                                    key={style.id}
                                    onClick={() => setArtStyle(style)}
                                    className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all border w-full truncate ${
                                        artStyle.id === style.id
                                        ? 'bg-brand-green text-white border-brand-green'
                                        : 'bg-white text-stone-500 border-stone-200 hover:border-brand-green/50'
                                    }`}
                                  >
                                      {style.label}
                                  </button>
                              ))}
                          </div>
                       </div>
                   </div>
               )}

               {/* 3. ACTION BUTTON */}
               <button
                   onClick={handleCreateAction}
                   disabled={isGenLoading || (createSubMode === 'edit' && !editFile)}
                   className={`w-full py-4 text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-70 flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-[1.02] active:scale-95 ${
                       createSubMode === 'veo' ? 'bg-indigo-600' : 'bg-brand-dark'
                   }`}
                 >
                   {isGenLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                    createSubMode === 'veo' ? <Film className="w-5 h-5" /> : 
                    createSubMode === 'edit' ? <Wand2 className="w-5 h-5" /> :
                    <Sparkles className="w-5 h-5 text-brand-yellow" />}
                   
                   {isGenLoading ? (createSubMode === 'veo' ? 'Рендеринг видео...' : 'Обработка...') : 
                    createSubMode === 'veo' ? 'Создать Видео' : 
                    createSubMode === 'edit' ? 'Магия' : 'Создать'}
               </button>

               {/* 4. RESULT AREA */}
               {isGenLoading ? (
                   <div className="mt-8 rounded-[2rem] overflow-hidden aspect-video w-full bg-stone-100 relative shadow-inner">
                       <div className={`absolute inset-0 bg-gradient-to-tr from-brand-mint/50 via-white opacity-50 animate-pulse ${createSubMode === 'veo' ? 'to-indigo-500/50' : 'to-brand-green/50'}`}></div>
                       <div className="absolute inset-0 flex flex-col items-center justify-center text-brand-green">
                           <div className="w-16 h-16 rounded-full border-4 border-current border-t-transparent animate-spin mb-4 opacity-50"></div>
                           <p className="font-serif text-lg animate-pulse text-brand-dark">Творческий процесс...</p>
                           {createSubMode === 'veo' && <p className="text-xs text-stone-500 mt-2">Видео может занять минуту</p>}
                       </div>
                   </div>
               ) : (
                 <>
                    {genImage && (
                        <div className="mt-8 rounded-[2rem] overflow-hidden shadow-2xl border border-stone-100 animate-in zoom-in-95 duration-500 group relative">
                            <img src={genImage} alt="Generated" className="w-full h-auto" />
                            <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md p-4 flex justify-between items-center translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                {createSubMode === 'gen' && <span className="text-xs text-stone-500 font-medium">Стиль: {artStyle.label}</span>}
                                <a href={genImage} download="yoga-ai.png" className="bg-brand-green text-white px-4 py-2 rounded-full text-xs font-bold uppercase hover:bg-brand-green/90 transition-colors shadow-lg">Скачать</a>
                            </div>
                        </div>
                    )}
                    {genVideo && (
                        <div className="mt-8 rounded-[2rem] overflow-hidden shadow-2xl border border-stone-100 animate-in zoom-in-95 duration-500 group relative bg-black">
                            <video src={genVideo} controls autoPlay loop className="w-full h-auto" />
                            <div className="p-4 bg-white/10 backdrop-blur-md flex justify-between items-center text-white">
                                <span className="text-xs font-medium">Veo Generation</span>
                                <a href={genVideo} download="yoga-veo.mp4" className="bg-indigo-600 text-white px-4 py-2 rounded-full text-xs font-bold uppercase hover:bg-indigo-500 transition-colors shadow-lg">Скачать</a>
                            </div>
                        </div>
                    )}
                 </>
               )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * CreateMode - Art generation (Image, Video, Edit)
 */
import React, { useState } from 'react';
import { Upload, X, Loader2, Sparkles, Film, Wand2, Palette } from 'lucide-react';
import { generateYogaImage, generateVeoVideo, editYogaImage } from '../../services/geminiService';
import { CreateSubMode, ART_STYLES, ArtStyle } from './types';

interface CreateModeProps {
  onError: (message: string) => void;
}

export const CreateMode: React.FC<CreateModeProps> = ({ onError }) => {
  const [createSubMode, setCreateSubMode] = useState<CreateSubMode>('gen');
  const [genPrompt, setGenPrompt] = useState('Девушка делает асану воин 2 на вершине горы');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [artStyle, setArtStyle] = useState<ArtStyle>(ART_STYLES[0]);
  const [genImage, setGenImage] = useState<string | null>(null);
  const [genVideo, setGenVideo] = useState<string | null>(null);
  const [isGenLoading, setIsGenLoading] = useState(false);

  // Edit State
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('Добавь горы на фон');

  const handleEditFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditFile(file);
      setEditPreviewUrl(URL.createObjectURL(file));
      setGenImage(null);
    }
  };

  const handleCreateAction = async () => {
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
    } catch {
      onError('Ошибка генерации');
    } finally {
      if (createSubMode !== 'edit') setIsGenLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 scrollbar-hide">
      <div className="text-center mb-6">
        <h3 className="text-xl font-serif text-brand-text mb-2">Арт-Студия</h3>
        <div className="flex justify-center gap-2 mb-4">
          <button
            onClick={() => setCreateSubMode('gen')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              createSubMode === 'gen' ? 'bg-brand-dark text-white' : 'bg-stone-100 text-stone-400'
            }`}
          >
            Фото
          </button>
          <button
            onClick={() => setCreateSubMode('veo')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              createSubMode === 'veo' ? 'bg-brand-dark text-white' : 'bg-stone-100 text-stone-400'
            }`}
          >
            Видео (Veo)
          </button>
          <button
            onClick={() => setCreateSubMode('edit')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              createSubMode === 'edit' ? 'bg-brand-dark text-white' : 'bg-stone-100 text-stone-400'
            }`}
          >
            Редактор
          </button>
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
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleEditFileSelect}
                  />
                </label>
              ) : (
                <div className="relative rounded-2xl overflow-hidden h-40 bg-stone-100">
                  <img
                    src={editPreviewUrl!}
                    alt="Edit Target"
                    className="w-full h-full object-contain"
                  />
                  <button
                    onClick={() => setEditFile(null)}
                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          <textarea
            value={createSubMode === 'edit' ? editPrompt : genPrompt}
            onChange={(e) =>
              createSubMode === 'edit' ? setEditPrompt(e.target.value) : setGenPrompt(e.target.value)
            }
            className="w-full p-4 bg-stone-50 rounded-2xl border border-stone-100 text-sm focus:outline-none focus:border-brand-green/50 resize-none transition-colors"
            rows={createSubMode === 'veo' ? 2 : 3}
            placeholder={
              createSubMode === 'veo'
                ? 'Атмосферный водопад в лесу, кинематографично...'
                : createSubMode === 'edit'
                  ? 'Добавь горы на задний план...'
                  : 'Йога в лесу на рассвете...'
            }
          />
        </div>

        {/* 2. CONFIG AREA */}
        {createSubMode === 'gen' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-400 ml-1">
                Формат
              </label>
              <div className="flex flex-wrap gap-2">
                {['1:1', '3:4', '16:9'].map((ratio) => (
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
              <label className="text-xs font-bold uppercase tracking-wider text-stone-400 ml-1 flex items-center gap-1">
                <Palette className="w-3 h-3" /> Стиль
              </label>
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
          {isGenLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : createSubMode === 'veo' ? (
            <Film className="w-5 h-5" />
          ) : createSubMode === 'edit' ? (
            <Wand2 className="w-5 h-5" />
          ) : (
            <Sparkles className="w-5 h-5 text-brand-yellow" />
          )}

          {isGenLoading
            ? createSubMode === 'veo'
              ? 'Рендеринг видео...'
              : 'Обработка...'
            : createSubMode === 'veo'
              ? 'Создать Видео'
              : createSubMode === 'edit'
                ? 'Магия'
                : 'Создать'}
        </button>

        {/* 4. RESULT AREA */}
        {isGenLoading ? (
          <div className="mt-8 rounded-[2rem] overflow-hidden aspect-video w-full bg-stone-100 relative shadow-inner">
            <div
              className={`absolute inset-0 bg-gradient-to-tr from-brand-mint/50 via-white opacity-50 animate-pulse ${
                createSubMode === 'veo' ? 'to-indigo-500/50' : 'to-brand-green/50'
              }`}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-brand-green">
              <div className="w-16 h-16 rounded-full border-4 border-current border-t-transparent animate-spin mb-4 opacity-50" />
              <p className="font-serif text-lg animate-pulse text-brand-dark">
                Творческий процесс...
              </p>
              {createSubMode === 'veo' && (
                <p className="text-xs text-stone-500 mt-2">Видео может занять минуту</p>
              )}
            </div>
          </div>
        ) : (
          <>
            {genImage && (
              <div className="mt-8 rounded-[2rem] overflow-hidden shadow-2xl border border-stone-100 animate-in zoom-in-95 duration-500 group relative">
                <img src={genImage} alt="Generated" className="w-full h-auto" />
                <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md p-4 flex justify-between items-center translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  {createSubMode === 'gen' && (
                    <span className="text-xs text-stone-500 font-medium">
                      Стиль: {artStyle.label}
                    </span>
                  )}
                  <a
                    href={genImage}
                    download="yoga-ai.png"
                    className="bg-brand-green text-white px-4 py-2 rounded-full text-xs font-bold uppercase hover:bg-brand-green/90 transition-colors shadow-lg"
                  >
                    Скачать
                  </a>
                </div>
              </div>
            )}
            {genVideo && (
              <div className="mt-8 rounded-[2rem] overflow-hidden shadow-2xl border border-stone-100 animate-in zoom-in-95 duration-500 group relative bg-black">
                <video src={genVideo} controls autoPlay loop className="w-full h-auto" />
                <div className="p-4 bg-white/10 backdrop-blur-md flex justify-between items-center text-white">
                  <span className="text-xs font-medium">Veo Generation</span>
                  <a
                    href={genVideo}
                    download="yoga-veo.mp4"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-full text-xs font-bold uppercase hover:bg-indigo-500 transition-colors shadow-lg"
                  >
                    Скачать
                  </a>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

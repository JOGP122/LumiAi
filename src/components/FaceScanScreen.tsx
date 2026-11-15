import React, { useState, useRef } from 'react';
import {
  ChevronLeft,
  Sparkles,
  Camera,
  CheckCircle2,
  ShieldCheck,
  Sun,
  Moon,
  AlertCircle,
  ArrowRight,
  ScanFace
} from 'lucide-react';
import { FaceAnalysisResult, OnboardingAnswers } from '../types';

interface FaceScanScreenProps {
  userName: string;
  onboarding?: OnboardingAnswers;
  onBack: () => void;
  onAnalysisSuccess: (result: FaceAnalysisResult) => void;
}

export const FaceScanScreen: React.FC<FaceScanScreenProps> = ({
  userName,
  onboarding,
  onBack,
  onAnalysisSuccess
}) => {
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  const [uploadedMimeType, setUploadedMimeType] = useState<string>('image/jpeg');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>(
    'Сделай селфи при дневном свете или запусти подбор по своей анкете'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<FaceAnalysisResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMessage(null);
    setUploadedMimeType(file.type || 'image/jpeg');

    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      setUploadedBase64(resultStr);
      runGeminiFaceAnalysis(resultStr, file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
  };

  const runGeminiFaceAnalysis = async (
    base64Override?: string | null,
    mimeOverride?: string
  ) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    setStatusMessage(
      base64Override || uploadedBase64
        ? 'Сканирование микрорельефа, Т-зоны и барьера кожи через Gemini AI...'
        : 'Подбор персональной рутины по твоей анкете через Gemini AI...'
    );

    try {
      const response = await fetch('/api/analyze-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Override !== undefined ? base64Override : uploadedBase64,
          mimeType: mimeOverride || uploadedMimeType,
          onboarding,
          userName
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Ошибка сервера при анализе кожи');
      }

      const data = await response.json();
      const finalResult: FaceAnalysisResult = {
        skinScore: data.skinScore || 80,
        skinTypeSummary:
          data.skinTypeSummary || 'Индивидуальный профиль кожи сформирован',
        visualFindings: Array.isArray(data.visualFindings)
          ? data.visualFindings
          : [
              'Рекомендована барьерная поддержка и мягкое очищение',
              'Соблюден баланс активов без риска раздражения'
            ],
        disclaimer:
          data.disclaimer ||
          'Результаты носят косметический характер и не являются медицинским диагнозом.',
        morningRoutine: Array.isArray(data.morningRoutine) ? data.morningRoutine : [],
        eveningRoutine: Array.isArray(data.eveningRoutine) ? data.eveningRoutine : [],
        analyzedAt: new Date().toISOString(),
        photoPreview: uploadedBase64 || undefined
      };

      setAnalysisResult(finalResult);
      setStatusMessage(`Анализ завершен! Индекс кожи: ${finalResult.skinScore}/100`);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Не удалось связаться с AI-консьержем.');
      setStatusMessage('Попробуйте загрузить другое фото или повторить запрос');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-[#1C1813] select-none flex flex-col justify-between">
      {/* Hidden File Input for Camera / Gallery */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Загрузить селфи лица"
      />

      {/* Background Viewport: User's Uploaded Selfie OR Clean Biometric Silhouette (Never a stock girl photo) */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        {uploadedBase64 ? (
          <>
            <img
              src={uploadedBase64}
              alt="Ваше селфи для AI-диагностики"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-[#1E1A15] via-[#1C1813] to-[#14110D] flex flex-col items-center justify-center pb-36 px-6">
            {/* Biometric Face Contour Frame */}
            <div className="relative w-56 h-72 rounded-[110px] border-2 border-dashed border-[#A87C44]/60 flex flex-col items-center justify-center bg-[#A87C44]/[0.04] shadow-[0_0_50px_rgba(168,124,68,0.12)]">
              <ScanFace size={54} className="text-[#F0E6D1]/70 mb-3" strokeWidth={1.4} />
              <span className="text-[12px] font-bold text-white/85 text-center px-6 leading-snug">
                Поместите лицо в контур или загрузите селфи
              </span>
              <span className="text-[10.5px] text-white/50 mt-1">
                Без макияжа и при дневном освещении
              </span>

              {/* Corner Brackets */}
              <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-[#A87C44] rounded-tl-xl" />
              <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-[#A87C44] rounded-tr-xl" />
              <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-[#A87C44] rounded-bl-xl" />
              <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-[#A87C44] rounded-br-xl" />
            </div>
          </div>
        )}
      </div>

      {/* Top Header Controls */}
      <div className="relative z-20 pt-4 px-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          aria-label="Вернуться назад"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white text-[13px] font-medium border border-white/20 hover:bg-black/60 active:scale-95 transition-all"
        >
          <ChevronLeft size={16} strokeWidth={2.5} />
          <span>Назад</span>
        </button>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-[11px] font-bold tracking-wide">
          <span
            className={`w-2 h-2 rounded-full ${
              isAnalyzing ? 'bg-[#A87C44] animate-ping' : 'bg-emerald-400'
            }`}
          />
          <span>
            {isAnalyzing
              ? 'GEMINI AI АНАЛИЗ...'
              : analysisResult
              ? 'ДИАГНОСТИКА ГОТОВА'
              : 'AI-СКАНЕР КОЖИ'}
          </span>
        </div>
      </div>

      {/* Laser Line Overlay while scanning */}
      {!analysisResult && (
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          <div className="absolute w-full h-[3px] bg-gradient-to-r from-transparent via-[#A87C44] to-transparent scan-laser-line shadow-[0_0_20px_4px_rgba(168,124,68,0.85)]">
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#A87C44] text-white text-[10px] font-bold shadow-md tracking-wider">
              {isAnalyzing ? 'AI SCANNING' : 'READY'}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Controls OR Detailed Result Sheet */}
      {!analysisResult ? (
        <div className="relative z-20 mt-auto w-full bg-white/95 backdrop-blur-xl rounded-t-[32px] pt-5 pb-7 px-4 border-t border-white/50 shadow-[0_-10px_35px_rgba(0,0,0,0.2)]">
          {/* Status Pill */}
          <div className="flex items-center gap-2.5 mb-3 px-3 py-2 rounded-2xl bg-[#FBF8F5] border border-[#ECE5D7]">
            <Sparkles
              size={16}
              className={`text-[#A87C44] shrink-0 ${isAnalyzing ? 'animate-spin' : ''}`}
            />
            <span className="text-[12px] font-semibold text-[#1C1813] leading-snug">
              {statusMessage}
            </span>
          </div>

          {errorMessage && (
            <div className="mb-3 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-[12px] flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Profile Context Summary */}
          {onboarding && (
            <div className="mb-4 px-3 py-2 rounded-2xl bg-[#F0E6D1]/40 border border-[#F6DBD2] text-[11px] text-[#786F67] flex flex-wrap gap-x-3 gap-y-1">
              <span>
                • Пол: <b>{onboarding.gender === 'male' ? 'Мужской' : 'Женский'}</b>
              </span>
              <span>
                • Возраст: <b>{onboarding.ageGroup}</b>
              </span>
              <span>
                • Бюджет: <b>{onboarding.budget}</b>
              </span>
            </div>
          )}

          {/* Upload / Camera / Questionnaire AI Analysis Buttons */}
          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3.5 px-4 rounded-full bg-[#A87C44] text-white text-[13.5px] font-bold flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(168,124,68,0.35)] hover:bg-[#e5604d] active:scale-[0.98] transition-all disabled:opacity-60"
            >
              <Camera size={17} />
              <span>
                {isAnalyzing
                  ? 'Анализируем кожу...'
                  : 'Сделать или загрузить селфи (Камера / Галерея)'}
              </span>
            </button>

            <button
              type="button"
              disabled={isAnalyzing}
              onClick={() => runGeminiFaceAnalysis(uploadedBase64, uploadedMimeType)}
              className="w-full py-3 px-4 rounded-full bg-white border border-[#EBE4DD] text-[#1C1813] text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-[#FBF8F5] active:scale-[0.98] transition-all disabled:opacity-60"
            >
              <Sparkles size={15} className="text-[#A87C44]" />
              <span>
                {isAnalyzing
                  ? 'Запрос к Gemini API...'
                  : uploadedBase64
                  ? 'Повторить AI-скан по загруженному фото'
                  : 'Подобрать базовый уход без фото (по моей анкете)'}
              </span>
            </button>
          </div>
        </div>
      ) : (
        /* Detailed AI Diagnostic Report Sheet */
        <div className="relative z-20 mt-16 w-full max-h-[82vh] overflow-y-auto no-scrollbar bg-[#FBF8F5] rounded-t-[32px] pt-5 pb-8 px-4 border-t border-white shadow-[0_-12px_40px_rgba(0,0,0,0.25)]">
          {/* Score Header */}
          <div className="flex items-center justify-between bg-white rounded-[24px] p-4 border border-[#ECE5D7] shadow-xs mb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                <CheckCircle2 size={13} />
                Вердикт AI-дерматолога
              </span>
              <h2 className="text-[16px] font-bold text-[#1C1813] mt-1 leading-snug">
                {analysisResult.skinTypeSummary}
              </h2>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col items-center justify-center shrink-0 ml-3">
              <span className="text-[18px] font-extrabold text-emerald-700 leading-none">
                {analysisResult.skinScore}
              </span>
              <span className="text-[9px] font-bold text-emerald-600 uppercase mt-0.5">
                из 100
              </span>
            </div>
          </div>

          {/* Visual Findings */}
          <div className="bg-white rounded-[24px] p-4 border border-[#ECE5D7] shadow-xs mb-4">
            <h3 className="text-[13px] font-bold text-[#1C1813] mb-2.5 flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-[#A87C44]" />
              <span>Заключение по профилю и коже:</span>
            </h3>
            <ul className="flex flex-col gap-2">
              {analysisResult.visualFindings.map((finding, idx) => (
                <li
                  key={idx}
                  className="text-[12px] text-[#1C1813] bg-[#FBF8F5] px-3 py-2 rounded-xl border border-[#ECE5D7] flex items-start gap-2"
                >
                  <span className="text-[#A87C44] font-bold">•</span>
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
            <p className="text-[10.5px] text-[#756C5D] mt-2.5 italic">
              * {analysisResult.disclaimer}
            </p>
          </div>

          {/* Morning Routine Preview */}
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-2 px-1">
              <Sun size={14} className="text-amber-500" />
              <h4 className="text-[13px] font-bold text-[#1C1813]">
                Утренняя рутина ({analysisResult.morningRoutine.length} шага)
              </h4>
            </div>
            <div className="flex flex-col gap-2">
              {analysisResult.morningRoutine.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-[18px] p-3 border border-[#ECE5D7] flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase text-[#A87C44]">
                      {item.time} • {item.stepCategory}
                    </span>
                    <div className="text-[12.5px] font-bold text-[#1C1813] truncate">
                      {item.brand} — {item.name}
                    </div>
                    <p className="text-[11px] text-[#786F67] mt-0.5 line-clamp-2">
                      {item.whyItFits}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[12px] font-bold text-[#1C1813] block">
                      {item.price.toLocaleString('ru-RU')} ₽
                    </span>
                    <span className="text-[9.5px] text-[#756C5D]">{item.partnerStore}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evening Routine Preview */}
          <div className="mb-5">
            <div className="flex items-center gap-1.5 mb-2 px-1">
              <Moon size={14} className="text-indigo-500" />
              <h4 className="text-[13px] font-bold text-[#1C1813]">
                Вечерняя рутина ({analysisResult.eveningRoutine.length} шага)
              </h4>
            </div>
            <div className="flex flex-col gap-2">
              {analysisResult.eveningRoutine.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-[18px] p-3 border border-[#ECE5D7] flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase text-indigo-600">
                      {item.time} • {item.stepCategory}
                    </span>
                    <div className="text-[12.5px] font-bold text-[#1C1813] truncate">
                      {item.brand} — {item.name}
                    </div>
                    <p className="text-[11px] text-[#786F67] mt-0.5 line-clamp-2">
                      {item.whyItFits}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[12px] font-bold text-[#1C1813] block">
                      {item.price.toLocaleString('ru-RU')} ₽
                    </span>
                    <span className="text-[9.5px] text-[#756C5D]">{item.partnerStore}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Apply & Save Button */}
          <button
            type="button"
            onClick={() => onAnalysisSuccess(analysisResult)}
            className="w-full py-4 px-5 rounded-full bg-[#A87C44] text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(168,124,68,0.35)] hover:bg-[#e5604d] active:scale-[0.98] transition-all"
          >
            <span>Применить уход и обновить рутину</span>
            <ArrowRight size={17} strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
};

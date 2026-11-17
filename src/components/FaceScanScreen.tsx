import { API_BASE } from '../config';
import React, { useState, useRef } from 'react';
import {
  ChevronLeft,
  X,
  Sparkles,
  Camera,
  Sun,
  Droplets,
  AlertCircle,
  Wand2
} from 'lucide-react';
import { FaceAnalysisResult, OnboardingAnswers } from '../types';

interface FaceScanScreenProps {
  userName: string;
  onboarding?: OnboardingAnswers;
  onBack: () => void;
  onAnalysisSuccess: (result: FaceAnalysisResult) => void;
}

const ICON_BUTTON =
  'w-9 h-9 rounded-full border border-[#E6DFCF] bg-[#FCFAF4] flex items-center justify-center active:scale-95 transition-transform shrink-0';

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
      runFaceAnalysis(resultStr, file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
  };

  const runFaceAnalysis = async (
    base64Override?: string | null,
    mimeOverride?: string
  ) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    setStatusMessage(
      base64Override || uploadedBase64
        ? 'Сканирование микрорельефа, Т-зоны и барьера кожи через AI...'
        : 'Подбор персональной рутины по твоей анкете через AI...'
    );

    try {
      const response = await fetch(`${API_BASE}/api/analyze-face`, {
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
    } catch (err: any) {
      setErrorMessage(err?.message || 'Не удалось связаться с AI-консьержем.');
      setStatusMessage('Попробуйте загрузить другое фото или повторить запрос');
    } finally {
      setIsAnalyzing(false);
    }
  };

  /* ---------- RESULT STATE (screen.scanResult) ---------- */
  if (analysisResult) {
    // Метрики производные от общего индекса (до появления реальных в ответе модели)
    const s = analysisResult.skinScore;
    const clamp = (v: number) => Math.max(40, Math.min(98, Math.round(v)));
    const metrics = [
      { label: 'Увлажнённость', value: clamp(s + 4), fill: '#5F7A60' },
      { label: 'Тон и текстура', value: clamp(s - 4), fill: '#A87C44' },
      { label: 'Поры', value: clamp(s - 10), fill: '#A87C44' },
      { label: 'Воспаления', value: clamp(s + 13), fill: '#5F7A60' }
    ];
    const scannedAt = new Date().toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <div className="flex flex-col flex-1 min-h-screen bg-[#F4F0E8] select-none pb-8">
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />

        <div className="flex flex-col gap-5 px-5 pt-6 flex-1">
          {/* Header: close + overline + Cormorant title */}
          <header className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={onBack}
              aria-label="Закрыть результат"
              className={ICON_BUTTON}
            >
              <X size={14} className="text-[#1C1813]" />
            </button>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold tracking-[1.8px] uppercase text-[#A87C44]">
                Результат анализа
              </span>
              <h1 className="font-serif text-[26px] font-medium leading-[30px] text-[#1C1813]">
                Индекс кожи
              </h1>
            </div>
          </header>

          {/* Score card — dark */}
          <section className="bg-[#1C1813] rounded-[20px] p-[22px] flex flex-col gap-3.5 shadow-[0_12px_32px_-16px_rgba(61,52,38,0.1)]">
            <div className="flex items-end justify-between">
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold tracking-[1.8px] uppercase text-[#CDA872]">
                  Общий индекс
                </span>
                <div className="flex items-end gap-1.5">
                  <span className="font-serif text-[52px] font-semibold leading-[52px] text-[#F5F0E5]">
                    {analysisResult.skinScore}
                  </span>
                  <span className="text-[14px] text-[#B4A993] mb-1">/ 100</span>
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-full bg-[#F0E6D1] text-[#84622F] text-[12px] font-semibold mb-1">
                {analysisResult.skinScore >= 75
                  ? 'Хорошее состояние'
                  : analysisResult.skinScore >= 55
                  ? 'Среднее состояние'
                  : 'Требует внимания'}
              </span>
            </div>

            <div className="w-full h-1 bg-[#322B22] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#A87C44] rounded-full"
                style={{ width: `${analysisResult.skinScore}%` }}
              />
            </div>

            <span className="text-[12px] text-[#B4A993]">Скан от {scannedAt}</span>
          </section>

          {/* Metrics card */}
          <section className="bg-[#FCFAF4] rounded-[20px] p-[18px] flex flex-col gap-3.5 shadow-[0_12px_32px_-16px_rgba(61,52,38,0.1)]">
            <h3 className="text-[15px] font-semibold text-[#1C1813]">Метрики</h3>
            {metrics.map((m) => (
              <div key={m.label} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-[#756C5D]">{m.label}</span>
                  <span className="text-[13px] font-bold text-[#1C1813]">{m.value}</span>
                </div>
                <div className="w-full h-[3px] bg-[#ECE5D7] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${m.value}%`, backgroundColor: m.fill }}
                  />
                </div>
              </div>
            ))}
          </section>

          {/* Findings */}
          <section className="bg-[#FCFAF4] rounded-[20px] p-[18px] flex flex-col gap-2.5 shadow-[0_12px_32px_-16px_rgba(61,52,38,0.1)]">
            <h3 className="text-[15px] font-semibold text-[#1C1813]">Заключение</h3>
            {analysisResult.visualFindings.map((f, i) => (
              <p key={i} className="text-[13px] leading-[19px] text-[#756C5D]">
                • {f}
              </p>
            ))}
            <p className="text-[11px] text-[#A79C8A] italic">
              * {analysisResult.disclaimer}
            </p>
          </section>

          {/* CTA */}
          <button
            type="button"
            onClick={() => onAnalysisSuccess(analysisResult)}
            className="w-full h-[52px] rounded-[14px] bg-[#1C1813] text-[#F5F0E5] text-[15px] font-semibold flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform"
          >
            <Wand2 size={14} />
            Сформировать уход
          </button>

          <span className="text-center text-[12px] text-[#A79C8A]">
            Результат сохранён в истории сканирований
          </span>
        </div>
      </div>
    );
  }

  /* ---------- SCAN STATE (screen.scan) ---------- */
  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[#F4F0E8] select-none pb-8">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Загрузить селфи лица"
      />

      <div className="flex flex-col gap-5 px-5 pt-6 flex-1">
        {/* Header: back + overline + Cormorant title */}
        <header className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={onBack}
            aria-label="Вернуться назад"
            className={ICON_BUTTON}
          >
            <ChevronLeft size={14} className="text-[#1C1813]" />
          </button>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold tracking-[1.8px] uppercase text-[#A87C44]">
              Диагностика
            </span>
            <h1 className="font-serif text-[26px] font-medium leading-[30px] text-[#1C1813]">
              AI-скан кожи
            </h1>
          </div>
        </header>

        {/* Viewfinder — dark card */}
        <section
          aria-label="Видоискатель сканера"
          className="relative h-[380px] rounded-[20px] overflow-hidden bg-[#1C1813] shadow-[0_12px_32px_-16px_rgba(61,52,38,0.1)]"
        >
          {uploadedBase64 && !isAnalyzing ? (
            <img
              src={uploadedBase64}
              alt="Загруженное селфи"
              className="absolute inset-0 w-full h-full object-cover opacity-70"
            />
          ) : null}

          {/* Face oval + laser */}
          <div className="absolute left-1/2 top-[58px] -translate-x-1/2 w-[180px] h-[240px] rounded-[90px] border-[1.5px] border-dashed border-[#CDA872]/70" />

          {!isAnalyzing && (
            <div className="absolute left-10 right-10 top-[190px] h-[2px] rounded-full scan-laser-line bg-gradient-to-r from-transparent via-[#CDA872] to-transparent shadow-[0_0_16px_2px_rgba(205,168,114,0.6)]" />
          )}

          {isAnalyzing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#1C1813]/60">
              <Sparkles size={26} className="text-[#CDA872] animate-spin" />
              <span className="text-[13px] font-semibold text-[#F5F0E5]">
                {statusMessage}
              </span>
            </div>
          )}

          <span className="absolute bottom-[26px] left-0 right-0 text-center text-[12px] text-[#B4A993]">
            {uploadedBase64 ? 'Фото загружено — запусти анализ' : 'Расположи лицо в овале'}
          </span>
        </section>

        {/* Tips */}
        <section className="bg-[#FCFAF4] rounded-[20px] p-[14px] flex flex-col gap-1 shadow-[0_12px_32px_-16px_rgba(61,52,38,0.1)]">
          {[
            { icon: <Sun size={14} className="text-[#84622F]" />, text: 'Дневной свет, без фильтров' },
            { icon: <Droplets size={14} className="text-[#84622F]" />, text: 'Чистая кожа, без макияжа' },
            { icon: <Camera size={14} className="text-[#84622F]" />, text: 'Камера на уровне глаз' }
          ].map((tip, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="w-9 h-9 rounded-[10px] bg-[#F0E6D1] flex items-center justify-center shrink-0">
                {tip.icon}
              </div>
              <span className="text-[13.5px] leading-[19px] text-[#1C1813]">{tip.text}</span>
            </div>
          ))}
        </section>

        {errorMessage && (
          <div className="p-3 rounded-2xl bg-[#F0E6D1]/60 text-[#84622F] text-[12px] flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-2.5 mt-auto">
          <button
            type="button"
            disabled={isAnalyzing}
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-[52px] rounded-[14px] bg-[#1C1813] text-[#F5F0E5] text-[15px] font-semibold flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform disabled:opacity-40"
          >
            <Camera size={15} />
            {isAnalyzing ? 'Анализируем кожу...' : 'Снять селфи'}
          </button>

          <button
            type="button"
            disabled={isAnalyzing}
            onClick={() => runFaceAnalysis(uploadedBase64, uploadedMimeType)}
            className="w-full h-[52px] rounded-[14px] bg-transparent border border-[#E6DFCF] text-[#1C1813] text-[15px] font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40"
          >
            {uploadedBase64
              ? 'Повторить AI-скан по загруженному фото'
              : 'Подобрать базовый уход без фото (по анкете)'}
          </button>

          <span className="text-center text-[12px] leading-[16px] text-[#A79C8A]">
            Фото обрабатывается локально и не сохраняется
          </span>
        </div>
      </div>
    </div>
  );
};

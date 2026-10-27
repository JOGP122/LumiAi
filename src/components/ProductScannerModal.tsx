import React, { useState, useRef } from 'react';
import {
  ChevronLeft,
  Camera,
  Sparkles,
  Search,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Plus,
  RefreshCw,
  FlaskConical,
  X
} from 'lucide-react';
import { ProductScanResult, RoutineStep, UserSkinProfile } from '../types';

interface ProductScannerModalProps {
  userProfile: UserSkinProfile;
  currentRoutine: RoutineStep[];
  scannedHistory: ProductScanResult[];
  onClose: () => void;
  onAddScannedToRoutine: (scan: ProductScanResult, useSafeAlternative?: boolean) => void;
  onSaveScanResult: (scan: ProductScanResult) => void;
}

const SAMPLE_PRODUCTS = [
  'The Ordinary AHA 30% + BHA 2% Peeling Solution',
  'CeraVe Moisturizing Cream с церамидами',
  'La Roche-Posay Effaclar Duo+ крем-гель',
  'Гельтек Сыворотка с ретинолом Retiderm 0.25'
];

export const ProductScannerModal: React.FC<ProductScannerModalProps> = ({
  userProfile,
  currentRoutine,
  scannedHistory,
  onClose,
  onAddScannedToRoutine,
  onSaveScanResult
}) => {
  const [productQuery, setProductQuery] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ProductScanResult | null>(null);
  const [showAlternativeCard, setShowAlternativeCard] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async (overrideQuery?: string) => {
    const queryToUse = overrideQuery !== undefined ? overrideQuery : productQuery;
    if (!queryToUse.trim() && !imagePreview) {
      setErrorMsg('Введите название средства / состав INCI или загрузите фото банки');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setShowAlternativeCard(false);

    try {
      const response = await fetch('/api/analyze-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePreview,
          mimeType: imageMimeType,
          productQuery: queryToUse.trim(),
          userProfile,
          currentRoutine
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Ошибка анализа состава');
      }

      const data = await response.json();
      const result: ProductScanResult = {
        id: `scan-${Date.now()}`,
        productName: data.productName || queryToUse || 'Косметическое средство',
        brand: data.brand || 'Бренд',
        compatibilityScore:
          typeof data.compatibilityScore === 'number' ? data.compatibilityScore : 85,
        verdictSummary: data.verdictSummary || 'Продукт проанализирован по базе INCI.',
        recommendedSection: data.recommendedSection === 'morning' ? 'morning' : 'evening',
        recommendedStepCategory: data.recommendedStepCategory || 'Уход',
        estimatedPrice: data.estimatedPrice || 1800,
        goodIngredients: Array.isArray(data.goodIngredients) ? data.goodIngredients : [],
        badIngredients: Array.isArray(data.badIngredients) ? data.badIngredients : [],
        routineConflict: data.routineConflict || {
          hasConflict: false,
          conflictWarning: 'Конфликтов с текущей рутиной не обнаружено.'
        },
        safeAlternative: data.safeAlternative,
        scannedAt: new Date().toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      setScanResult(result);
      onSaveScanResult(result);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Ошибка соединения с AI-анализатором составов');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[#FBF8F5] pb-28 pt-4 px-4 sm:px-5 select-none">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoUpload}
        className="hidden"
        aria-label="Загрузить фото банки или состава INCI"
      />

      {/* Header */}
      <header className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть сканер состава"
          className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#1E1B18] shadow-xs border border-[#F2ECE5] active:scale-90 transition-transform"
        >
          <ChevronLeft size={20} strokeWidth={2.2} />
        </button>

        <div className="text-center">
          <h1 className="text-[17px] font-bold text-[#1E1B18] tracking-tight">
            Сканер состава и банок
          </h1>
          <p className="text-[11px] text-[#9B9188]">
            INCI-анализ комедогенности и конфликтов
          </p>
        </div>

        <div className="w-9 h-9 rounded-full bg-[#F8DDD4]/60 flex items-center justify-center text-[#F8715E]">
          <FlaskConical size={18} />
        </div>
      </header>

      {/* Input Card: Photo OR Text */}
      <div className="bg-white rounded-[26px] p-4 border border-[#F2ECE5] shadow-[0_6px_22px_rgba(30,27,24,0.03)] mb-4">
        <label
          htmlFor="inci-product-input"
          className="block text-[11.5px] font-bold text-[#1E1B18] mb-2"
        >
          Введи название банки / состав INCI или загрузи фото:
        </label>

        <div className="flex items-center gap-2 bg-[#FBF8F5] rounded-2xl px-3.5 py-2.5 border border-[#EBE4DD] mb-3">
          <Search size={16} className="text-[#9B9188] shrink-0" />
          <input
            id="inci-product-input"
            type="text"
            value={productQuery}
            onChange={(e) => setProductQuery(e.target.value)}
            placeholder="Например: CeraVe крем или состав с упаковки..."
            className="w-full bg-transparent text-[13px] font-medium text-[#1E1B18] placeholder:text-[#9B9188] focus:outline-none"
          />
          {productQuery && (
            <button
              type="button"
              onClick={() => setProductQuery('')}
              aria-label="Очистить поле"
              className="text-[#9B9188] hover:text-[#1E1B18]"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Image Preview if uploaded */}
        {imagePreview && (
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-[#F2ECE5] mb-3">
            <img
              src={imagePreview}
              alt="Фото банки"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => setImagePreview(null)}
              aria-label="Удалить фото"
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Quick Sample Chips */}
        <div className="mb-3.5">
          <span className="text-[10.5px] font-semibold text-[#9B9188] block mb-1.5">
            Быстрая проверка популярных средств:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_PRODUCTS.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setProductQuery(sample);
                  handleAnalyze(sample);
                }}
                className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#FBF8F5] hover:bg-[#F8DDD4]/50 text-[#786F67] hover:text-[#1E1B18] border border-[#EBE4DD] transition-colors"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => fileInputRef.current?.click()}
            className="py-3 px-4 rounded-full bg-[#FBF8F5] border border-[#EBE4DD] text-[#1E1B18] text-[12px] font-bold flex items-center justify-center gap-1.5 hover:bg-[#F3ECE4] active:scale-95 transition-all shrink-0"
          >
            <Camera size={15} className="text-[#F8715E]" />
            <span>Фото / INCI</span>
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleAnalyze()}
            className="flex-1 py-3 px-4 rounded-full bg-[#F8715E] text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(248,113,94,0.3)] hover:bg-[#e5604d] active:scale-95 transition-all disabled:opacity-60"
          >
            <Sparkles size={15} className={isLoading ? 'animate-spin' : ''} />
            <span>{isLoading ? 'Разбираем состав...' : 'Проверить банку'}</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-[12px]">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Analysis Result Card */}
      {scanResult && (
        <div className="bg-white rounded-[28px] p-4 border border-[#F2ECE5] shadow-[0_10px_28px_rgba(30,27,24,0.05)] mb-5 flex flex-col gap-4 animate-fade-in">
          {/* Product Header & Compatibility Score */}
          <div className="flex items-start justify-between gap-3 border-b border-[#F8F4EE] pb-3.5">
            <div>
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#9B9188]">
                {scanResult.brand} • {scanResult.recommendedStepCategory}
              </span>
              <h2 className="text-[16px] font-bold text-[#1E1B18] mt-0.5 leading-snug">
                {scanResult.productName}
              </h2>
              <p className="text-[12px] text-[#786F67] mt-1 leading-relaxed">
                {scanResult.verdictSummary}
              </p>
            </div>

            <div
              className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 border ${
                scanResult.compatibilityScore >= 75
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : scanResult.compatibilityScore >= 50
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              <span className="text-[18px] font-extrabold leading-none">
                {scanResult.compatibilityScore}%
              </span>
              <span className="text-[9px] font-bold uppercase mt-1">
                совмест.
              </span>
            </div>
          </div>

          {/* Green Badges: Good Active Ingredients */}
          <div>
            <h3 className="text-[12px] font-bold text-emerald-800 mb-2 flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span>Ключевые полезные активы:</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {scanResult.goodIngredients.map((ing, i) => (
                <div
                  key={i}
                  className="px-3 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11.5px]"
                >
                  <span className="font-bold">{ing.name}:</span>{' '}
                  <span className="text-emerald-700">{ing.effect}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Red/Yellow Badges: Comedogens & Irritants */}
          <div>
            <h3 className="text-[12px] font-bold text-amber-900 mb-2 flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-amber-600" />
              <span>Комедогены и потенциальные раздражители:</span>
            </h3>
            {scanResult.badIngredients.length === 0 ? (
              <div className="px-3 py-2 rounded-2xl bg-emerald-50/60 text-emerald-800 text-[11.5px] font-medium">
                Агрессивных комедогенов и раздражителей не выявлено ✨
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {scanResult.badIngredients.map((bad, i) => {
                  const isDanger = bad.severity === 'danger';
                  return (
                    <div
                      key={i}
                      className={`px-3 py-1.5 rounded-2xl text-[11.5px] border ${
                        isDanger
                          ? 'bg-red-50 border-red-200 text-red-900'
                          : 'bg-amber-50 border-amber-200 text-amber-900'
                      }`}
                    >
                      <span className="font-bold">{bad.name}:</span>{' '}
                      <span>{bad.effect}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Routine Conflict Warning Box */}
          <div
            className={`p-3.5 rounded-2xl border flex items-start gap-2.5 ${
              scanResult.routineConflict.hasConflict
                ? 'bg-red-50/90 border-red-200 text-red-900'
                : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
            }`}
          >
            {scanResult.routineConflict.hasConflict ? (
              <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
            ) : (
              <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            )}
            <div className="text-[12px] leading-snug">
              <span className="font-bold block mb-0.5">
                {scanResult.routineConflict.hasConflict
                  ? 'Внимание: обнаружен конфликт с вашей рутиной!'
                  : 'Безопасно для вашей текущей рутины'}
              </span>
              <span>{scanResult.routineConflict.conflictWarning}</span>
            </div>
          </div>

          {/* Safe Alternative Suggestion */}
          {(showAlternativeCard || scanResult.compatibilityScore < 75 || scanResult.routineConflict.hasConflict) &&
            scanResult.safeAlternative && (
              <div className="p-3.5 rounded-2xl bg-[#FBF8F5] border border-[#EBE4DD] flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#F8715E]">
                    Безопасный аналог от дерматолога
                  </span>
                  <span className="text-[12px] font-bold text-[#1E1B18]">
                    ~{scanResult.safeAlternative.price.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <div className="text-[13.5px] font-bold text-[#1E1B18]">
                  {scanResult.safeAlternative.brand} — {scanResult.safeAlternative.name}
                </div>
                <p className="text-[11.5px] text-[#786F67]">
                  {scanResult.safeAlternative.reason}
                </p>
                <button
                  type="button"
                  onClick={() => onAddScannedToRoutine(scanResult, true)}
                  className="mt-1 py-2.5 px-4 rounded-full bg-[#1E1B18] text-white text-[12px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                >
                  <Plus size={14} />
                  <span>Добавить безопасный аналог в рутину</span>
                </button>
              </div>
            )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => onAddScannedToRoutine(scanResult, false)}
              className="w-full py-3.5 px-4 rounded-full bg-[#F8715E] text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-[0_6px_18px_rgba(248,113,94,0.3)] hover:bg-[#e5604d] active:scale-95 transition-all"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Добавить в мою рутину</span>
            </button>

            {scanResult.safeAlternative && !showAlternativeCard && (
              <button
                type="button"
                onClick={() => setShowAlternativeCard(true)}
                className="w-full py-3 px-4 rounded-full bg-[#F5F2EB] text-[#1E1B18] text-[12.5px] font-bold flex items-center justify-center gap-1.5 hover:bg-[#EAE3DA] active:scale-95 transition-all"
              >
                <RefreshCw size={14} />
                <span>Найти безопасный аналог</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* History of Previously Scanned Jars */}
      {scannedHistory.length > 0 && (
        <section aria-label="Недавно проверенные банки">
          <h3 className="text-[13.5px] font-bold text-[#1E1B18] mb-2.5 px-1">
            Проверенные ранее банки ({scannedHistory.length})
          </h3>
          <div className="flex flex-col gap-2">
            {scannedHistory.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setScanResult(item)}
                className="w-full text-left bg-white rounded-[20px] p-3 border border-[#F2ECE5] flex items-center justify-between hover:border-[#F8715E]/40 transition-all"
              >
                <div className="min-w-0 pr-2">
                  <div className="text-[12.5px] font-bold text-[#1E1B18] truncate">
                    {item.brand} — {item.productName}
                  </div>
                  <div className="text-[11px] text-[#9B9188] truncate mt-0.5">
                    {item.verdictSummary}
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${
                    item.compatibilityScore >= 75
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {item.compatibilityScore}%
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

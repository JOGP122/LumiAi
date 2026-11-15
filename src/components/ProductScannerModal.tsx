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

const ICON_BUTTON =
  'w-9 h-9 rounded-full border border-[#E6DFCF] bg-[#FCFAF4] flex items-center justify-center active:scale-95 transition-transform shrink-0';

const BTN_PRIMARY =
  'w-full h-[52px] rounded-[14px] bg-[#1C1813] text-[#F5F0E5] text-[15px] font-semibold flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform disabled:opacity-40';
const BTN_OUTLINE =
  'w-full h-[52px] rounded-[14px] bg-transparent border border-[#E6DFCF] text-[#1C1813] text-[15px] font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40';

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
      setErrorMsg('Введи название средства / состав INCI или загрузи фото банки');
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

  const verdictMeta = (score: number, hasConflict: boolean) => {
    if (score >= 75 && !hasConflict)
      return { title: 'Подходит твоей коже', chip: 'bg-[#E8EFE4] text-[#3E5A3F]', dot: '#5F7A60' };
    if (score >= 50)
      return { title: 'Подходит с оговорками', chip: 'bg-[#F0E6D1] text-[#84622F]', dot: '#C05F3C' };
    return { title: 'Не рекомендуем для твоей кожи', chip: 'bg-[#F5E3DA] text-[#A8452B]', dot: '#A8452B' };
  };

  const allIngredients = scanResult
    ? [
        ...scanResult.goodIngredients.map((g) => ({
          name: g.name,
          note: g.effect,
          kind: 'good' as const
        })),
        ...scanResult.badIngredients.map((b) => ({
          name: b.name,
          note: b.effect,
          kind: (b.severity === 'danger' ? 'danger' : 'warn') as 'danger' | 'warn'
        }))
      ]
    : [];

  const dotColor = (kind: 'good' | 'warn' | 'danger') =>
    kind === 'good' ? '#5F7A60' : kind === 'warn' ? '#C05F3C' : '#A8452B';

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[#F4F0E8] pb-10 select-none">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoUpload}
        className="hidden"
        aria-label="Загрузить фото банки или состава INCI"
      />

      <div className="flex flex-col gap-5 px-5 pt-6 flex-1">
        {/* Header: back + overline + Cormorant title */}
        <header className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть сканер состава"
            className={ICON_BUTTON}
          >
            <ChevronLeft size={14} className="text-[#1C1813]" />
          </button>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold tracking-[1.8px] uppercase text-[#A87C44]">
              INCI-сканер
            </span>
            <h1 className="font-serif text-[26px] font-medium leading-[30px] text-[#1C1813]">
              Разбор состава
            </h1>
          </div>
        </header>

        {/* Input card */}
        <section className="bg-[#FCFAF4] rounded-[20px] p-[18px] flex flex-col gap-3 shadow-[0_12px_32px_-16px_rgba(61,52,38,0.1)]">
          <div className="flex items-center gap-2 bg-[#ECE5D7]/50 rounded-[12px] px-3.5 py-3 border border-[#E6DFCF]">
            <Search size={15} className="text-[#756C5D] shrink-0" />
            <input
              id="inci-product-input"
              type="text"
              value={productQuery}
              onChange={(e) => setProductQuery(e.target.value)}
              placeholder="Название банки или состав INCI..."
              className="w-full bg-transparent text-[13.5px] font-medium text-[#1C1813] placeholder:text-[#A79C8A] focus:outline-none"
            />
            {productQuery && (
              <button
                type="button"
                onClick={() => setProductQuery('')}
                aria-label="Очистить поле"
                className="text-[#756C5D]"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {imagePreview && (
            <div className="relative w-20 h-20 rounded-[14px] overflow-hidden border border-[#E6DFCF]">
              <img src={imagePreview} alt="Фото банки" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setImagePreview(null)}
                aria-label="Удалить фото"
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#1C1813]/70 text-[#F5F0E5] flex items-center justify-center"
              >
                <X size={11} />
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_PRODUCTS.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setProductQuery(sample);
                  handleAnalyze(sample);
                }}
                className="text-[11px] font-medium px-2.5 py-1.5 rounded-full bg-[#F4F0E8] text-[#756C5D] border border-[#E6DFCF] active:bg-[#F0E6D1] transition-colors"
              >
                {sample}
              </button>
            ))}
          </div>

          <div className="flex gap-2.5">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => fileInputRef.current?.click()}
              className="h-[48px] px-4 rounded-[14px] bg-transparent border border-[#E6DFCF] text-[#1C1813] text-[13px] font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40 shrink-0"
            >
              <Camera size={15} className="text-[#A87C44]" />
              <span>Фото</span>
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleAnalyze()}
              className="flex-1 h-[48px] rounded-[14px] bg-[#1C1813] text-[#F5F0E5] text-[14px] font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-40"
            >
              <Sparkles size={14} className={isLoading ? 'animate-spin' : ''} />
              <span>{isLoading ? 'Разбираем состав...' : 'Проверить банку'}</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-[14px] bg-[#F5E3DA]/70 text-[#A8452B] text-[12px] flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </section>

        {/* Result (screen.inci) */}
        {scanResult && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {/* Product card */}
            <section className="bg-[#FCFAF4] rounded-[20px] p-[18px] flex flex-col gap-2 shadow-[0_12px_32px_-16px_rgba(61,52,38,0.1)]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[11px] font-bold tracking-[1.8px] uppercase text-[#A87C44]">
                    {scanResult.brand}
                  </span>
                  <h2 className="font-serif text-[22px] font-medium leading-[26px] text-[#1C1813]">
                    {scanResult.productName}
                  </h2>
                  <span className="text-[13px] text-[#756C5D]">
                    {scanResult.recommendedStepCategory} • ~
                    {scanResult.estimatedPrice.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <span
                  className={`px-3 py-1.5 rounded-full text-[12px] font-semibold shrink-0 ${
                    verdictMeta(scanResult.compatibilityScore, scanResult.routineConflict.hasConflict).chip
                  }`}
                >
                  {scanResult.compatibilityScore}%
                </span>
              </div>
              <p className="text-[13px] leading-[19px] text-[#756C5D]">
                {scanResult.verdictSummary}
              </p>
            </section>

            {/* Verdict action-row (dark) */}
            <section className="bg-[#1C1813] rounded-[18px] p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-[12px] bg-[#322B22] flex items-center justify-center shrink-0">
                <ShieldCheck size={16} className="text-[#CDA872]" />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[15px] font-semibold text-[#F5F0E5]">
                  {
                    verdictMeta(scanResult.compatibilityScore, scanResult.routineConflict.hasConflict)
                      .title
                  }
                </span>
                <span className="text-[13px] text-[#B4A993]">
                  {scanResult.routineConflict.hasConflict
                    ? 'Обнаружен конфликт с твоей рутиной'
                    : `${scanResult.badIngredients.length === 0 ? '0' : scanResult.badIngredients.length} ${scanResult.badIngredients.length === 1 ? 'компонент требует внимания' : 'компонентов требуют внимания'}`}
                </span>
              </div>
            </section>

            {/* Ingredients list */}
            {allIngredients.length > 0 && (
              <section className="bg-[#FCFAF4] rounded-[20px] p-[18px] flex flex-col gap-3 shadow-[0_12px_32px_-16px_rgba(61,52,38,0.1)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-semibold text-[#1C1813]">Состав</h3>
                  <span className="text-[12px] text-[#A79C8A]">
                    {allIngredients.length}{' '}
                    {allIngredients.length === 1
                      ? 'компонент'
                      : allIngredients.length < 5
                      ? 'компонента'
                      : 'компонентов'}
                  </span>
                </div>
                {allIngredients.map((ing, i) => (
                  <React.Fragment key={i}>
                    <div className="flex gap-3 items-start">
                      <span
                        className="w-2 h-2 rounded-full mt-[5px] shrink-0"
                        style={{ backgroundColor: dotColor(ing.kind) }}
                      />
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-[13.5px] font-semibold text-[#1C1813]">
                          {ing.name}
                        </span>
                        <span className="text-[12px] leading-[16px] text-[#756C5D]">
                          {ing.note}
                        </span>
                      </div>
                    </div>
                    {i < allIngredients.length - 1 && (
                      <div className="w-full h-px bg-[#E6DFCF]" />
                    )}
                  </React.Fragment>
                ))}
              </section>
            )}

            {/* Conflict note */}
            <section
              className={`rounded-[16px] p-4 flex items-start gap-3 ${
                scanResult.routineConflict.hasConflict
                  ? 'bg-[#F0E6D1]'
                  : 'bg-[#E8EFE4]'
              }`}
            >
              {scanResult.routineConflict.hasConflict ? (
                <AlertTriangle size={15} className="text-[#84622F] mt-0.5 shrink-0" />
              ) : (
                <CheckCircle2 size={15} className="text-[#3E5A3F] mt-0.5 shrink-0" />
              )}
              <span className="text-[13px] leading-[19px] text-[#1C1813]">
                {scanResult.routineConflict.conflictWarning}
              </span>
            </section>

            {/* Safe alternative */}
            {(showAlternativeCard ||
              scanResult.compatibilityScore < 75 ||
              scanResult.routineConflict.hasConflict) &&
              scanResult.safeAlternative && (
                <section className="bg-[#FCFAF4] rounded-[20px] p-[18px] flex flex-col gap-2 shadow-[0_12px_32px_-16px_rgba(61,52,38,0.1)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-[1.8px] uppercase text-[#A87C44]">
                      Безопасный аналог
                    </span>
                    <span className="text-[13px] font-semibold text-[#1C1813]">
                      ~{scanResult.safeAlternative.price.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                  <div className="font-serif text-[20px] font-medium leading-[24px] text-[#1C1813]">
                    {scanResult.safeAlternative.brand} — {scanResult.safeAlternative.name}
                  </div>
                  <p className="text-[12.5px] leading-[18px] text-[#756C5D]">
                    {scanResult.safeAlternative.reason}
                  </p>
                  <button
                    type="button"
                    onClick={() => onAddScannedToRoutine(scanResult, true)}
                    className={`${BTN_PRIMARY} mt-1`}
                  >
                    <Plus size={14} />
                    <span>Добавить аналог в рутину</span>
                  </button>
                </section>
              )}

            {/* Actions */}
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => onAddScannedToRoutine(scanResult, false)}
                className={BTN_PRIMARY}
              >
                <Plus size={15} />
                <span>Добавить в мою рутину</span>
              </button>
              {scanResult.safeAlternative && !showAlternativeCard && (
                <button
                  type="button"
                  onClick={() => setShowAlternativeCard(true)}
                  className={BTN_OUTLINE}
                >
                  <RefreshCw size={14} />
                  <span>Найти безопасный аналог</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* History */}
        {scannedHistory.length > 0 && (
          <section aria-label="Недавно проверенные банки">
            <div className="flex items-baseline justify-between mb-2.5 px-1">
              <h3 className="font-serif text-[20px] font-medium text-[#1C1813]">
                Проверенные ранее
              </h3>
              <span className="text-[12px] text-[#A79C8A]">{scannedHistory.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {scannedHistory.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setScanResult(item)}
                  className="w-full text-left bg-[#FCFAF4] rounded-[18px] p-3.5 flex items-center justify-between gap-3 active:bg-[#F0E6D1]/40 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-[#1C1813] truncate">
                      {item.brand} — {item.productName}
                    </div>
                    <div className="text-[11.5px] text-[#756C5D] truncate mt-0.5">
                      {item.verdictSummary}
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 ${
                      verdictMeta(item.compatibilityScore, false).chip
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
    </div>
  );
};

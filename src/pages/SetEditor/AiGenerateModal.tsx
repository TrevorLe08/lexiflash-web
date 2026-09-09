import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { Modal } from "../../components/common/Modal";
import { Button } from "../../components/common/Button";
import { AudioButton } from "../../components/study/AudioButton";
import {
  Sparkles,
  Layers,
  Crown,
  CheckCircle2,
  Lightbulb,
  ExternalLink,
} from "lucide-react";
import { Select } from "../../components/common/Select";
import { aiApi, AiGeneratedSetData } from "../../api/aiApi";
import { useTranslation } from "../../i18n";
import { cn } from "../../utils/cn";

export interface GeneratedCardItem {
  term: string;
  definition: string;
  phonetic?: string;
  example?: string;
  hint?: string;
}

interface AiGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertCards: (cards: GeneratedCardItem[]) => void;
  targetSetId?: string;
  isVip: boolean;
  isDiamond: boolean;
  isGold: boolean;
}

interface AiFormValues {
  prompt: string;
  cardCount: number;
}

export const AiGenerateModal: React.FC<AiGenerateModalProps> = ({
  isOpen,
  onClose,
  onInsertCards,
  targetSetId,
  isVip,
  isDiamond,
  isGold,
}) => {
  const { t } = useTranslation();
  const { register, handleSubmit, setValue, reset, watch } =
    useForm<AiFormValues>({
      defaultValues: {
        prompt: "",
        cardCount: 8,
      },
    });
  const cardCount = watch("cardCount");

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSet, setGeneratedSet] = useState<AiGeneratedSetData | null>(
    null,
  );
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      reset();
      setGeneratedSet(null);
      setSelectedIndices([]);
      setErrorMsg(null);
    }
  }, [isOpen, reset]);

  const samplePrompts = [
    "10 từ vựng IELTS Reading về Môi trường & Biến đổi khí hậu",
    "8 Phrasal Verbs thông dụng trong giao tiếp công sở",
    "Từ vựng miêu tả cảm xúc & tính cách con người (kèm ví dụ)",
    "TOEIC Business meeting and contract negotiation phrases",
  ];

  const handleGenerate = async (data: AiFormValues) => {
    const promptToUse = (data.prompt || "").trim();
    if (!promptToUse) return;

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const res = await aiApi.generateSet({
        prompt: promptToUse,
        cardCount: Number(data.cardCount) || 8,
      });
      setGeneratedSet(res.data);
      // Pre-select all generated cards
      setSelectedIndices(res.data.cards.map((_, idx) => idx));
    } catch (err: any) {
      setErrorMsg(
        err.message ||
          t(
            "ai.generateFailed",
            undefined,
            "AI Generation failed. Please try again.",
          ),
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleCardSelection = (index: number) => {
    setSelectedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const handleInsert = () => {
    if (!generatedSet) return;
    const cardsToInsert = generatedSet.cards.filter((_, idx) =>
      selectedIndices.includes(idx),
    );
    if (cardsToInsert.length === 0) return;

    onInsertCards(cardsToInsert);
    onClose();
    // Reset state
    setGeneratedSet(null);
    reset();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/20 to-pink-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-pink-400" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>{t("ai.title", undefined, "Tạo từ vựng bằng AI")}</span>
              {isDiamond ? (
                <span className="text-[10px] font-extrabold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                  VIP Diamond
                </span>
              ) : isGold ? (
                <span className="text-[10px] font-extrabold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  VIP Gold
                </span>
              ) : null}
            </h3>
            <p className="text-xs text-[#8e98b0]">
              Tự động tạo flashcards thông minh và chèn trực tiếp vào học phần
            </p>
          </div>
        </div>
      }
      maxWidth="3xl"
    >
      <div className="space-y-5">
        {!isVip ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">
                Mở khóa Trợ lý AI với gói VIP
              </h4>
              <p className="text-xs text-[#8e98b0] max-w-sm mx-auto mt-1">
                Tính năng tạo flashcards và giải nghĩa từ vựng chuyên sâu bằng
                AI dành riêng cho thành viên VIP Gold & VIP Diamond.
              </p>
            </div>
            <Link to="/vip" onClick={onClose}>
              <Button
                variant="primary"
                size="md"
                icon={<Crown className="w-4 h-4" />}
              >
                Nâng cấp VIP ngay 👑
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Input prompt & count */}
            <form
              onSubmit={handleSubmit(handleGenerate)}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs font-bold text-[#8e98b0] uppercase tracking-wider mb-1.5">
                  {t(
                    "ai.promptLabel",
                    undefined,
                    "Chủ đề, đoạn văn hoặc yêu cầu từ vựng:",
                  )}
                </label>
                <textarea
                  rows={3}
                  {...register("prompt", { required: true })}
                  placeholder={t(
                    "ai.promptPlaceholder",
                    undefined,
                    "Nhập chủ đề hoặc dán đoạn văn/bài báo tiếng Anh vào đây...",
                  )}
                  className="w-full bg-[#131722] border border-[#262e48] focus:border-[#4f5fd8] text-white text-xs sm:text-sm rounded-xl p-3 outline-none transition-colors resize-none placeholder:text-[#586380]"
                />
              </div>

              {/* Sample prompts */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-[#8e98b0]">
                  Gợi ý chủ đề nhanh:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {samplePrompts.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setValue("prompt", p)}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[#131722] hover:bg-[#242b42] text-[#8e98b0] hover:text-white border border-[#262e48] transition-colors cursor-pointer text-left"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#8e98b0]">
                    Số lượng thẻ:
                  </span>
                  <Select
                    value={String(cardCount)}
                    onChange={(val) => setValue("cardCount", Number(val))}
                    options={[
                      { value: "5", label: "5 thẻ" },
                      { value: "8", label: "8 thẻ" },
                      { value: "10", label: "10 thẻ" },
                      { value: "12", label: "12 thẻ" },
                      { value: "15", label: "15 thẻ" },
                    ]}
                    icon={<Layers className="w-3.5 h-3.5 text-[#4f5fd8]" />}
                  />
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  size="md"
                  loading={isGenerating}
                  icon={<Sparkles className="w-4 h-4" />}
                  className="justify-center font-bold"
                >
                  Tạo từ vựng bằng AI ✨
                </Button>
              </div>
            </form>

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-medium">
                {errorMsg}
              </div>
            )}

            {/* Generated Cards Result Preview */}
            {generatedSet && (
              <div className="border-t border-[#262e48] pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{generatedSet.title}</span>
                      <span className="text-xs font-normal text-[#8e98b0]">
                        ({selectedIndices.length}/{generatedSet.cards.length}{" "}
                        thẻ được chọn)
                      </span>
                    </h4>
                    {generatedSet.description && (
                      <p className="text-xs text-[#8e98b0] line-clamp-1">
                        {generatedSet.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedIndices(
                          selectedIndices.length === generatedSet.cards.length
                            ? []
                            : generatedSet.cards.map((_, i) => i),
                        )
                      }
                      className="text-xs font-bold text-[#9cb1ff] hover:underline cursor-pointer"
                    >
                      {selectedIndices.length === generatedSet.cards.length
                        ? "Bỏ chọn tất cả"
                        : "Chọn tất cả"}
                    </button>
                  </div>
                </div>

                {/* Cards List */}
                <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {generatedSet.cards.map((card, idx) => {
                    const isSelected = selectedIndices.includes(idx);
                    return (
                      <div
                        key={idx}
                        onClick={() => handleToggleCardSelection(idx)}
                        className={cn(
                          "p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none",
                          isSelected
                            ? "bg-[#1a1f30] border-[#4f5fd8]/50 ring-1 ring-[#4f5fd8]/20"
                            : "bg-[#131722] border-[#262e48] opacity-60 hover:opacity-100",
                        )}
                      >
                        <div
                          className={cn(
                            "w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                            isSelected
                              ? "bg-[#4f5fd8] border-[#4f5fd8] text-white"
                              : "border-[#262e48] bg-[#131722]",
                          )}
                        >
                          {isSelected && (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-black text-white">
                              {card.term}
                            </span>
                            {card.phonetic && (
                              <span className="text-[11px] font-mono text-[#8e98b0]">
                                {card.phonetic}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-emerald-400">
                            {card.definition}
                          </p>
                          {card.example && (
                            <p className="text-[11px] text-[#8e98b0] italic">
                              "{card.example}"
                            </p>
                          )}
                          {card.hint && (
                            <p className="text-[10px] text-amber-300/90 flex items-center gap-1">
                              <Lightbulb className="w-3 h-3 text-amber-400 shrink-0" />
                              <span>{card.hint}</span>
                            </p>
                          )}
                        </div>

                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="shrink-0"
                        >
                          <AudioButton text={card.term} size="sm" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#262e48]">
                  <Link
                    to={
                      targetSetId
                        ? `/ai-generator?targetSetId=${targetSetId}`
                        : "/ai-generator"
                    }
                    target="_blank"
                    className="text-xs text-[#8e98b0] hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <span>Mở trang AI Generator đầy đủ</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <Button variant="secondary" size="md" onClick={handleClose}>
                      Hủy
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      disabled={selectedIndices.length === 0}
                      onClick={handleInsert}
                      icon={<CheckCircle2 className="w-4 h-4" />}
                      className="font-bold flex-1 sm:flex-initial"
                    >
                      Chèn {selectedIndices.length} từ vào học phần
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

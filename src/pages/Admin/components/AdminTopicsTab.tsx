import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../../components/common/Button";
import { Spinner } from "../../../components/common/Spinner";
import {
  Tag,
  Plus,
  RotateCcw,
  Save,
  Hash,
  Eye,
  Trash2,
} from "lucide-react";

export const DEFAULT_TOPICS_LIST = [
  "Speaking",
  "IELTS",
  "Daily English",
  "Business",
  "Workplace",
  "Academic",
  "Writing",
  "Reading",
  "Negotiation",
  "Communication",
];

export interface AdminTopicsTabProps {
  topics: string[];
  onChangeTopics: (newTopics: string[]) => void;
  onSave: () => Promise<void>;
  onReset: () => void;
  isSaving: boolean;
  isLoading: boolean;
}

export const AdminTopicsTab: React.FC<AdminTopicsTabProps> = React.memo(
  ({ topics, onChangeTopics, onSave, onReset, isSaving, isLoading }) => {
    const {
      register,
      handleSubmit,
      reset,
      setError,
      formState: { errors },
    } = useForm<{ topic: string }>({
      defaultValues: { topic: "" },
    });

    const handleAddTopic = (data: { topic: string }) => {
      const clean = data.topic.trim().replace(/^#+/, "");
      if (!clean) {
        setError("topic", { message: "Vui lòng nhập tên chủ đề" });
        return;
      }
      if (topics.some((t) => t.toLowerCase() === clean.toLowerCase())) {
        setError("topic", { message: `Chủ đề "${clean}" đã có trong danh sách` });
        return;
      }
      onChangeTopics([...topics, clean]);
      reset({ topic: "" });
    };

    const handleRemoveTopic = (indexToRemove: number) => {
      onChangeTopics(topics.filter((_, idx) => idx !== indexToRemove));
    };

    const handleMoveTopic = (index: number, direction: "up" | "down") => {
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= topics.length) return;
      const copy = [...topics];
      const [moved] = copy.splice(index, 1);
      if (moved) {
        copy.splice(newIndex, 0, moved);
        onChangeTopics(copy);
      }
    };

    return (
      <div className="space-y-6">
        {/* Intro Card */}
        <div className="bg-[#1a1d36] border border-[#2e3856] rounded-2xl p-6 shadow-lg relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-[#9cb1ff] text-xs font-bold uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5" />
                <span>Quản lý chủ đề trang chủ (Featured Topics)</span>
              </div>
              <h2 className="text-xl font-black text-white">
                Tùy chỉnh danh sách chủ đề nổi bật trên Homepage
              </h2>
              <p className="text-xs sm:text-sm text-[#939bb4] max-w-2xl">
                Các hashtag chủ đề này sẽ được hiển thị trực tiếp ở thanh lọc khám phá đầu trang chủ.
                Người học có thể bấm vào để lọc nhanh các học phần tương ứng.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="secondary"
                size="md"
                onClick={onReset}
                icon={<RotateCcw className="w-4 h-4 text-[#939bb4]" />}
                className="cursor-pointer"
              >
                Khôi phục mặc định
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={onSave}
                disabled={isSaving || isLoading}
                icon={<Save className="w-4 h-4" />}
                className="cursor-pointer"
              >
                {isSaving ? "Đang lưu..." : "Lưu cấu hình"}
              </Button>
            </div>
          </div>
        </div>

        {/* Real-time Homepage Preview */}
        <div className="bg-[#0f111a] border border-[#2e3856] rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Eye className="w-4 h-4" />
              <span>Xem trước trên Trang chủ (Live Homepage Preview)</span>
            </div>
            <span className="text-xs text-[#939bb4] font-mono">
              {topics.length} chủ đề đang hoạt động
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#0a092d] border border-white/[0.08] overflow-x-auto">
            <div className="flex flex-wrap items-center gap-1.5 min-w-max">
              <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#4f5fd8]/20 text-[#9cb1ff] border border-[#4f5fd8]/40">
                Tất cả chủ đề
              </span>
              {topics.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#121420] text-[#8e98b0] border border-white/[0.08]"
                >
                  #{tag}
                </span>
              ))}
              {topics.length === 0 && (
                <span className="text-xs text-[#545d78] italic py-1">
                  Chưa có chủ đề nào được chọn. Hãy thêm chủ đề bên dưới.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Add and Manage Tags Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Add New Topic Form */}
          <div className="lg:col-span-5 bg-[#1a1d36] border border-[#2e3856] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Plus className="w-4 h-4 text-[#6366F1]" />
              <span>Thêm chủ đề mới</span>
            </div>
            <p className="text-xs text-[#939bb4]">
              Nhập tên chủ đề (VD: TOEIC, Travel, Pronunciation, Phrasal Verbs) rồi bấm Thêm hoặc nhấn Enter.
            </p>

            <form onSubmit={handleSubmit(handleAddTopic)} className="space-y-3">
              <div className="relative">
                <Hash className="w-4 h-4 text-[#939bb4] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ví dụ: Daily English"
                  {...register("topic")}
                  className="w-full bg-[#0a092d] text-white placeholder-[#545d78] border border-[#2e3856] rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-[#4257B2]"
                />
              </div>
              {errors.topic && (
                <p className="text-xs text-rose-400 font-medium">
                  {errors.topic.message}
                </p>
              )}

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full justify-center cursor-pointer"
                icon={<Plus className="w-4 h-4" />}
              >
                Thêm vào danh sách
              </Button>
            </form>

            <div className="pt-4 border-t border-[#2e3856] space-y-2">
              <span className="text-xs font-bold text-[#939bb4] uppercase tracking-wider block">
                Gợi ý phổ biến:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Grammar",
                  "Vocabulary",
                  "TOEIC 800+",
                  "Travel",
                  "Phrasal Verbs",
                  "Idioms",
                  "Pronunciation",
                  "Oxford 3000",
                ].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    disabled={topics.some((t) => t.toLowerCase() === sug.toLowerCase())}
                    onClick={() => {
                      if (!topics.some((t) => t.toLowerCase() === sug.toLowerCase())) {
                        onChangeTopics([...topics, sug]);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                      topics.some((t) => t.toLowerCase() === sug.toLowerCase())
                        ? "bg-[#0a092d]/50 text-[#545d78] border border-transparent cursor-not-allowed"
                        : "bg-[#0a092d] text-[#939bb4] hover:text-white border border-[#2e3856] hover:border-[#6366F1]"
                    }`}
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Current Topic Items List */}
          <div className="lg:col-span-7 bg-[#1a1d36] border border-[#2e3856] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Tag className="w-4 h-4 text-amber-400" />
                <span>Danh sách chủ đề hiện tại ({topics.length})</span>
              </div>
              <span className="text-xs text-[#939bb4]">
                Kéo hoặc chuyển vị trí để sắp xếp thứ tự hiển thị
              </span>
            </div>

            {isLoading ? (
              <Spinner size="md" label="Đang tải chủ đề..." className="py-12" />
            ) : topics.length === 0 ? (
              <div className="text-center py-12 bg-[#0a092d] rounded-xl border border-dashed border-[#2e3856] space-y-2">
                <Tag className="w-8 h-8 text-[#545d78] mx-auto" />
                <p className="text-sm font-semibold text-white">Chưa có chủ đề nào</p>
                <p className="text-xs text-[#939bb4]">
                  Nhập chủ đề ở khung bên trái hoặc nhấn "Khôi phục mặc định"
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {topics.map((topic, index) => (
                  <div
                    key={`${topic}-${index}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#0a092d] border border-[#2e3856] hover:border-[#4257B2] transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-md bg-[#1a1d36] text-[#939bb4] font-mono text-xs flex items-center justify-center font-bold shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-sm font-bold text-white group-hover:text-[#9cb1ff] transition-colors truncate">
                        #{topic}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Move Up */}
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveTopic(index, "up")}
                        className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                          index === 0
                            ? "text-[#545d78] cursor-not-allowed opacity-40"
                            : "text-[#939bb4] hover:text-white hover:bg-[#1a1d36]"
                        }`}
                        title="Di chuyển lên trước"
                      >
                        ▲
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        disabled={index === topics.length - 1}
                        onClick={() => handleMoveTopic(index, "down")}
                        className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                          index === topics.length - 1
                            ? "text-[#545d78] cursor-not-allowed opacity-40"
                            : "text-[#939bb4] hover:text-white hover:bg-[#1a1d36]"
                        }`}
                        title="Di chuyển xuống sau"
                      >
                        ▼
                      </button>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => handleRemoveTopic(index)}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 transition-colors ml-1 cursor-pointer"
                        title="Xóa chủ đề này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);

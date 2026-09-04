import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Modal } from "../../components/common/Modal";
import { Button } from "../../components/common/Button";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { useTranslation } from "../../i18n";

interface ParsedCard {
  term: string;
  definition: string;
  phonetic?: string;
  example?: string;
  hint?: string;
}

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (cards: ParsedCard[]) => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const { t } = useTranslation();

  // Excel / CSV file state
  const [file, setFile] = useState<File | null>(null);
  const [fileCards, setFileCards] = useState<ParsedCard[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (selectedFile: File) => {
    setFile(selectedFile);
    setFileError(null);
    setFileCards([]);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        setFileError(
          t(
            "setEditor.bulkNoSheets",
            undefined,
            "No sheets found in the uploaded workbook.",
          ),
        );
        return;
      }

      const worksheet = workbook.Sheets[firstSheetName];
      if (!worksheet) {
        setFileError(
          t("setEditor.bulkEmptySheet", undefined, "Sheet is empty."),
        );
        return;
      }

      const rawRows: Array<Array<string | number | undefined>> =
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: "",
        });

      if (!rawRows || rawRows.length === 0) {
        setFileError(
          t("setEditor.bulkEmptyFile", undefined, "File contains no data."),
        );
        return;
      }

      const parsed: ParsedCard[] = [];

      for (let i = 0; i < rawRows.length; i++) {
        const row = rawRows[i];
        if (!row || row.length === 0) continue;

        const col0 = String(row[0] || "").trim();
        const col1 = String(row[1] || "").trim();
        const col2 = row[2] !== undefined ? String(row[2]).trim() : undefined;
        const col3 = row[3] !== undefined ? String(row[3]).trim() : undefined;
        const col4 = row[4] !== undefined ? String(row[4]).trim() : undefined;

        // Skip header row if it contains column labels like "term", "từ", "definition", "nghĩa"
        if (
          i === 0 &&
          (col0.toLowerCase().includes("term") ||
            col0.toLowerCase().includes("word") ||
            col0.toLowerCase().includes("từ") ||
            col1.toLowerCase().includes("definition") ||
            col1.toLowerCase().includes("nghĩa") ||
            col1.toLowerCase().includes("meaning"))
        ) {
          continue;
        }

        if (col0 && col1) {
          parsed.push({
            term: col0,
            definition: col1,
            phonetic: col2,
            example: col3,
            hint: col4,
          });
        }
      }

      if (parsed.length === 0) {
        setFileError(
          t(
            "setEditor.bulkExtractError",
            undefined,
            "Could not extract any valid vocabulary terms. Ensure Column A is Term and Column B is Definition.",
          ),
        );
        return;
      }

      setFileCards(parsed);
    } catch {
      setFileError(
        t(
          "setEditor.bulkReadError",
          undefined,
          "Failed to read file. Please ensure it is a valid Excel (.xlsx, .xls) or CSV file.",
        ),
      );
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleImportFileCards = () => {
    if (fileCards.length > 0) {
      onImport(fileCards);
      handleReset();
      onClose();
    }
  };

  const handleReset = () => {
    setFile(null);
    setFileCards([]);
    setFileError(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleReset();
        onClose();
      }}
      title={t(
        "setEditor.bulkModalTitleFile",
        undefined,
        "Import Flashcards from File (Excel / CSV)",
      )}
      maxWidth="lg"
    >
      <div className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileProcess(e.target.files[0]);
            }
          }}
          className="hidden"
        />

        {!file ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-[#6366F1] bg-indigo-950/30"
                : "border-[#2e3856] bg-[#0a092d]/60 hover:bg-[#0a092d] hover:border-[#4257B2]"
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">
              {t(
                "setEditor.bulkDragDrop",
                undefined,
                "Click to browse or drag & drop Excel / CSV file",
              )}
            </h4>
            <p className="text-xs text-[#939bb4]">
              {t(
                "setEditor.bulkSupportedFormats",
                undefined,
                "Supports .xlsx, .xls, and .csv files",
              )}
            </p>
            <p className="text-[11px] text-[#586380] mt-2">
              {t(
                "setEditor.bulkColumnHelp",
                undefined,
                "Format: Col A = Term | Col B = Definition | Col C = Phonetic | Col D = Example",
              )}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* File Header Card */}
            <div className="flex items-center justify-between p-3.5 bg-[#0a092d] border border-[#2e3856] rounded-2xl">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-[#939bb4]">
                    {(file.size / 1024).toFixed(1)} KB • {fileCards.length}{" "}
                    {t(
                      "setEditor.bulkTermsDetected",
                      undefined,
                      "terms detected",
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="p-1.5 text-[#939bb4] hover:text-white rounded-lg hover:bg-[#1a1d36] transition-colors cursor-pointer"
                title={t(
                  "setEditor.bulkChangeFile",
                  undefined,
                  "Change file",
                )}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error message */}
            {fileError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{fileError}</span>
              </div>
            )}

            {/* Parsed Cards Preview */}
            {fileCards.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#939bb4]">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t(
                      "setEditor.bulkPreviewTitle",
                      { count: fileCards.length },
                      `Previewing ${fileCards.length} vocabulary cards`,
                    )}
                  </span>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {fileCards.slice(0, 8).map((c, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-[#0a092d] border border-[#2e3856] rounded-xl text-xs"
                    >
                      <div className="min-w-0 pr-3">
                        <span className="font-bold text-white block truncate">
                          {c.term}
                        </span>
                        <span className="text-[#939bb4] truncate block mt-0.5">
                          {c.definition}
                        </span>
                      </div>
                      {c.phonetic && (
                        <span className="font-mono text-[11px] text-indigo-300 bg-indigo-950/40 px-2 py-0.5 rounded shrink-0">
                          {c.phonetic}
                        </span>
                      )}
                    </div>
                  ))}
                  {fileCards.length > 8 && (
                    <p className="text-[11px] text-center text-[#586380] py-1 italic">
                      {t(
                        "setEditor.bulkMoreTerms",
                        { count: fileCards.length - 8 },
                        `+ ${fileCards.length - 8} more terms ready to import`,
                      )}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2e3856]/50">
          <Button variant="ghost" size="md" onClick={onClose}>
            {t("common.cancel", undefined, "Cancel")}
          </Button>
          <Button
            variant="primary"
            size="md"
            disabled={fileCards.length === 0}
            onClick={handleImportFileCards}
            icon={<FileSpreadsheet className="w-4 h-4" />}
          >
            {t(
              "setEditor.bulkImportAction",
              { count: fileCards.length },
              `Import ${fileCards.length > 0 ? `${fileCards.length} Cards` : ""}`,
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  className,
  label,
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-6 text-[#939bb4]",
        className,
      )}
    >
      <Loader2
        className={cn("animate-spin text-[#4257B2]", sizeClasses[size])}
      />
      {label && <p className="text-sm font-medium">{label}</p>}
    </div>
  );
};

import { cn } from "@/lib/utils";

export type RiskLevel = "safe" | "warning" | "alert" | "danger";

interface RiskBadgeProps {
  level: RiskLevel;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const RiskBadge = ({ level, label, size = "md", className }: RiskBadgeProps) => {
  const labels = {
    safe: label || "Seguro",
    warning: label || "Precaución",
    alert: label || "Alerta",
    danger: label || "Peligro"
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base"
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full font-semibold",
        level === "safe" && "bg-safe text-safe-foreground",
        level === "warning" && "bg-warning text-warning-foreground",
        level === "alert" && "bg-alert text-alert-foreground",
        level === "danger" && "bg-danger text-danger-foreground",
        sizeClasses[size],
        className
      )}
    >
      <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
      {labels[level]}
    </div>
  );
};

export default RiskBadge;

import React from "react";
import { FileText } from "lucide-react";

interface IdeaVaultLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: { icon: "w-6 h-6", text: "text-sm" },
  md: { icon: "w-8 h-8", text: "text-base" },
  lg: { icon: "w-10 h-10", text: "text-lg" },
  xl: { icon: "w-12 h-12", text: "text-xl" },
};

export const IdeaVaultLogo: React.FC<IdeaVaultLogoProps> = ({
  size = "md",
  className = "",
}) => {
  const { icon, text } = sizeMap[size];

  // Always use dark theme colors
  const colors = {
    bg: "bg-[#5A827E]",
    icon: "text-[#FAFFCA]",
    text: "text-white",
  };

  // Get icon size for the FileText component
  const iconSize = icon.includes("6")
    ? "w-4 h-4"
    : icon.includes("8")
    ? "w-5 h-5"
    : icon.includes("10")
    ? "w-6 h-6"
    : "w-7 h-7";

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div
        className={`${icon} ${colors.bg} rounded-lg flex items-center justify-center shadow-sm border border-gray-200`}
      >
        <FileText className={`${iconSize} ${colors.icon}`} />
      </div>
      <span className={`font-bold ${text} ${colors.text}`}>IdeaVault</span>
    </div>
  );
};

export default IdeaVaultLogo;

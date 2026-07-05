interface AvatarProps {
  letter: string;
  colorClass: string;
  size?: "sm" | "md" | "lg";
  online?: boolean;
}

export default function Avatar({ letter, colorClass, size = "md", online }: AvatarProps) {
  const sizes = {
    sm: "w-8 h-8 text-xs rounded-[9px]",
    md: "w-10 h-10 text-sm rounded-[11px]",
    lg: "w-12 h-12 text-base rounded-[13px]",
  };

  return (
    <div className="relative flex-shrink-0">
      <div className={`bg-gradient-to-br ${colorClass} ${sizes[size]} flex items-center justify-center font-bold font-syne text-white`}>
        {letter}
      </div>
      {online !== undefined && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#111116] ${
            online ? "bg-[#22c55e]" : "bg-[#3a3a3a]"
          }`}
        />
      )}
    </div>
  );
}

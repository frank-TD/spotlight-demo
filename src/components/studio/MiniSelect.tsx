"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Compact value selector used in the model picker settings rows and the dock
// summary bar. Renders "label ▾" and a checkmark menu.
export default function MiniSelect<T extends string | number>({
  value,
  options,
  onChange,
  align = "end",
  className,
  format,
}: {
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
  align?: "start" | "end";
  className?: string;
  format?: (v: T) => string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex items-center gap-1 font-label text-label-md text-on-surface hover:text-primary transition-colors",
          className
        )}
      >
        {format ? format(value) : String(value)}
        <ChevronDown className="w-3.5 h-3.5 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="min-w-[120px]">
        {options.map((opt) => (
          <DropdownMenuItem
            key={String(opt)}
            onClick={() => onChange(opt)}
            className={cn("gap-2 cursor-pointer", opt === value && "text-primary")}
          >
            {opt === value ? <Check className="w-3.5 h-3.5" /> : <span className="w-3.5 h-3.5" />}
            {format ? format(opt) : String(opt)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

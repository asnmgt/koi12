"use client";

import { HelpCircleIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useCallback } from "react";

const tooltipIconVariants = cva("cursor-pointer", {
  variants: {
    size: {
      sm: "h-4 w-4",
      md: "h-5 w-5",
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

interface TooltipExplanationProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tooltipIconVariants> {
  text: string;
  side?: "top" | "right" | "bottom" | "left";
}

export function TooltipExplanation({
  text,
  size,
  className,
  side = "top",
}: TooltipExplanationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <HelpCircleIcon
            className={cn(tooltipIconVariants({ size }), className)}
            onClick={handleClick}
          />
        </TooltipTrigger>
        <TooltipContent side={side}>
          <p className="max-w-xs">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

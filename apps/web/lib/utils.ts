import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn() - utility to merge classNames with Tailwind conflict resolution.
 */
export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

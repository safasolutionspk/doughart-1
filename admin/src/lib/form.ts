import { cn } from "@/lib/cn";

export const inputClassName = cn(
  "admin-input",
  "disabled:cursor-not-allowed disabled:opacity-60",
);

export const textareaClassName = cn(
  inputClassName,
  "h-auto min-h-[5rem] resize-y py-2.5",
);

export const labelClassName = "admin-label !normal-case !tracking-normal !text-sm !text-brand-brown";

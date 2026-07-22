"use client";

import { clampDescription } from "@/lib/catalog/description";

type DescriptionTextareaProps = {
  id: string;
  label: string;
  value: string;
  maxLength: number;
  onChange: (value: string) => void;
  disabled?: boolean;
  fieldClassName?: string;
  labelClassName?: string;
};

export function DescriptionTextarea({
  id,
  label,
  value,
  maxLength,
  onChange,
  disabled,
  fieldClassName,
  labelClassName,
}: DescriptionTextareaProps) {
  const count = value.length;

  return (
    <div>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        maxLength={maxLength}
        disabled={disabled}
        rows={4}
        onChange={(event) =>
          onChange(clampDescription(event.target.value, maxLength))
        }
        className={fieldClassName}
      />
      <p className="mt-1 text-right text-xs text-brand-muted">
        {count}/{maxLength}
      </p>
    </div>
  );
}

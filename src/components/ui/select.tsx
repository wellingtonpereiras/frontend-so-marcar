import * as React from "react";

type Option = { value: string; label: string; subtitle?: string };

type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  id?: string;
};

export function Select({ value, onChange, options, placeholder = "Selecione...", id }: SelectProps) {
  return (
    <select
      id={id}
      className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-gray-400"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="" disabled>
      {placeholder}
      </option>
      {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}{opt.subtitle ? ` — ${opt.subtitle}` : ""}
      </option>
      ))}
    </select>
  );
}

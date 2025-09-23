import React from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function InputField({
  className = "",
  ...props
}: InputFieldProps) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white ${className}`}
    />
  );
}

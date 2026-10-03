// src/components/FormatAmount.tsx
import React from "react";

interface FormatAmountProps {
  amount: number;
  currency?: string;
  className?: string;
}

export const FormatAmount: React.FC<FormatAmountProps> = ({
  amount,
  currency = "€",
  className = "",
}) => {
  const isNegative = amount < 0;
  const absoluteValue = Math.abs(amount);
  
  // Rozdelenie sumy na celé čísla a centy
  const [whole, decimals] = absoluteValue.toFixed(2).split(".");
  const formattedWhole = Number(whole).toLocaleString("sk-SK");

  return (
    <div className={`inline-flex items-baseline ${isNegative ? "text-[#C80036]" : "text-slate-900"} ${className}`}>
      {isNegative && <span className="text-2xl sm:text-3xl font-extrabold mr-0.5">-</span>}
      <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">
        {formattedWhole}
      </span>
      <span className="text-xs sm:text-sm font-bold align-top relative -top-2 ml-0.5">
        ,{decimals} {currency}
      </span>
    </div>
  );
};

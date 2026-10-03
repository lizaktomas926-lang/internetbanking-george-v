// src/components/ProductCard.tsx
import React from "react";
import { MoreVertical } from "lucide-react";
import { FormatAmount } from "./FormatAmount";

interface ProductCardProps {
  title: string;
  accentColor: string; // napr. "bg-[#D8005A]" pre Účet
  amount: number;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  avatarUrl?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  title,
  accentColor,
  amount,
  subtitle,
  actionLabel,
  onAction,
  avatarUrl,
}) => {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col justify-between transition-all hover:shadow-md">
      {/* Akcentový farebný pásik úplne hore */}
      <div className={`h-1.5 w-full ${accentColor}`} />

      <div className="p-5 flex-1 flex flex-col justify-between">
        {/* Hlavička karty */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            {avatarUrl && (
              <img
                src={avatarUrl}
                alt={title}
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
            )}
          </div>

          {/* Suma s horným indexom */}
          <div className="my-1">
            <FormatAmount amount={amount} />
            {subtitle && (
              <p className="text-xs text-slate-500 font-medium mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Spodná lišta s Pill tlačidlom a menu */}
        <div className="flex justify-between items-center mt-5 pt-1">
          {actionLabel ? (
            <button
              onClick={onAction}
              className="bg-[#EBF3FC] text-[#196EE6] hover:bg-[#dbe9f9] text-xs font-semibold px-4 py-2 rounded-full transition-colors"
            >
              {actionLabel}
            </button>
          ) : (
            <div />
          )}

          <button 
            aria-label="Možnosti"
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-50 transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export function Amount({ value }: { value: number }) {
  const neg = value < 0;
  const abs = Math.abs(value);
  const whole = Math.floor(abs).toLocaleString("sk-SK");
  const cents = String(Math.round((abs - Math.floor(abs)) * 100)).padStart(2, "0");
  return (
    <span className={neg ? "text-destructive" : "text-foreground"}>
      {neg ? "-" : ""}
      {whole},<sup className="text-[0.55em] font-semibold">{cents}</sup> €
    </span>
  );
}

import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useRef, type ReactNode } from "react";

const order = ["/", "/platby", "/sporenie", "/rozpocet"] as const;

export function SwipeNav({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const start = useRef<{ x: number; y: number; t: number } | null>(null);

  const index = order.findIndex((p) => (p === "/" ? path === "/" : path === p));

  return (
    <div
      onTouchStart={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest("input,textarea,select,[data-no-swipe]")) {
          start.current = null;
          return;
        }
        const t = e.touches[0];
        if (!t) return;
        start.current = { x: t.clientX, y: t.clientY, t: Date.now() };
      }}
      onTouchEnd={(e) => {
        const s = start.current;
        start.current = null;
        if (!s || index < 0) return;
        const t = e.changedTouches[0];
        if (!t) return;
        const dx = t.clientX - s.x;
        const dy = t.clientY - s.y;
        if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.5 || Date.now() - s.t > 800) return;
        const next = dx < 0 ? index + 1 : index - 1;
        if (next < 0 || next >= order.length) return;
        const to = order[next];
        if (to) navigate({ to });
      }}
    >
      {children}
    </div>
  );
}

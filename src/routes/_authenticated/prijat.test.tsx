import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Prijat from "./prijat";

// Mock navigácie TanStack Router
const mockNavigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => () => ({ component: Prijat }),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

// Mock bank-store
const mockAddTransaction = vi.fn();
vi.mock("@/lib/bank-store", () => ({
  useBank: () => ({
    owner: "Ján Vážny",
    iban: "SK31 1200 0000 0019 8742 1100",
  }),
  addTransaction: (...args: unknown[]) => mockAddTransaction(...args),
  CATEGORIES: ["Ostatné príjmy", "Mzda", "Prevod"],
}));

// Mock toast hlásení
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock obalu AppShell a hlavičky
vi.mock("@/components/bank/AppShell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BrandHeader: ({ title }: { title: string }) => <header>{title}</header>,
}));

describe("Stránka Prijať peniaze (prijat.tsx)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("zobrazí chybu pri prázdnom odosielateľovi", async () => {
    const user = userEvent.setup();
    render(<Prijat />);

    const submitBtn = screen.getByRole("button", { name: /pridať príjem na účet/i });
    await user.click(submitBtn);

    expect(screen.getByText("Zadajte odosielateľa.")).toBeDefined();
    expect(mockAddTransaction).not.toHaveBeenCalled();
  });

  it("zobrazí chybu pri neplatnej alebo nulovej sume", async () => {
    const user = userEvent.setup();
    render(<Prijat />);

    const senderInput = screen.getByPlaceholderText("Meno odosielateľa alebo spoločnosti");
    const amountInput = screen.getByPlaceholderText("0,00");
    const submitBtn = screen.getByRole("button", { name: /pridať príjem na účet/i });

    // Zadáme meno, ale sumu 0
    await user.type(senderInput, "Peter Novák");
    await user.type(amountInput, "0");
    await user.click(submitBtn);

    expect(screen.getByText("Zadajte platnú sumu.")).toBeDefined();
    expect(mockAddTransaction).not.toHaveBeenCalled();
  });

  it("úspešne uloží príjem a presmeruje na /platby", async () => {
    const user = userEvent.setup();
    mockAddTransaction.mockResolvedValueOnce(undefined);

    render(<Prijat />);

    const senderInput = screen.getByPlaceholderText("Meno odosielateľa alebo spoločnosti");
    const amountInput = screen.getByPlaceholderText("0,00");
    const submitBtn = screen.getByRole("button", { name: /pridať príjem na účet/i });

    await user.type(senderInput, "Firma ABC");
    await user.type(amountInput, "125,50");
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockAddTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "in",
          counterparty: "Firma ABC",
          amount: 125.5,
          category: "Ostatné príjmy",
        }),
      );
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/platby" });
    });
  });

  it("zobrazí chybovú správu pri zlyhaní zápisu do databázy", async () => {
    const user = userEvent.setup();
    mockAddTransaction.mockRejectedValueOnce(new Error("Chyba siete"));

    render(<Prijat />);

    const senderInput = screen.getByPlaceholderText("Meno odosielateľa alebo spoločnosti");
    const amountInput = screen.getByPlaceholderText("0,00");
    const submitBtn = screen.getByRole("button", { name: /pridať príjem na účet/i });

    await user.type(senderInput, "Firma ABC");
    await user.type(amountInput, "50");
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Nepodarilo sa uložiť príjem.")).toBeDefined();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});

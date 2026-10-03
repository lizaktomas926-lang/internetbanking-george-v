import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// --- Mocky závislostí -------------------------------------------------------

const navigateMock = vi.fn();

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...actual,
    createFileRoute: () => (opts: unknown) => opts,
    useNavigate: () => navigateMock,
  };
});

const addTransactionMock = vi.fn();
const useBankMock = vi.fn();

vi.mock("@/lib/bank-store", () => ({
  addTransaction: (...args: unknown[]) => addTransactionMock(...args),
  useBank: () => useBankMock(),
  CATEGORIES: ["Ostatné príjmy", "Mzda", "Prevod"],
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/components/bank/AppShell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BrandHeader: ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <header>
      <h1>{title}</h1>
      {subtitle ? <p>{subtitle}</p> : null}
    </header>
  ),
}));

// Import až po mockoch
import Prijat from "@/routes/_authenticated/prijat";

// --- Testy ------------------------------------------------------------------

const bankState = {
  iban: "SK0987654321098765432100",
  owner: "Jakub Varga",
  transactions: [],
  goals: [],
  budgets: [],
  loading: false,
  error: null,
};

describe("Obrazovka Prijať peniaze", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    useBankMock.mockReturnValue(bankState);
    addTransactionMock.mockResolvedValue(undefined);
  });

  it("zobrazí nadpis a IBAN používateľa", () => {
    render(<Prijat />);
    expect(screen.getByText("Prijať peniaze")).toBeInTheDocument();
    expect(screen.getByText("SK0987654321098765432100")).toBeInTheDocument();
  });

  it("zobrazí chybu, keď chýba odosielateľ", async () => {
    const user = userEvent.setup();
    render(<Prijat />);

    await user.type(screen.getByPlaceholderText("0,00"), "25");
    await user.click(screen.getByRole("button", { name: /Pridať príjem na účet/i }));

    expect(await screen.findByText("Zadajte odosielateľa.")).toBeInTheDocument();
    expect(addTransactionMock).not.toHaveBeenCalled();
  });

  it("zobrazí chybu pri neplatnej sume", async () => {
    const user = userEvent.setup();
    render(<Prijat />);

    await user.type(
      screen.getByPlaceholderText("Meno odosielateľa alebo spoločnosti"),
      "František Horváth",
    );
    await user.type(screen.getByPlaceholderText("0,00"), "-5");
    await user.click(screen.getByRole("button", { name: /Pridať príjem na účet/i }));

    expect(await screen.findByText("Zadajte platnú sumu.")).toBeInTheDocument();
    expect(addTransactionMock).not.toHaveBeenCalled();
  });

  it("uloží príjem a presmeruje na /platby", async () => {
    const user = userEvent.setup();
    render(<Prijat />);

    await user.type(
      screen.getByPlaceholderText("Meno odosielateľa alebo spoločnosti"),
      "František Horváth",
    );
    await user.type(screen.getByPlaceholderText("0,00"), "25,50");
    await user.click(screen.getByRole("button", { name: /Pridať príjem na účet/i }));

    await waitFor(() => {
      expect(addTransactionMock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "in",
          counterparty: "František Horváth",
          amount: 25.5,
          category: "Ostatné príjmy",
        }),
      );
    });
    expect(navigateMock).toHaveBeenCalledWith({ to: "/platby" });
  });

  it("zobrazí chybu, keď uloženie zlyhá", async () => {
    addTransactionMock.mockRejectedValue(new Error("db error"));
    const user = userEvent.setup();
    render(<Prijat />);

    await user.type(
      screen.getByPlaceholderText("Meno odosielateľa alebo spoločnosti"),
      "František Horváth",
    );
    await user.type(screen.getByPlaceholderText("0,00"), "10");
    await user.click(screen.getByRole("button", { name: /Pridať príjem na účet/i }));

    expect(await screen.findByText("Nepodarilo sa uložiť príjem.")).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});

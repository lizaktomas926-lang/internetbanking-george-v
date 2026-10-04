import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Txn {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  accountNumber?: string;
  variableSymbol?: string;
  note?: string;
}

export interface BankAccount {
  accountNumber: string;
  iban: string;
  balance: number;
  currency: string;
}

interface BankStore {
  account: BankAccount;
  transactions: Txn[];
  addTransaction: (txn: Omit<Txn, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  resetToDefaults: () => void;
}

const DEFAULT_ACCOUNT: BankAccount = {
  accountNumber: '2938471029',
  iban: 'SK89 0900 0000 0029 3847 1029',
  balance: 2450.80,
  currency: 'EUR',
};

// Počiatočné vzorové transakcie
const INITIAL_TRANSACTIONS: Omit<Txn, "id">[] = [
  {
    title: "Výplata",
    amount: 1500.00,
    type: "income",
    category: "Mzda",
    date: new Date().toISOString(),
    note: "Mesačná výplata",
  },
  {
    title: "Nákup potravín",
    amount: 45.30,
    type: "expense",
    category: "Potraviny",
    date: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    title: "Prevod z účtu",
    amount: 200.00,
    type: "income",
    category: "Ostatné príjmy",
    date: new Date(Date.now() - 172800000).toISOString(),
  },
];

export const useBankStore = create<BankStore>()(
  persist(
    (set) => ({
      account: DEFAULT_ACCOUNT,
      transactions: INITIAL_TRANSACTIONS.map((txn, index) => ({
        ...txn,
        id: `init-${index + 1}`,
      })),

      addTransaction: (newTxnData) =>
        set((state) => {
          const newTxn: Txn = {
            ...newTxnData,
            id: `txn-${Date.now()}`,
          };

          const newBalance =
            newTxn.type === 'income'
              ? state.account.balance + newTxn.amount
              : state.account.balance - newTxn.amount;

          return {
            account: {
              ...state.account,
              balance: Number(newBalance.toFixed(2)),
            },
            transactions: [newTxn, ...state.transactions],
          };
        }),

      deleteTransaction: (id) =>
        set((state) => {
          const txnToDelete = state.transactions.find((t) => t.id === id);
          if (!txnToDelete) return state;

          const newBalance =
            txnToDelete.type === 'income'
              ? state.account.balance - txnToDelete.amount
              : state.account.balance + txnToDelete.amount;

          return {
            account: {
              ...state.account,
              balance: Number(newBalance.toFixed(2)),
            },
            transactions: state.transactions.filter((t) => t.id !== id),
          };
        }),

      resetToDefaults: () =>
        set({
          account: DEFAULT_ACCOUNT,
          transactions: INITIAL_TRANSACTIONS.map((txn, index) => ({
            ...txn,
            id: `init-${index + 1}`,
          })),
        }),
    }),
    {
      name: 'george-bank-store',
    }
  )
);

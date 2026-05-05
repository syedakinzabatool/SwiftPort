import { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "@/hooks/use-toast";

export type TransactionType = "send" | "receive" | "transfer" | "payment";
export type TransactionStatus = "completed" | "pending" | "failed";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  recipient?: string;
  sender?: string;
  status: TransactionStatus;
  date: string;
  note?: string;
  reference: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  isPrimary: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  balance: number;
}

interface AppContextType {
  user: User | null;
  transactions: Transaction[];
  bankAccounts: BankAccount[];
  login: () => void;
  logout: () => void;
  sendMoney: (amount: number, recipient: string, note?: string) => Promise<void>;
  transferToBank: (amount: number, bankId: string) => Promise<void>;
  addTransaction: (tx: Omit<Transaction, "id" | "date" | "reference">) => void;
}

const initialTransactions: Transaction[] = [
  {
    id: "tx-1001",
    type: "receive",
    amount: 150.0,
    sender: "Alex Carter",
    status: "completed",
    date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    note: "Coffee supplies",
    reference: "REF-892374"
  },
  {
    id: "tx-1002",
    type: "payment",
    amount: -45.5,
    recipient: "Store Rent",
    status: "completed",
    date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    reference: "REF-238475"
  },
  {
    id: "tx-1003",
    type: "transfer",
    amount: -500.0,
    recipient: "Chase Bank ending in 4421",
    status: "pending",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    reference: "REF-983475"
  },
  {
    id: "tx-1004",
    type: "send",
    amount: -25.0,
    recipient: "Sarah Jenkins",
    status: "completed",
    date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    note: "Split lunch",
    reference: "REF-435623"
  },
  {
    id: "tx-1005",
    type: "receive",
    amount: 320.0,
    sender: "Food Festival Booth",
    status: "completed",
    date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    reference: "REF-736452"
  },
  {
    id: "tx-1006",
    type: "send",
    amount: -80.0,
    recipient: "Supplier Inc",
    status: "failed",
    date: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    reference: "REF-112233"
  },
  {
    id: "tx-1007",
    type: "receive",
    amount: 12.5,
    sender: "Customer Walk-in",
    status: "completed",
    date: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    reference: "REF-998877"
  },
];

const initialBankAccounts: BankAccount[] = [
  {
    id: "bank-1",
    bankName: "Chase Bank",
    accountNumber: "****4421",
    accountHolder: "Demo Merchant",
    isPrimary: true,
  },
  {
    id: "bank-2",
    bankName: "Wells Fargo",
    accountNumber: "****8832",
    accountHolder: "Demo Merchant",
    isPrimary: false,
  }
];

const demoUser: User = {
  id: "usr-1",
  name: "Demo Merchant",
  email: "demo@swiftport.com",
  phone: "+1 (555) 123-4567",
  avatar: "DM",
  balance: 1284.50,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [bankAccounts] = useState<BankAccount[]>(initialBankAccounts);

  const login = () => {
    setUser(demoUser);
  };

  const logout = () => {
    setUser(null);
  };

  const addTransaction = (tx: Omit<Transaction, "id" | "date" | "reference">) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Math.floor(Math.random() * 10000)}`,
      date: new Date().toISOString(),
      reference: `REF-${Math.floor(Math.random() * 1000000)}`,
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const sendMoney = async (amount: number, recipient: string, note?: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (!user) return reject(new Error("Not authenticated"));
        if (amount > user.balance) {
          toast({ title: "Insufficient funds", description: "You do not have enough balance for this transaction.", variant: "destructive" });
          return reject(new Error("Insufficient funds"));
        }
        
        setUser({ ...user, balance: user.balance - amount });
        addTransaction({
          type: "send",
          amount: -amount,
          recipient,
          status: "completed",
          note
        });
        toast({ title: "Money sent successfully", description: `$${amount.toFixed(2)} sent to ${recipient}` });
        resolve();
      }, 1500);
    });
  };

  const transferToBank = async (amount: number, bankId: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (!user) return reject(new Error("Not authenticated"));
        if (amount > user.balance) {
          toast({ title: "Insufficient funds", variant: "destructive" });
          return reject(new Error("Insufficient funds"));
        }
        
        const bank = bankAccounts.find(b => b.id === bankId);
        
        setUser({ ...user, balance: user.balance - amount });
        addTransaction({
          type: "transfer",
          amount: -amount,
          recipient: `${bank?.bankName} ending in ${bank?.accountNumber.slice(-4)}`,
          status: "pending",
        });
        toast({ title: "Transfer initiated", description: `$${amount.toFixed(2)} will arrive in 1-2 business days.` });
        resolve();
      }, 1500);
    });
  };

  return (
    <AppContext.Provider value={{ user, transactions, bankAccounts, login, logout, sendMoney, transferToBank, addTransaction }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
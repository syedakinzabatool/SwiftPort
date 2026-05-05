import { useState } from "react";
import { useApp, TransactionType, TransactionStatus } from "@/lib/app-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Filter, ArrowDownToLine, ArrowRight, Landmark, CreditCard, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function History() {
  const { transactions } = useApp();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<TransactionType | "all">("all");

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = (tx.recipient || tx.sender || tx.note || tx.reference || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || tx.type === filterType;
    return matchesSearch && matchesType;
  });

  const getIcon = (type: TransactionType, amount: number) => {
    switch (type) {
      case "transfer": return <Landmark size={20} />;
      case "payment": return <CreditCard size={20} />;
      case "receive": return <ArrowDownToLine size={20} />;
      case "send": return <ArrowRight size={20} />;
      default: return amount > 0 ? <ArrowDownToLine size={20} /> : <ArrowRight size={20} />;
    }
  };

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case "completed": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "pending": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "failed": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "";
    }
  };

  return (
    <div className="p-4 md:p-8 h-full flex flex-col">
      <header className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-xl font-bold">Transaction History</h1>
      </header>

      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input 
            placeholder="Search by name, reference, or note..." 
            className="pl-10 bg-card h-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {(["all", "receive", "send", "transfer", "payment"] as const).map((type) => (
            <Button 
              key={type} 
              variant={filterType === type ? "default" : "outline"} 
              size="sm"
              className="capitalize whitespace-nowrap rounded-full"
              onClick={() => setFilterType(type)}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        <div className="space-y-3">
          {filteredTransactions.map((tx, index) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <Card className="border-border hover:border-primary/50 transition-colors cursor-pointer group">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      tx.amount > 0 ? 'bg-green-500/10 text-green-500' : 'bg-muted text-foreground'
                    }`}>
                      {getIcon(tx.type, tx.amount)}
                    </div>
                    <div>
                      <p className="font-bold text-base">{tx.recipient || tx.sender}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">{format(new Date(tx.date), 'MMM d, h:mm a')}</p>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                        <Badge variant="outline" className={`text-[10px] px-1.5 h-4 font-semibold ${getStatusColor(tx.status)}`}>
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`font-bold text-lg ${tx.amount > 0 ? 'text-green-500' : 'text-foreground'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} />
              </div>
              <p>No transactions found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
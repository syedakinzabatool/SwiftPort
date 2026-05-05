import { useState } from "react";
import { useApp } from "@/lib/app-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { Loader2, ArrowLeft, Landmark, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Transfer() {
  const { user, bankAccounts, transferToBank } = useApp();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"form" | "confirm" | "success">("form");
  const [isLoading, setIsLoading] = useState(false);

  const [bankId, setBankId] = useState(bankAccounts.find(b => b.isPrimary)?.id || bankAccounts[0]?.id || "");
  const [amount, setAmount] = useState("");

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankId || !amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    setStep("confirm");
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await transferToBank(Number(amount), bankId);
      setStep("success");
    } catch (error) {
      // handled
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  const selectedBank = bankAccounts.find(b => b.id === bankId);

  return (
    <div className="p-4 md:p-8 max-w-md mx-auto h-full flex flex-col relative">
      <header className="flex items-center gap-4 mb-8">
        {step !== "success" && (
          <Button variant="ghost" size="icon" onClick={() => step === "confirm" ? setStep("form") : setLocation("/dashboard")}>
            <ArrowLeft size={20} />
          </Button>
        )}
        <h1 className="text-xl font-bold">Transfer to Bank</h1>
      </header>

      <div className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={handleNext} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="bank">Select Bank Account</Label>
                  <Select value={bankId} onValueChange={setBankId} required>
                    <SelectTrigger className="h-14 bg-card text-base">
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts.map((bank) => (
                        <SelectItem key={bank.id} value={bank.id} className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                              <Landmark size={16} className="text-muted-foreground" />
                            </div>
                            <div className="text-left">
                              <p className="font-bold">{bank.bankName}</p>
                              <p className="text-xs text-muted-foreground">{bank.accountNumber}</p>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Transfer Amount</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">$</span>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={user.balance}
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      className="h-16 pl-10 text-3xl font-bold bg-card"
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-muted-foreground">Available: ${user.balance.toFixed(2)}</p>
                    <button type="button" className="text-xs text-primary font-bold" onClick={() => setAmount(user.balance.toString())}>
                      Transfer All
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-14 text-lg font-bold mt-8" disabled={!amount || !bankId}>
                  Review Transfer
                </Button>
              </form>
            </motion.div>
          )}

          {step === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-border shadow-xl">
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground mb-2">Transferring</p>
                  <div className="text-5xl font-bold mb-6">${Number(amount).toFixed(2)}</div>
                  
                  <div className="bg-muted/50 rounded-xl p-4 mb-6 text-left">
                    <p className="text-sm text-muted-foreground mb-1">To</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-background border flex items-center justify-center">
                        <Landmark size={20} className="text-foreground" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">{selectedBank?.bankName}</p>
                        <p className="text-sm text-muted-foreground">{selectedBank?.accountNumber}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-4 border-t border-border mb-6">
                    <span className="text-muted-foreground font-medium">Estimated Arrival</span>
                    <span className="font-bold">1-2 Business Days</span>
                  </div>

                  <Button 
                    className="w-full h-14 text-lg font-bold" 
                    onClick={handleConfirm}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="animate-spin" /> : "Confirm Transfer"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="text-primary w-12 h-12" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Transfer Initiated!</h2>
              <p className="text-muted-foreground mb-8">
                ${Number(amount).toFixed(2)} is on its way to {selectedBank?.bankName}.
              </p>
              
              <Button className="w-full h-14 text-lg font-bold" onClick={() => setLocation("/dashboard")}>
                Done
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
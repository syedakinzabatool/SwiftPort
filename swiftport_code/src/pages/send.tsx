import { useState } from "react";
import { useApp } from "@/lib/app-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Send() {
  const { user, sendMoney } = useApp();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"form" | "confirm" | "success">("form");
  const [isLoading, setIsLoading] = useState(false);

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    setStep("confirm");
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await sendMoney(Number(amount), recipient, note);
      setStep("success");
    } catch (error) {
      // Toast handles error
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="p-4 md:p-8 max-w-md mx-auto h-full flex flex-col relative">
      <header className="flex items-center gap-4 mb-8">
        {step !== "success" && (
          <Button variant="ghost" size="icon" onClick={() => step === "confirm" ? setStep("form") : setLocation("/dashboard")}>
            <ArrowLeft size={20} />
          </Button>
        )}
        <h1 className="text-xl font-bold">Send Money</h1>
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
                  <Label htmlFor="recipient">Send to (Phone, Email, or Tag)</Label>
                  <Input
                    id="recipient"
                    placeholder="e.g. sarah@example.com"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    required
                    className="h-12 bg-card"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
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
                  <p className="text-xs text-muted-foreground text-right mt-1">Available: ${user.balance.toFixed(2)}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">What's it for? (Optional)</Label>
                  <Input
                    id="note"
                    placeholder="Lunch, supplies, etc."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="bg-card"
                  />
                </div>

                <Button type="submit" className="w-full h-14 text-lg font-bold mt-8" disabled={!recipient || !amount}>
                  Continue
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
                  <p className="text-muted-foreground mb-2">You are sending</p>
                  <div className="text-5xl font-bold mb-6">${Number(amount).toFixed(2)}</div>
                  
                  <div className="bg-muted/50 rounded-xl p-4 mb-6 text-left">
                    <p className="text-sm text-muted-foreground mb-1">To</p>
                    <p className="font-bold text-lg mb-4">{recipient}</p>
                    
                    {note && (
                      <>
                        <p className="text-sm text-muted-foreground mb-1">For</p>
                        <p className="font-medium">{note}</p>
                      </>
                    )}
                  </div>

                  <Button 
                    className="w-full h-14 text-lg font-bold" 
                    onClick={handleConfirm}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="animate-spin" /> : "Confirm Send"}
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
              <h2 className="text-3xl font-bold mb-2">Payment Sent!</h2>
              <p className="text-muted-foreground mb-8">
                ${Number(amount).toFixed(2)} has been sent to {recipient}.
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
import { useState } from "react";
import { useApp } from "@/lib/app-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useLocation } from "wouter";
import { ArrowLeft, Zap, Wifi, Phone, Tv, Droplets, Flame, CheckCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";

const billSchema = z.object({
  accountNumber: z.string().min(6, "Account number must be at least 6 characters"),
  amount: z.coerce.number().min(1, "Amount must be at least $1").max(10000, "Amount too large"),
});
type BillFormData = z.infer<typeof billSchema>;

const billCategories = [
  { id: "electricity", label: "Electricity", icon: Zap, color: "bg-yellow-500/10 text-yellow-500", provider: "City Power Co." },
  { id: "internet", label: "Internet", icon: Wifi, color: "bg-blue-500/10 text-blue-500", provider: "FastNet ISP" },
  { id: "mobile", label: "Mobile", icon: Phone, color: "bg-green-500/10 text-green-500", provider: "TelecomPlus" },
  { id: "cable", label: "Cable TV", icon: Tv, color: "bg-purple-500/10 text-purple-500", provider: "StreamCable" },
  { id: "water", label: "Water", icon: Droplets, color: "bg-cyan-500/10 text-cyan-500", provider: "City Water Dept." },
  { id: "gas", label: "Gas", icon: Flame, color: "bg-orange-500/10 text-orange-500", provider: "NatGas Utility" },
];

type Step = "select" | "pay" | "confirm" | "success";

export default function PayBills() {
  const { user, addTransaction, } = useApp();
  const [, setLocation] = useLocation();
  const [selectedBill, setSelectedBill] = useState<typeof billCategories[0] | null>(null);
  const [step, setStep] = useState<Step>("select");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingData, setPendingData] = useState<BillFormData | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<BillFormData>({
    resolver: zodResolver(billSchema),
    defaultValues: { accountNumber: "", amount: undefined },
  });

  const handleSelectBill = (cat: typeof billCategories[0]) => {
    setSelectedBill(cat);
    setStep("pay");
    reset();
  };

  const onSubmit = (data: BillFormData) => {
    if (!user || data.amount > user.balance) {
      toast({ title: "Insufficient funds", description: "You don't have enough balance for this payment.", variant: "destructive" });
      return;
    }
    setPendingData(data);
    setShowConfirm(true);
  };

  const confirmPayment = async () => {
    if (!pendingData || !selectedBill || !user) return;
    setShowConfirm(false);
    setIsLoading(true);

    await new Promise(r => setTimeout(r, 1500));

    addTransaction({
      type: "payment",
      amount: -pendingData.amount,
      recipient: selectedBill.provider,
      status: "completed",
      note: `${selectedBill.label} bill — Account ${pendingData.accountNumber}`,
    });

    setIsLoading(false);
    setStep("success");
  };

  const handleBack = () => {
    if (step === "pay") { setStep("select"); setSelectedBill(null); }
    else if (step === "select") setLocation("/dashboard");
  };

  return (
    <div className="p-4 md:p-8 h-full flex flex-col">
      <header className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={handleBack} disabled={isLoading}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-xl font-bold">Pay Bills</h1>
      </header>

      <AnimatePresence mode="wait">
        {step === "select" && (
          <motion.div key="select" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <p className="text-muted-foreground mb-6">Choose a bill category to continue</p>
            <div className="grid grid-cols-2 gap-4">
              {billCategories.map((cat) => (
                <Card
                  key={cat.id}
                  className="border-border cursor-pointer hover:border-primary transition-colors hover:shadow-md"
                  onClick={() => handleSelectBill(cat)}
                >
                  <CardContent className="p-5 flex flex-col items-center gap-3">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${cat.color}`}>
                      <cat.icon size={26} />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{cat.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{cat.provider}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {step === "pay" && selectedBill && (
          <motion.div key="pay" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card className="border-border mb-6">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedBill.color}`}>
                  <selectedBill.icon size={22} />
                </div>
                <div>
                  <p className="font-bold text-lg">{selectedBill.label}</p>
                  <p className="text-sm text-muted-foreground">{selectedBill.provider}</p>
                </div>
              </CardContent>
            </Card>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <Label htmlFor="accountNumber" className="text-sm font-medium mb-2 block">
                  Account / Reference Number
                </Label>
                <Input
                  id="accountNumber"
                  placeholder="e.g. 123456789"
                  {...register("accountNumber")}
                  className={errors.accountNumber ? "border-destructive" : ""}
                  data-testid="input-account-number"
                />
                {errors.accountNumber && <p className="text-destructive text-xs mt-1">{errors.accountNumber.message}</p>}
              </div>

              <div>
                <Label htmlFor="amount" className="text-sm font-medium mb-2 block">
                  Amount to Pay
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("amount")}
                    className={`pl-7 ${errors.amount ? "border-destructive" : ""}`}
                    data-testid="input-bill-amount"
                  />
                </div>
                {errors.amount && <p className="text-destructive text-xs mt-1">{errors.amount.message}</p>}
                <p className="text-xs text-muted-foreground mt-1">Available: ${user?.balance.toFixed(2)}</p>
              </div>

              <Button
                type="submit"
                className="w-full h-14 font-bold text-base mt-4"
                disabled={isLoading}
                data-testid="button-pay-bill"
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Review Payment"}
              </Button>
            </form>
          </motion.div>
        )}

        {step === "success" && selectedBill && pendingData && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-12 gap-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center"
            >
              <CheckCircle size={48} className="text-green-500" />
            </motion.div>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Bill Paid!</h2>
              <p className="text-muted-foreground">
                ${pendingData.amount.toFixed(2)} paid to <span className="font-medium text-foreground">{selectedBill.provider}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">Account: {pendingData.accountNumber}</p>
            </div>
            <div className="flex gap-3 w-full mt-4">
              <Button variant="outline" className="flex-1" onClick={() => { setStep("select"); setSelectedBill(null); }}>
                Pay Another
              </Button>
              <Button className="flex-1" onClick={() => setLocation("/dashboard")}>
                Back to Home
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
          </DialogHeader>
          {selectedBill && pendingData && (
            <div className="space-y-4 py-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Provider</span>
                <span className="font-medium">{selectedBill.provider}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Account Number</span>
                <span className="font-medium">{pendingData.accountNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{selectedBill.label}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-4">
                <span>Total</span>
                <span className="text-primary">${pendingData.amount.toFixed(2)}</span>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirm(false)} data-testid="button-cancel-bill">Cancel</Button>
            <Button onClick={confirmPayment} data-testid="button-confirm-bill">Confirm Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

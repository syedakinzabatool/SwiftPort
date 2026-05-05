import { useState } from "react";
import { useApp } from "@/lib/app-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { ArrowLeft, Copy, Share2, Download, QrCode as QrCodeIcon, Link as LinkIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Receive() {
  const { user } = useApp();
  const [, setLocation] = useLocation();
  const [amount, setAmount] = useState("");

  if (!user) return null;

  const paymentLink = `https://swiftport.com/pay/${user.id.substring(0, 8)}${amount ? `?amount=${amount}` : ""}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(paymentLink);
    toast({ title: "Link copied", description: "Payment link copied to clipboard." });
  };

  const SimpleQR = () => {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full max-w-[200px] mx-auto rounded-md shadow-sm">
        <rect width="100" height="100" fill="white" />
        <path d="M10,10 h25 v25 h-25 z M15,15 h15 v15 h-15 z" fill="black" />
        <path d="M65,10 h25 v25 h-25 z M70,15 h15 v15 h-15 z" fill="black" />
        <path d="M10,65 h25 v25 h-25 z M15,70 h15 v15 h-15 z" fill="black" />
        <rect x="45" y="45" width="10" height="10" fill="black" />
        <rect x="65" y="65" width="25" height="10" fill="black" />
        <rect x="80" y="80" width="10" height="10" fill="black" />
        <rect x="45" y="10" width="10" height="25" fill="black" />
        <rect x="10" y="45" width="25" height="10" fill="black" />
        <rect x="45" y="80" width="10" height="10" fill="black" />
        <rect x="65" y="45" width="10" height="10" fill="black" />
        {amount && (
          <text x="50" y="60" fontSize="12" textAnchor="middle" fill="black" fontWeight="bold">
            ${amount}
          </text>
        )}
      </svg>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-md mx-auto h-full flex flex-col relative">
      <header className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-xl font-bold">Receive Money</h1>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1"
      >
        <div className="space-y-4 mb-8">
          <Label htmlFor="amount">Amount to Request (Optional)</Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground">$</span>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-14 pl-10 text-2xl font-bold bg-card"
            />
          </div>
        </div>

        <Tabs defaultValue="qr" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12 mb-6">
            <TabsTrigger value="qr" className="h-full gap-2">
              <QrCodeIcon size={18} /> QR Code
            </TabsTrigger>
            <TabsTrigger value="link" className="h-full gap-2">
              <LinkIcon size={18} /> Payment Link
            </TabsTrigger>
          </TabsList>

          <TabsContent value="qr" className="mt-0">
            <Card className="border-border shadow-xl">
              <CardContent className="p-8 text-center flex flex-col items-center">
                <div className="bg-white p-4 rounded-xl mb-6 w-full max-w-[240px] shadow-sm">
                  <SimpleQR />
                </div>
                
                <p className="text-sm text-muted-foreground mb-6">
                  Scan this code to pay {user.name}
                  {amount && <span className="block text-foreground font-bold mt-1 text-lg">${Number(amount).toFixed(2)}</span>}
                </p>

                <div className="flex gap-4 w-full">
                  <Button variant="outline" className="flex-1 gap-2 h-12 font-medium">
                    <Download size={18} /> Save
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2 h-12 font-medium">
                    <Share2 size={18} /> Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="link" className="mt-0">
            <Card className="border-border shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-6">
                  <LinkIcon size={32} />
                </div>
                
                <p className="text-sm text-muted-foreground mb-6">
                  Share this link with your customer to receive payment instantly.
                  {amount && <span className="block text-foreground font-bold mt-1 text-lg">${Number(amount).toFixed(2)}</span>}
                </p>

                <div className="bg-muted rounded-lg p-4 mb-6 break-all text-sm font-medium border border-border">
                  {paymentLink}
                </div>

                <div className="flex gap-4 w-full">
                  <Button variant="default" className="flex-1 gap-2 h-12 font-bold" onClick={copyToClipboard}>
                    <Copy size={18} /> Copy
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2 h-12 font-medium">
                    <Share2 size={18} /> Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
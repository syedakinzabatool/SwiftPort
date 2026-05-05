import { useState } from "react";
import { useApp } from "@/lib/app-context";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";
import {
  ArrowLeft, User as UserIcon, Settings, Bell, Shield, LogOut,
  Moon, Sun, Landmark, ChevronRight, Lock, Fingerprint,
  Smartphone, Eye, EyeOff, CheckCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

type DialogType = "notifications" | "security" | "account" | null;

interface NotifPrefs {
  transactions: boolean;
  marketing: boolean;
  security: boolean;
  paymentLinks: boolean;
}

interface SecurityData {
  currentPin: string;
  newPin: string;
  confirmPin: string;
}

export default function Profile() {
  const { user, bankAccounts, logout } = useApp();
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const [openDialog, setOpenDialog] = useState<DialogType>(null);
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [biometrics, setBiometrics] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [pinSaved, setPinSaved] = useState(false);
  const [accountName, setAccountName] = useState(user?.name ?? "");
  const [accountEmail, setAccountEmail] = useState(user?.email ?? "");
  const [accountPhone, setAccountPhone] = useState(user?.phone ?? "");

  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>({
    transactions: true,
    marketing: false,
    security: true,
    paymentLinks: true,
  });

  const [securityData, setSecurityData] = useState<SecurityData>({
    currentPin: "",
    newPin: "",
    confirmPin: "",
  });

  if (!user) return null;

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const saveNotifications = () => {
    setOpenDialog(null);
    toast({ title: "Notification preferences saved", description: "Your preferences have been updated." });
  };

  const saveSecurity = () => {
    if (securityData.newPin && securityData.newPin !== securityData.confirmPin) {
      toast({ title: "PINs don't match", description: "Please make sure your new PINs match.", variant: "destructive" });
      return;
    }
    if (securityData.newPin && securityData.newPin.length < 4) {
      toast({ title: "PIN too short", description: "PIN must be at least 4 digits.", variant: "destructive" });
      return;
    }
    setPinSaved(true);
    setTimeout(() => {
      setPinSaved(false);
      setOpenDialog(null);
      setSecurityData({ currentPin: "", newPin: "", confirmPin: "" });
      toast({ title: "Security settings saved", description: "Your security preferences have been updated." });
    }, 1200);
  };

  const saveAccount = () => {
    if (!accountName.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    setOpenDialog(null);
    toast({ title: "Account updated", description: "Your account information has been saved." });
  };

  const settingsRows = [
    {
      icon: Bell,
      label: "Notifications",
      desc: "Manage alerts and push notifications",
      dialog: "notifications" as DialogType,
    },
    {
      icon: Shield,
      label: "Security",
      desc: "PIN, biometrics, and two-factor auth",
      dialog: "security" as DialogType,
    },
    {
      icon: Settings,
      label: "Account Settings",
      desc: "Update your personal information",
      dialog: "account" as DialogType,
    },
  ];

  return (
    <div className="p-4 md:p-8 h-full flex flex-col">
      <header className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-xl font-bold">Profile</h1>
      </header>

      <div className="space-y-6 pb-24">
        {/* User Card */}
        <Card className="border-none bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold backdrop-blur-sm">
              {user.avatar}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-primary-foreground/80">{user.email}</p>
              <p className="text-primary-foreground/80 text-sm mt-1">{user.phone}</p>
            </div>
          </CardContent>
        </Card>

        {/* Linked Accounts */}
        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">Linked Accounts</h3>
          <Card className="border-border overflow-hidden">
            <div className="divide-y divide-border">
              {bankAccounts.map((bank) => (
                <div key={bank.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Landmark size={20} className="text-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold">{bank.bankName}</p>
                      <p className="text-sm text-muted-foreground">{bank.accountNumber}</p>
                    </div>
                  </div>
                  {bank.isPrimary && (
                    <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-full">Primary</span>
                  )}
                </div>
              ))}
              <div className="p-4">
                <Button
                  variant="outline"
                  className="w-full font-semibold"
                  onClick={() => toast({ title: "Coming soon", description: "Bank account linking will be available soon." })}
                  data-testid="button-add-bank"
                >
                  Add Bank Account
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Preferences */}
        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">Preferences</h3>
          <Card className="border-border overflow-hidden">
            <div className="divide-y divide-border">
              {/* Dark Mode Toggle */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === "dark" ? <Moon size={20} className="text-foreground" /> : <Sun size={20} className="text-foreground" />}
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-xs text-muted-foreground">{theme === "dark" ? "Currently dark" : "Currently light"}</p>
                  </div>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                  data-testid="switch-dark-mode"
                />
              </div>

              {/* Settings Rows */}
              {settingsRows.map((row) => (
                <button
                  key={row.label}
                  className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
                  onClick={() => setOpenDialog(row.dialog)}
                  data-testid={`button-${row.label.toLowerCase().replace(" ", "-")}`}
                >
                  <div className="flex items-center gap-3">
                    <row.icon size={20} className="text-muted-foreground" />
                    <div>
                      <p className="font-medium">{row.label}</p>
                      <p className="text-xs text-muted-foreground">{row.desc}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>
              ))}
            </div>
          </Card>
        </div>

        <Button
          variant="destructive"
          className="w-full h-14 font-bold text-base gap-2"
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut size={20} /> Log Out
        </Button>
      </div>

      {/* Notifications Dialog */}
      <Dialog open={openDialog === "notifications"} onOpenChange={(o) => !o && setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell size={20} className="text-primary" /> Notification Preferences
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            {(
              [
                { key: "transactions", label: "Transaction Alerts", desc: "Get notified for every payment sent or received" },
                { key: "security", label: "Security Alerts", desc: "Login attempts and suspicious activity" },
                { key: "paymentLinks", label: "Payment Links", desc: "When someone pays via your payment link" },
                { key: "marketing", label: "Promotions & News", desc: "SwiftPort updates, offers, and announcements" },
              ] as { key: keyof NotifPrefs; label: string; desc: string }[]
            ).map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-sm">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <Switch
                  checked={notifPrefs[key]}
                  onCheckedChange={(val) => setNotifPrefs(prev => ({ ...prev, [key]: val }))}
                  data-testid={`switch-notif-${key}`}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)}>Cancel</Button>
            <Button onClick={saveNotifications} data-testid="button-save-notifications">Save Preferences</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Security Dialog */}
      <Dialog open={openDialog === "security"} onOpenChange={(o) => !o && setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield size={20} className="text-primary" /> Security Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            {/* Biometrics */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Fingerprint size={20} className="text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">Biometric Login</p>
                  <p className="text-xs text-muted-foreground">Face ID / Fingerprint</p>
                </div>
              </div>
              <Switch checked={biometrics} onCheckedChange={setBiometrics} data-testid="switch-biometrics" />
            </div>

            {/* Two-Factor */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone size={20} className="text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">Two-Factor Auth</p>
                  <p className="text-xs text-muted-foreground">SMS code on login</p>
                </div>
              </div>
              <Switch checked={twoFactor} onCheckedChange={setTwoFactor} data-testid="switch-2fa" />
            </div>

            <Separator />

            {/* Change PIN */}
            <div>
              <p className="font-semibold text-sm flex items-center gap-2 mb-3">
                <Lock size={16} /> Change Transaction PIN
              </p>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Current PIN</Label>
                  <div className="relative">
                    <Input
                      type={showCurrentPin ? "text" : "password"}
                      maxLength={6}
                      placeholder="••••"
                      value={securityData.currentPin}
                      onChange={(e) => setSecurityData(p => ({ ...p, currentPin: e.target.value }))}
                      data-testid="input-current-pin"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowCurrentPin(v => !v)}
                    >
                      {showCurrentPin ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">New PIN</Label>
                  <div className="relative">
                    <Input
                      type={showNewPin ? "text" : "password"}
                      maxLength={6}
                      placeholder="••••"
                      value={securityData.newPin}
                      onChange={(e) => setSecurityData(p => ({ ...p, newPin: e.target.value }))}
                      data-testid="input-new-pin"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowNewPin(v => !v)}
                    >
                      {showNewPin ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Confirm New PIN</Label>
                  <Input
                    type="password"
                    maxLength={6}
                    placeholder="••••"
                    value={securityData.confirmPin}
                    onChange={(e) => setSecurityData(p => ({ ...p, confirmPin: e.target.value }))}
                    data-testid="input-confirm-pin"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)}>Cancel</Button>
            <Button onClick={saveSecurity} data-testid="button-save-security">
              {pinSaved ? (
                <span className="flex items-center gap-2"><CheckCircle size={16} /> Saved!</span>
              ) : "Save Settings"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Account Settings Dialog */}
      <Dialog open={openDialog === "account"} onOpenChange={(o) => !o && setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserIcon size={20} className="text-primary" /> Account Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Full Name</Label>
              <Input
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Your name"
                data-testid="input-account-name"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Email Address</Label>
              <Input
                type="email"
                value={accountEmail}
                onChange={(e) => setAccountEmail(e.target.value)}
                placeholder="you@example.com"
                data-testid="input-account-email"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Phone Number</Label>
              <Input
                type="tel"
                value={accountPhone}
                onChange={(e) => setAccountPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                data-testid="input-account-phone"
              />
            </div>
            <Separator />
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Merchant ID</Label>
              <Input value={user.id} disabled className="opacity-60" />
              <p className="text-xs text-muted-foreground mt-1">Your unique SwiftPort merchant identifier</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)}>Cancel</Button>
            <Button onClick={saveAccount} data-testid="button-save-account">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

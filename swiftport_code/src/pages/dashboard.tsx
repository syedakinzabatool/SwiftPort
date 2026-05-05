import { useApp } from "@/lib/app-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Send, ArrowDownToLine, Landmark, CreditCard, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const chartData = [
  { day: "Mon", earnings: 120 },
  { day: "Tue", earnings: 250 },
  { day: "Wed", earnings: 180 },
  { day: "Thu", earnings: 320 },
  { day: "Fri", earnings: 450 },
  { day: "Sat", earnings: 150 },
  { day: "Sun", earnings: 80 },
];

export default function Dashboard() {
  const { user, transactions } = useApp();

  if (!user) return null;

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <p className="text-sm text-muted-foreground font-medium">Welcome back</p>
          <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
          {user.avatar}
        </div>
      </header>

      {/* Balance Card */}
      <Card className="bg-primary text-primary-foreground border-none shadow-lg shadow-primary/20 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl"></div>
        
        <CardContent className="p-6 relative z-10">
          <p className="text-primary-foreground/80 font-medium mb-1">Available Balance</p>
          <div className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            ${user.balance.toFixed(2)}
          </div>
          
          <div className="flex gap-4">
            <Link href="/transfer" className="flex-1">
              <Button variant="secondary" className="w-full bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
                Withdraw
              </Button>
            </Link>
            <Link href="/receive" className="flex-1">
              <Button variant="secondary" className="w-full bg-white text-primary hover:bg-white/90 border-none">
                Add Funds
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: Send, label: "Send", href: "/send" },
          { icon: ArrowDownToLine, label: "Receive", href: "/receive" },
          { icon: Landmark, label: "Transfer", href: "/transfer" },
          { icon: CreditCard, label: "Pay Bills", href: "/pay-bills" },
        ].map((action, i) => (
          <Link key={i} href={action.href} className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-2xl bg-card border flex items-center justify-center text-foreground group-hover:border-primary group-hover:text-primary transition-colors shadow-sm">
              <action.icon size={24} />
            </div>
            <span className="text-xs font-medium">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Chart */}
      <div>
        <h2 className="text-lg font-bold mb-4">Weekly Earnings</h2>
        <Card className="border-border shadow-sm p-4">
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted)/0.5)' }} 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                  formatter={(value: number) => [`$${value}`, 'Earnings']}
                />
                <Bar dataKey="earnings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Recent Activity</h2>
          <Link href="/history" className="text-sm text-primary font-medium hover:underline">View all</Link>
        </div>
        
        <Card className="border-border shadow-sm">
          <div className="divide-y">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.amount > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {tx.amount > 0 ? <ArrowDownToLine size={20} /> : <ArrowRight size={20} />}
                  </div>
                  <div>
                    <p className="font-medium">{tx.recipient || tx.sender}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(tx.date), 'MMM d, h:mm a')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${tx.amount > 0 ? 'text-green-500' : 'text-foreground'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
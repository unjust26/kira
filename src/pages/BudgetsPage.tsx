import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Target, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const CURRENCIES = ["BND", "MYR", "SGD", "USD"];

export function BudgetsPage() {
  const budgets = useQuery(api.budgets.list, {}) ?? [];
  const transactions = useQuery(api.transactions.list, {}) ?? [];
  const categories = useQuery(api.categories.list, {}) ?? [];
  const createBudget = useMutation(api.budgets.create);
  const removeBudget = useMutation(api.budgets.remove);

  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("BND");
  const [period, setPeriod] = useState<"monthly" | "weekly" | "yearly">("monthly");

  const expenseCategories = categories.filter((c) => c.type === "expense");

  // Calculate spending per category for current month
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const monthExpenses = transactions.filter(
    (t) => t.type === "expense" && t.date >= monthStart
  );

  const spendingByCategory: Record<string, number> = {};
  for (const tx of monthExpenses) {
    spendingByCategory[tx.category] = (spendingByCategory[tx.category] || 0) + tx.amount;
  }

  const handleCreate = async () => {
    if (!category || !amount) {
      toast.error("Please fill in all fields");
      return;
    }
    await createBudget({
      category,
      amount: parseFloat(amount),
      currency,
      period,
      startDate: monthStart,
    });
    toast.success("Budget created!");
    setOpen(false);
    setCategory("");
    setAmount("");
  };

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + (spendingByCategory[b.category] || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Budgets</h1>
          <p className="text-muted-foreground">Set spending limits by category</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" /> New Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Budget</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((c) => (
                      <SelectItem key={c._id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Budget Amount</Label>
                  <Input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Period</Label>
                <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreate} className="w-full">Create Budget</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Total Budget</div>
            <div className="text-2xl font-bold">{totalBudget.toLocaleString()} BND</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Total Spent</div>
            <div className="text-2xl font-bold text-destructive">{totalSpent.toLocaleString()} BND</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Remaining</div>
            <div className={`text-2xl font-bold ${totalBudget - totalSpent >= 0 ? "text-emerald-600" : "text-destructive"}`}>
              {(totalBudget - totalSpent).toLocaleString()} BND
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget cards */}
      {budgets.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Target className="size-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-lg mb-1">No budgets yet</h3>
            <p className="text-muted-foreground mb-4">Create your first budget to start tracking spending limits</p>
            <Button onClick={() => setOpen(true)}><Plus className="size-4 mr-2" /> Create Budget</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {budgets.map((budget) => {
            const spent = spendingByCategory[budget.category] || 0;
            const pct = Math.min((spent / budget.amount) * 100, 100);
            const isOver = spent > budget.amount;

            return (
              <Card key={budget._id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base font-semibold">{budget.category}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      removeBudget({ id: budget._id });
                      toast.success("Budget removed");
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm mb-2">
                    <span className={isOver ? "text-destructive font-medium" : "text-muted-foreground"}>
                      {spent.toLocaleString()} {budget.currency} spent
                    </span>
                    <span className="text-muted-foreground">
                      {budget.amount.toLocaleString()} {budget.currency}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver ? "bg-destructive" : pct > 80 ? "bg-amber-500" : "bg-primary"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1.5">
                    <span className={`font-medium ${isOver ? "text-destructive" : ""}`}>
                      {pct.toFixed(0)}% used
                    </span>
                    <span className="text-muted-foreground capitalize">{budget.period}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

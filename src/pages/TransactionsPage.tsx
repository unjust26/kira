import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Trash2,
  ArrowLeftRight,
} from "lucide-react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Empty } from "@/components/ui/empty";
import { toast } from "sonner";
import { formatCurrency, formatDate, CURRENCIES, DEFAULT_CURRENCY } from "@/lib/constants";
import type { Id } from "../../convex/_generated/dataModel";

export function TransactionsPage() {
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [showAdd, setShowAdd] = useState(false);
  const transactions = useQuery(
    api.transactions.list,
    filterType === "all" ? {} : { type: filterType }
  );
  const categories = useQuery(api.categories.list, {});
  const createTx = useMutation(api.transactions.create);
  const removeTx = useMutation(api.transactions.remove);

  const [form, setForm] = useState({
    type: "expense" as "income" | "expense",
    amount: "",
    currency: DEFAULT_CURRENCY,
    category: "",
    description: "",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  const filteredCategories = categories?.filter((c) => c.type === form.type) || [];

  const handleSubmit = async () => {
    if (!form.amount || !form.category || !form.description) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await createTx({
        type: form.type,
        amount: Number.parseFloat(form.amount),
        currency: form.currency,
        category: form.category,
        description: form.description,
        date: form.date,
        notes: form.notes || undefined,
      });
      toast.success("Transaction added");
      setShowAdd(false);
      setForm({
        type: "expense",
        amount: "",
        currency: DEFAULT_CURRENCY,
        category: "",
        description: "",
        date: new Date().toISOString().slice(0, 10),
        notes: "",
      });
    } catch {
      toast.error("Failed to add transaction");
    }
  };

  const handleDelete = async (id: Id<"transactions">) => {
    try {
      await removeTx({ id });
      toast.success("Transaction deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track your income and expenses
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="size-4 mr-1" /> Add Transaction
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "income", "expense"] as const).map((t) => (
          <Button
            key={t}
            size="sm"
            variant={filterType === t ? "default" : "outline"}
            onClick={() => setFilterType(t)}
          >
            {t === "all" ? "All" : t === "income" ? "Income" : "Expenses"}
          </Button>
        ))}
      </div>

      {/* Transaction List */}
      <Card>
        <CardContent className="p-0">
          {!transactions || transactions.length === 0 ? (
            <div className="p-8">
              <Empty
                icon={<ArrowLeftRight className="size-8" />}
                title="No transactions found"
                description={
                  filterType === "all"
                    ? "Add your first transaction to get started."
                    : `No ${filterType} transactions yet.`
                }
              />
            </div>
          ) : (
            <div className="divide-y">
              {transactions.map((tx) => (
                <div
                  key={tx._id}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${
                        tx.type === "income"
                          ? "bg-success/10"
                          : "bg-destructive/10"
                      }`}
                    >
                      {tx.type === "income" ? (
                        <TrendingUp className="size-4 text-success" />
                      ) : (
                        <TrendingDown className="size-4 text-destructive" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {tx.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-xs">
                          {tx.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(tx.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span
                      className={`text-sm font-semibold whitespace-nowrap ${
                        tx.type === "income"
                          ? "text-success"
                          : "text-destructive"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"}
                      {formatCurrency(tx.amount, tx.currency)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(tx._id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Transaction Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={form.type === "expense" ? "default" : "outline"}
                className="flex-1"
                onClick={() =>
                  setForm({ ...form, type: "expense", category: "" })
                }
              >
                <TrendingDown className="size-4 mr-1" /> Expense
              </Button>
              <Button
                variant={form.type === "income" ? "default" : "outline"}
                className="flex-1"
                onClick={() =>
                  setForm({ ...form, type: "income", category: "" })
                }
              >
                <TrendingUp className="size-4 mr-1" /> Income
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Label>Amount *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
              <div>
                <Label>Currency</Label>
                <Select
                  value={form.currency}
                  onValueChange={(v) => setForm({ ...form, currency: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Category *</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((c) => (
                    <SelectItem key={c._id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Description *</Label>
              <Input
                placeholder="What was this for?"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                placeholder="Optional notes..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Add Transaction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

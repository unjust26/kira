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
import { Plus, PiggyBank, Trash2, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";

const CURRENCIES = ["BND", "MYR", "SGD", "USD"];

const GOAL_COLORS = [
  { label: "Emerald", value: "emerald" },
  { label: "Blue", value: "blue" },
  { label: "Amber", value: "amber" },
  { label: "Rose", value: "rose" },
  { label: "Purple", value: "purple" },
];

const colorClasses: Record<string, { bg: string; bar: string; ring: string }> = {
  emerald: { bg: "bg-emerald-50", bar: "bg-emerald-500", ring: "ring-emerald-200" },
  blue: { bg: "bg-blue-50", bar: "bg-blue-500", ring: "ring-blue-200" },
  amber: { bg: "bg-amber-50", bar: "bg-amber-500", ring: "ring-amber-200" },
  rose: { bg: "bg-rose-50", bar: "bg-rose-500", ring: "ring-rose-200" },
  purple: { bg: "bg-purple-50", bar: "bg-purple-500", ring: "ring-purple-200" },
};

export function SavingsPage() {
  const goals = useQuery(api.savingsGoals.list, {}) ?? [];
  const createGoal = useMutation(api.savingsGoals.create);
  const contributeGoal = useMutation(api.savingsGoals.contribute);
  const removeGoal = useMutation(api.savingsGoals.remove);

  const [createOpen, setCreateOpen] = useState(false);
  const [contribOpen, setContribOpen] = useState<Id<"savingsGoals"> | null>(null);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [currency, setCurrency] = useState("BND");
  const [deadline, setDeadline] = useState("");
  const [color, setColor] = useState("emerald");
  const [contribAmount, setContribAmount] = useState("");

  const handleCreate = async () => {
    if (!name || !target) {
      toast.error("Please fill in the name and target amount");
      return;
    }
    await createGoal({
      name,
      targetAmount: parseFloat(target),
      currentAmount: 0,
      currency,
      deadline: deadline || undefined,
      color,
    });
    toast.success("Savings goal created!");
    setCreateOpen(false);
    setName("");
    setTarget("");
    setDeadline("");
  };

  const handleContribute = async () => {
    if (!contribOpen || !contribAmount) return;
    await contributeGoal({ id: contribOpen, amount: parseFloat(contribAmount) });
    toast.success("Contribution added!");
    setContribOpen(null);
    setContribAmount("");
  };

  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Savings Goals</h1>
          <p className="text-muted-foreground">Track progress toward your financial goals</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" /> New Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Savings Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Goal Name</Label>
                <Input placeholder="e.g. New Equipment, Vacation" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Target Amount</Label>
                  <Input type="number" placeholder="0.00" value={target} onChange={(e) => setTarget(e.target.value)} />
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Deadline (optional)</Label>
                  <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                </div>
                <div>
                  <Label>Color</Label>
                  <Select value={color} onValueChange={setColor}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GOAL_COLORS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleCreate} className="w-full">Create Goal</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Total Saved</div>
            <div className="text-2xl font-bold text-emerald-600">{totalSaved.toLocaleString()} BND</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Total Target</div>
            <div className="text-2xl font-bold">{totalTarget.toLocaleString()} BND</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Overall Progress</div>
            <div className="text-2xl font-bold text-primary">
              {totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(0) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goal cards */}
      {goals.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <PiggyBank className="size-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-lg mb-1">No savings goals yet</h3>
            <p className="text-muted-foreground mb-4">Start saving toward something special</p>
            <Button onClick={() => setCreateOpen(true)}><Plus className="size-4 mr-2" /> Create Goal</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const c = colorClasses[goal.color || "emerald"] || colorClasses.emerald;
            const isComplete = goal.currentAmount >= goal.targetAmount;

            return (
              <Card key={goal._id} className={`${isComplete ? "ring-2 " + c.ring : ""}`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <div className={`size-10 rounded-xl ${c.bg} flex items-center justify-center`}>
                      <PiggyBank className={`size-5 ${c.bar.replace("bg-", "text-")}`} />
                    </div>
                    <CardTitle className="text-base font-semibold">{goal.name}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      removeGoal({ id: goal._id });
                      toast.success("Goal removed");
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">
                      {goal.currentAmount.toLocaleString()} {goal.currency}
                    </span>
                    <span className="text-muted-foreground">
                      of {goal.targetAmount.toLocaleString()} {goal.currency}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${c.bar}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-muted-foreground">
                      {isComplete ? "🎉 Goal reached!" : `${pct.toFixed(0)}% saved`}
                      {goal.deadline && !isComplete && ` • Due ${goal.deadline}`}
                    </span>
                    {!isComplete && (
                      <Dialog
                        open={contribOpen === goal._id}
                        onOpenChange={(o) => setContribOpen(o ? goal._id : null)}
                      >
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            <TrendingUp className="size-3 mr-1" /> Add Funds
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add to "{goal.name}"</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <div>
                              <Label>Amount ({goal.currency})</Label>
                              <Input
                                type="number"
                                placeholder="0.00"
                                value={contribAmount}
                                onChange={(e) => setContribAmount(e.target.value)}
                              />
                            </div>
                            <Button onClick={handleContribute} className="w-full">
                              Add Contribution
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
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

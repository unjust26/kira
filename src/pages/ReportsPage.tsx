import { useQuery } from "convex/react";
import { useState, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
} from "lucide-react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/constants";
import { Empty } from "@/components/ui/empty";

export function ReportsPage() {
  const now = new Date();
  const [startDate, setStartDate] = useState(
    `${now.getFullYear()}-01-01`
  );
  const [endDate, setEndDate] = useState(
    now.toISOString().slice(0, 10)
  );

  const stats = useQuery(api.transactions.getStats, { startDate, endDate });

  const expenseCategories = useMemo(
    () =>
      stats?.categoryBreakdown
        .filter((c) => c.type === "expense")
        .sort((a, b) => b.total - a.total) || [],
    [stats]
  );

  const incomeCategories = useMemo(
    () =>
      stats?.categoryBreakdown
        .filter((c) => c.type === "income")
        .sort((a, b) => b.total - a.total) || [],
    [stats]
  );

  const maxExpense = expenseCategories[0]?.total || 1;
  const maxIncome = incomeCategories[0]?.total || 1;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Analyze your business performance
          </p>
        </div>
      </div>

      {/* Date Range */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-end gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">Date Range</span>
            </div>
            <div className="flex gap-3 flex-1">
              <div>
                <Label className="text-xs">From</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs">To</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-8"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setStartDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`);
                  setEndDate(now.toISOString().slice(0, 10));
                }}
              >
                This Month
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setStartDate(`${now.getFullYear()}-01-01`);
                  setEndDate(now.toISOString().slice(0, 10));
                }}
              >
                This Year
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {!stats ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-16 animate-pulse bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* P&L Summary */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <TrendingUp className="size-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Income</p>
                    <p className="text-xl font-bold text-success">
                      {formatCurrency(stats.totalIncome)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <TrendingDown className="size-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Expenses</p>
                    <p className="text-xl font-bold text-destructive">
                      {formatCurrency(stats.totalExpenses)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Wallet className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Net Profit</p>
                    <p
                      className={`text-xl font-bold ${
                        stats.netProfit >= 0 ? "text-success" : "text-destructive"
                      }`}
                    >
                      {formatCurrency(stats.netProfit)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Trend */}
          {stats.monthlyData.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <BarChart3 className="size-4 text-primary" />
                  Monthly Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.monthlyData.map((month) => {
                    const maxVal = Math.max(
                      ...stats.monthlyData.map((m) =>
                        Math.max(m.income, m.expenses)
                      )
                    );
                    return (
                      <div key={month.month} className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">
                            {new Date(month.month + "-01T00:00:00").toLocaleDateString(
                              "en-US",
                              { month: "short", year: "numeric" }
                            )}
                          </span>
                          <span
                            className={`font-semibold ${
                              month.income - month.expenses >= 0
                                ? "text-success"
                                : "text-destructive"
                            }`}
                          >
                            {formatCurrency(month.income - month.expenses)}
                          </span>
                        </div>
                        <div className="flex gap-1 h-5">
                          <div
                            className="bg-success/20 rounded-sm h-full transition-all"
                            style={{
                              width: `${(month.income / (maxVal || 1)) * 100}%`,
                            }}
                          >
                            <div className="bg-success h-full rounded-sm" style={{ width: "100%" }} />
                          </div>
                        </div>
                        <div className="flex gap-1 h-5">
                          <div
                            className="bg-destructive/20 rounded-sm h-full transition-all"
                            style={{
                              width: `${(month.expenses / (maxVal || 1)) * 100}%`,
                            }}
                          >
                            <div className="bg-destructive h-full rounded-sm" style={{ width: "100%" }} />
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Income: {formatCurrency(month.income)}</span>
                          <span>Expenses: {formatCurrency(month.expenses)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="size-2.5 rounded-sm bg-success" />
                    Income
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="size-2.5 rounded-sm bg-destructive" />
                    Expenses
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Category Breakdown */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Expense Breakdown */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  Expense Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                {expenseCategories.length === 0 ? (
                  <Empty
                    icon={<TrendingDown className="size-6" />}
                    title="No expenses"
                    description="No expense data for this period."
                  />
                ) : (
                  <div className="space-y-3">
                    {expenseCategories.map((cat) => (
                      <div key={cat.category} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{cat.category}</span>
                          <span className="font-medium">
                            {formatCurrency(cat.total)}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-destructive/70 rounded-full transition-all"
                            style={{
                              width: `${(cat.total / maxExpense) * 100}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {cat.count} transaction{cat.count !== 1 ? "s" : ""} ·{" "}
                          {((cat.total / stats.totalExpenses) * 100).toFixed(1)}%
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Income Breakdown */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  Income Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                {incomeCategories.length === 0 ? (
                  <Empty
                    icon={<TrendingUp className="size-6" />}
                    title="No income"
                    description="No income data for this period."
                  />
                ) : (
                  <div className="space-y-3">
                    {incomeCategories.map((cat) => (
                      <div key={cat.category} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{cat.category}</span>
                          <span className="font-medium">
                            {formatCurrency(cat.total)}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-success/70 rounded-full transition-all"
                            style={{
                              width: `${(cat.total / maxIncome) * 100}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {cat.count} transaction{cat.count !== 1 ? "s" : ""} ·{" "}
                          {((cat.total / stats.totalIncome) * 100).toFixed(1)}%
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

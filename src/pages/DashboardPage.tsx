import { useQuery, useMutation } from "convex/react";
import { useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowLeftRight,
  Receipt,
  FileText,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/constants";
import { Empty } from "@/components/ui/empty";

export function DashboardPage() {
  const stats = useQuery(api.transactions.getStats, {});
  const recentTransactions = useQuery(api.transactions.list, { limit: 5 });
  const invoiceStats = useQuery(api.invoices.getStats);
  const seedCategories = useMutation(api.categories.seedDefaults);

  useEffect(() => {
    seedCategories().catch(() => {});
  }, [seedCategories]);

  if (!stats || !invoiceStats) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-16 animate-pulse bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Overview of your business finances
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" asChild>
            <Link to="/transactions">
              <Plus className="size-4 mr-1" /> Transaction
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Income</p>
                <p className="text-2xl font-bold text-success mt-1">
                  {formatCurrency(stats.totalIncome)}
                </p>
              </div>
              <div className="size-10 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="size-5 text-success" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.incomeCount} transaction{stats.incomeCount !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Expenses</p>
                <p className="text-2xl font-bold text-destructive mt-1">
                  {formatCurrency(stats.totalExpenses)}
                </p>
              </div>
              <div className="size-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="size-5 text-destructive" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.expenseCount} transaction{stats.expenseCount !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Net Profit</p>
                <p
                  className={`text-2xl font-bold mt-1 ${
                    stats.netProfit >= 0 ? "text-success" : "text-destructive"
                  }`}
                >
                  {formatCurrency(stats.netProfit)}
                </p>
              </div>
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wallet className="size-5 text-primary" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Income minus expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Outstanding</p>
                <p className="text-2xl font-bold text-warning mt-1">
                  {formatCurrency(invoiceStats.totalOutstanding)}
                </p>
              </div>
              <div className="size-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <FileText className="size-5 text-warning" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {invoiceStats.sentCount + invoiceStats.overdueCount} unpaid invoice
              {invoiceStats.sentCount + invoiceStats.overdueCount !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content row */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent Transactions */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/transactions">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {!recentTransactions || recentTransactions.length === 0 ? (
              <Empty
                icon={<ArrowLeftRight className="size-8" />}
                title="No transactions yet"
                description="Start by adding your first income or expense."
              />
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx._id}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
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
                        <p className="text-xs text-muted-foreground">
                          {tx.category} · {formatDate(tx.date)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-sm font-semibold whitespace-nowrap ml-4 ${
                        tx.type === "income"
                          ? "text-success"
                          : "text-destructive"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"}
                      {formatCurrency(tx.amount, tx.currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/transactions">
                <ArrowLeftRight className="size-4 mr-2 text-primary" />
                Add Transaction
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/receipts">
                <Receipt className="size-4 mr-2 text-primary" />
                Upload Receipt
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/invoices">
                <FileText className="size-4 mr-2 text-primary" />
                Create Invoice
              </Link>
            </Button>

            {/* Invoice Summary */}
            <div className="pt-4 border-t mt-4">
              <p className="text-sm font-medium mb-3">Invoice Summary</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Draft</span>
                  <Badge variant="secondary">{invoiceStats.draftCount}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sent</span>
                  <Badge variant="outline" className="border-info text-info">
                    {invoiceStats.sentCount}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Paid</span>
                  <Badge variant="outline" className="border-success text-success">
                    {invoiceStats.paidCount}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Overdue</span>
                  <Badge variant="outline" className="border-destructive text-destructive">
                    {invoiceStats.overdueCount}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Top Categories */}
            {stats.categoryBreakdown.length > 0 && (
              <div className="pt-4 border-t mt-4">
                <p className="text-sm font-medium mb-3">Top Expense Categories</p>
                <div className="space-y-2">
                  {stats.categoryBreakdown
                    .filter((c) => c.type === "expense")
                    .sort((a, b) => b.total - a.total)
                    .slice(0, 4)
                    .map((cat) => (
                      <div key={cat.category} className="flex justify-between text-sm">
                        <span className="text-muted-foreground truncate mr-2">
                          {cat.category}
                        </span>
                        <span className="font-medium whitespace-nowrap">
                          {formatCurrency(cat.total)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

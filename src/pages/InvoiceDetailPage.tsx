import { useQuery } from "convex/react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/constants";
import type { Id } from "../../convex/_generated/dataModel";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-info/10 text-info border-info/30",
  paid: "bg-success/10 text-success border-success/30",
  overdue: "bg-destructive/10 text-destructive border-destructive/30",
  cancelled: "bg-muted text-muted-foreground",
};

export function InvoiceDetailPage() {
  const { id } = useParams();
  const invoice = useQuery(
    api.invoices.get,
    id ? { id: id as Id<"invoices"> } : "skip"
  );

  if (!invoice) {
    return (
      <div className="p-6">
        <div className="h-96 animate-pulse bg-muted rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/invoices">
            <ArrowLeft className="size-4 mr-1" /> Back
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
        >
          <Printer className="size-4 mr-1" /> Print
        </Button>
      </div>

      {/* Invoice Card */}
      <Card className="print:shadow-none print:border-0">
        <CardContent className="p-6 sm:p-10">
          {/* Top section */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-primary">INVOICE</h1>
              <p className="text-lg font-mono font-semibold mt-1">
                {invoice.invoiceNumber}
              </p>
              <Badge
                variant="outline"
                className={`mt-2 ${statusColors[invoice.status]}`}
              >
                {invoice.status.toUpperCase()}
              </Badge>
            </div>
            <div className="text-right">
              {invoice.businessName && (
                <p className="text-lg font-semibold">{invoice.businessName}</p>
              )}
              {invoice.businessAddress && (
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {invoice.businessAddress}
                </p>
              )}
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Bill To + Dates */}
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                Bill To
              </p>
              <p className="font-semibold">{invoice.contactName}</p>
              {invoice.contactEmail && (
                <p className="text-sm text-muted-foreground">
                  {invoice.contactEmail}
                </p>
              )}
              {invoice.contactPhone && (
                <p className="text-sm text-muted-foreground">
                  {invoice.contactPhone}
                </p>
              )}
            </div>
            <div className="sm:text-right">
              <div className="mb-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Issue Date
                </p>
                <p className="text-sm">{formatDate(invoice.issueDate)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Due Date
                </p>
                <p className="text-sm">{formatDate(invoice.dueDate)}</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border rounded-lg overflow-hidden mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 font-medium">Description</th>
                  <th className="text-right p-3 font-medium w-20">Qty</th>
                  <th className="text-right p-3 font-medium w-28">Price</th>
                  <th className="text-right p-3 font-medium w-28">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-3">{item.description}</td>
                    <td className="text-right p-3">{item.quantity}</td>
                    <td className="text-right p-3">
                      {formatCurrency(item.unitPrice, invoice.currency)}
                    </td>
                    <td className="text-right p-3 font-medium">
                      {formatCurrency(item.amount, invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
              </div>
              {invoice.taxRate > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Tax ({invoice.taxRate}%)
                  </span>
                  <span>
                    {formatCurrency(invoice.taxAmount, invoice.currency)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">
                  {formatCurrency(invoice.total, invoice.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-8 pt-6 border-t">
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                Notes
              </p>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {invoice.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

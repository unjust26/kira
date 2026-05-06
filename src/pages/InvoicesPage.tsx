import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import {
  Plus,
  FileText,
  Trash2,
  Eye,
  Send,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
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

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-info/10 text-info border-info/30",
  paid: "bg-success/10 text-success border-success/30",
  overdue: "bg-destructive/10 text-destructive border-destructive/30",
  cancelled: "bg-muted text-muted-foreground line-through",
};

type InvoiceItem = { description: string; quantity: number; unitPrice: number; amount: number };

export function InvoicesPage() {
  const invoices = useQuery(api.invoices.list, {});
  const nextNumber = useQuery(api.invoices.getNextNumber);
  const createInvoice = useMutation(api.invoices.create);
  const updateInvoice = useMutation(api.invoices.update);
  const removeInvoice = useMutation(api.invoices.remove);
  const businessProfile = useQuery(api.businessProfile.get);

  const [showCreate, setShowCreate] = useState(false);
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, unitPrice: 0, amount: 0 },
  ]);
  const [form, setForm] = useState({
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    currency: DEFAULT_CURRENCY,
    taxRate: 0,
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    notes: "",
  });

  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const taxAmount = subtotal * (form.taxRate / 100);
  const total = subtotal + taxAmount;

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    const item = { ...newItems[index] };
    if (field === "description") {
      item.description = value as string;
    } else {
      item[field] = Number(value);
    }
    item.amount = item.quantity * item.unitPrice;
    newItems[index] = item;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleCreate = async () => {
    if (!form.contactName) {
      toast.error("Please enter a customer name");
      return;
    }
    if (items.some((i) => !i.description || i.amount <= 0)) {
      toast.error("Please fill in all line items");
      return;
    }
    try {
      await createInvoice({
        invoiceNumber: nextNumber || "INV-0001",
        contactName: form.contactName,
        contactEmail: form.contactEmail || undefined,
        contactPhone: form.contactPhone || undefined,
        items,
        subtotal,
        taxRate: form.taxRate,
        taxAmount,
        total,
        currency: form.currency,
        status: "draft",
        issueDate: form.issueDate,
        dueDate: form.dueDate,
        notes: form.notes || undefined,
        businessName: businessProfile?.businessName || undefined,
        businessAddress: businessProfile?.address || undefined,
      });
      toast.success("Invoice created");
      setShowCreate(false);
      setItems([{ description: "", quantity: 1, unitPrice: 0, amount: 0 }]);
      setForm({
        contactName: "",
        contactEmail: "",
        contactPhone: "",
        currency: DEFAULT_CURRENCY,
        taxRate: 0,
        issueDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        notes: "",
      });
    } catch {
      toast.error("Failed to create invoice");
    }
  };

  const handleStatusChange = async (
    id: Id<"invoices">,
    status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
  ) => {
    try {
      await updateInvoice({ id, status });
      toast.success(`Invoice marked as ${status}`);
    } catch {
      toast.error("Failed to update invoice");
    }
  };

  const handleDelete = async (id: Id<"invoices">) => {
    try {
      await removeInvoice({ id });
      toast.success("Invoice deleted");
    } catch {
      toast.error("Failed to delete invoice");
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create and manage your invoices
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="size-4 mr-1" /> New Invoice
        </Button>
      </div>

      {/* Invoice List */}
      {!invoices || invoices.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <Empty
              icon={<FileText className="size-8" />}
              title="No invoices yet"
              description="Create your first invoice to get started."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <Card key={inv._id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-mono font-semibold text-primary">
                        {inv.invoiceNumber}
                      </span>
                      <Badge
                        variant="outline"
                        className={statusColors[inv.status]}
                      >
                        {inv.status}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">{inv.contactName}</p>
                    <p className="text-xs text-muted-foreground">
                      Issued {formatDate(inv.issueDate)} · Due{" "}
                      {formatDate(inv.dueDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">
                      {formatCurrency(inv.total, inv.currency)}
                    </span>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="size-8" asChild>
                        <Link to={`/invoices/${inv._id}`}>
                          <Eye className="size-4" />
                        </Link>
                      </Button>
                      {inv.status === "draft" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 text-info"
                          onClick={() => handleStatusChange(inv._id, "sent")}
                          title="Mark as sent"
                        >
                          <Send className="size-4" />
                        </Button>
                      )}
                      {inv.status === "sent" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 text-success"
                          onClick={() => handleStatusChange(inv._id, "paid")}
                          title="Mark as paid"
                        >
                          <CheckCircle className="size-4" />
                        </Button>
                      )}
                      {inv.status === "sent" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 text-warning"
                          onClick={() => handleStatusChange(inv._id, "overdue")}
                          title="Mark as overdue"
                        >
                          <Clock className="size-4" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(inv._id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Invoice Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              New Invoice{" "}
              <span className="text-muted-foreground font-mono text-sm">
                {nextNumber}
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            {/* Customer Info */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Customer Name *</Label>
                <Input
                  placeholder="Customer name"
                  value={form.contactName}
                  onChange={(e) =>
                    setForm({ ...form, contactName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="customer@email.com"
                  value={form.contactEmail}
                  onChange={(e) =>
                    setForm({ ...form, contactEmail: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label>Issue Date</Label>
                <Input
                  type="date"
                  value={form.issueDate}
                  onChange={(e) =>
                    setForm({ ...form, issueDate: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm({ ...form, dueDate: e.target.value })
                  }
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

            {/* Line Items */}
            <div>
              <Label className="mb-2 block">Line Items</Label>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      {i === 0 && (
                        <span className="text-xs text-muted-foreground">
                          Description
                        </span>
                      )}
                      <Input
                        placeholder="Item description"
                        value={item.description}
                        onChange={(e) =>
                          updateItem(i, "description", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      {i === 0 && (
                        <span className="text-xs text-muted-foreground">Qty</span>
                      )}
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(i, "quantity", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      {i === 0 && (
                        <span className="text-xs text-muted-foreground">
                          Price
                        </span>
                      )}
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(i, "unitPrice", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-span-2 text-right text-sm font-medium pt-2">
                      {formatCurrency(item.amount, form.currency)}
                    </div>
                    <div className="col-span-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground"
                        onClick={() => removeItem(i)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={addItem}
              >
                <Plus className="size-3 mr-1" /> Add Item
              </Button>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(subtotal, form.currency)}</span>
                </div>
                <div className="flex items-center justify-between text-sm gap-2">
                  <span className="text-muted-foreground">Tax</span>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      step="0.1"
                      className="w-16 h-7 text-xs text-right"
                      value={form.taxRate}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          taxRate: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                    <span className="text-xs">%</span>
                    <span className="ml-2">{formatCurrency(taxAmount, form.currency)}</span>
                  </div>
                </div>
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(total, form.currency)}</span>
                </div>
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                placeholder="Payment terms, bank details, etc."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

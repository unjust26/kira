import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import {
  Plus,
  Users,
  Trash2,
  Mail,
  Phone,
  Building2,
  MapPin,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Empty } from "@/components/ui/empty";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";

const typeBadge: Record<string, string> = {
  customer: "bg-success/10 text-success border-success/30",
  vendor: "bg-info/10 text-info border-info/30",
  both: "bg-warning/10 text-warning border-warning/30",
};

export function ContactsPage() {
  const [filterType, setFilterType] = useState<
    "all" | "customer" | "vendor" | "both"
  >("all");
  const [showAdd, setShowAdd] = useState(false);
  const contacts = useQuery(
    api.contacts.list,
    filterType === "all" ? {} : { type: filterType }
  );
  const createContact = useMutation(api.contacts.create);
  const removeContact = useMutation(api.contacts.remove);

  const [form, setForm] = useState({
    name: "",
    type: "customer" as "customer" | "vendor" | "both",
    email: "",
    phone: "",
    company: "",
    address: "",
    notes: "",
  });

  const handleSubmit = async () => {
    if (!form.name) {
      toast.error("Please enter a name");
      return;
    }
    try {
      await createContact({
        name: form.name,
        type: form.type,
        email: form.email || undefined,
        phone: form.phone || undefined,
        company: form.company || undefined,
        address: form.address || undefined,
        notes: form.notes || undefined,
      });
      toast.success("Contact added");
      setShowAdd(false);
      setForm({
        name: "",
        type: "customer",
        email: "",
        phone: "",
        company: "",
        address: "",
        notes: "",
      });
    } catch {
      toast.error("Failed to add contact");
    }
  };

  const handleDelete = async (id: Id<"contacts">) => {
    try {
      await removeContact({ id });
      toast.success("Contact deleted");
    } catch {
      toast.error("Failed to delete contact");
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your customers and vendors
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="size-4 mr-1" /> Add Contact
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "customer", "vendor", "both"] as const).map((t) => (
          <Button
            key={t}
            size="sm"
            variant={filterType === t ? "default" : "outline"}
            onClick={() => setFilterType(t)}
          >
            {t === "all"
              ? "All"
              : t === "customer"
              ? "Customers"
              : t === "vendor"
              ? "Vendors"
              : "Both"}
          </Button>
        ))}
      </div>

      {/* Contact List */}
      {!contacts || contacts.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <Empty
              icon={<Users className="size-8" />}
              title="No contacts yet"
              description="Add your customers and vendors to keep track of your business relationships."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.map((contact) => (
            <Card key={contact._id} className="group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {contact.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{contact.name}</p>
                      <Badge
                        variant="outline"
                        className={`text-xs ${typeBadge[contact.type]}`}
                      >
                        {contact.type}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                    onClick={() => handleDelete(contact._id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  {contact.company && (
                    <div className="flex items-center gap-2">
                      <Building2 className="size-3.5 shrink-0" />
                      <span className="truncate">{contact.company}</span>
                    </div>
                  )}
                  {contact.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="size-3.5 shrink-0" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="size-3.5 shrink-0" />
                      <span>{contact.phone}</span>
                    </div>
                  )}
                  {contact.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="size-3.5 shrink-0" />
                      <span className="truncate">{contact.address}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Contact Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input
                placeholder="Contact name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v: "customer" | "vendor" | "both") =>
                  setForm({ ...form, type: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Company</Label>
              <Input
                placeholder="Company name"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  placeholder="+673..."
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Address</Label>
              <Input
                placeholder="Business address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                placeholder="Additional notes..."
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
            <Button onClick={handleSubmit}>Add Contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

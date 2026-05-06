import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState, useEffect } from "react";
import { Building2, Save, Trash2, Plus, LogOut } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CURRENCIES, DEFAULT_CURRENCY } from "@/lib/constants";
import type { Id } from "../../convex/_generated/dataModel";

export function SettingsPage() {
  const user = useQuery(api.auth.currentUser);
  const businessProfile = useQuery(api.businessProfile.get);
  const categories = useQuery(api.categories.list, {});
  const upsertProfile = useMutation(api.businessProfile.upsert);
  const createCategory = useMutation(api.categories.create);
  const removeCategory = useMutation(api.categories.remove);
  const deleteAccount = useMutation(api.users.deleteAccount);
  const { signOut } = useAuthActions();

  const [profile, setProfile] = useState({
    businessName: "",
    address: "",
    phone: "",
    email: "",
    registrationNumber: "",
    defaultCurrency: DEFAULT_CURRENCY,
    taxRate: 0,
  });

  const [newCategory, setNewCategory] = useState({
    name: "",
    type: "expense" as "income" | "expense",
  });

  useEffect(() => {
    if (businessProfile) {
      setProfile({
        businessName: businessProfile.businessName,
        address: businessProfile.address || "",
        phone: businessProfile.phone || "",
        email: businessProfile.email || "",
        registrationNumber: businessProfile.registrationNumber || "",
        defaultCurrency: businessProfile.defaultCurrency,
        taxRate: businessProfile.taxRate || 0,
      });
    }
  }, [businessProfile]);

  const handleSaveProfile = async () => {
    if (!profile.businessName) {
      toast.error("Please enter a business name");
      return;
    }
    try {
      await upsertProfile({
        businessName: profile.businessName,
        address: profile.address || undefined,
        phone: profile.phone || undefined,
        email: profile.email || undefined,
        registrationNumber: profile.registrationNumber || undefined,
        defaultCurrency: profile.defaultCurrency,
        taxRate: profile.taxRate || undefined,
      });
      toast.success("Business profile saved");
    } catch {
      toast.error("Failed to save profile");
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name) {
      toast.error("Enter a category name");
      return;
    }
    try {
      await createCategory({
        name: newCategory.name,
        type: newCategory.type,
      });
      toast.success("Category added");
      setNewCategory({ name: "", type: "expense" });
    } catch {
      toast.error("Failed to add category");
    }
  };

  const handleDeleteCategory = async (id: Id<"categories">) => {
    try {
      await removeCategory({ id });
      toast.success("Category removed");
    } catch {
      toast.error("Failed to remove category");
    }
  };

  const incomeCategories = categories?.filter((c) => c.type === "income") || [];
  const expenseCategories = categories?.filter((c) => c.type === "expense") || [];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your business profile and preferences
        </p>
      </div>

      {/* Business Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="size-4" />
            Business Profile
          </CardTitle>
          <CardDescription>
            This information appears on your invoices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Business Name *</Label>
            <Input
              placeholder="Your business name"
              value={profile.businessName}
              onChange={(e) =>
                setProfile({ ...profile, businessName: e.target.value })
              }
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="business@email.com"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                placeholder="+673..."
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <Label>Address</Label>
            <Textarea
              placeholder="Business address"
              value={profile.address}
              onChange={(e) =>
                setProfile({ ...profile, address: e.target.value })
              }
              rows={2}
            />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <Label>Registration No.</Label>
              <Input
                placeholder="BN/RC..."
                value={profile.registrationNumber}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    registrationNumber: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Default Currency</Label>
              <Select
                value={profile.defaultCurrency}
                onValueChange={(v) =>
                  setProfile({ ...profile, defaultCurrency: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.code} — {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Default Tax Rate (%)</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="0"
                value={profile.taxRate}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    taxRate: Number.parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
          <Button onClick={handleSaveProfile}>
            <Save className="size-4 mr-1" /> Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Categories</CardTitle>
          <CardDescription>
            Customize your income and expense categories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add new */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label>New Category</Label>
              <Input
                placeholder="Category name"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
              />
            </div>
            <Select
              value={newCategory.type}
              onValueChange={(v: "income" | "expense") =>
                setNewCategory({ ...newCategory, type: v })
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
            <Button size="icon" onClick={handleAddCategory}>
              <Plus className="size-4" />
            </Button>
          </div>

          <Separator />

          {/* Income categories */}
          <div>
            <p className="text-sm font-medium mb-2">Income Categories</p>
            <div className="flex flex-wrap gap-2">
              {incomeCategories.map((cat) => (
                <Badge
                  key={cat._id}
                  variant="outline"
                  className="gap-1 pr-1 border-success/30 text-success"
                >
                  {cat.name}
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat._id)}
                    className="ml-1 rounded hover:bg-destructive/10 p-0.5"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </Badge>
              ))}
              {incomeCategories.length === 0 && (
                <span className="text-xs text-muted-foreground">
                  No income categories
                </span>
              )}
            </div>
          </div>

          {/* Expense categories */}
          <div>
            <p className="text-sm font-medium mb-2">Expense Categories</p>
            <div className="flex flex-wrap gap-2">
              {expenseCategories.map((cat) => (
                <Badge
                  key={cat._id}
                  variant="outline"
                  className="gap-1 pr-1 border-destructive/30 text-destructive"
                >
                  {cat.name}
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat._id)}
                    className="ml-1 rounded hover:bg-destructive/10 p-0.5"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </Badge>
              ))}
              {expenseCategories.length === 0 && (
                <span className="text-xs text-muted-foreground">
                  No expense categories
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
          <CardDescription>
            Signed in as {user?.email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" onClick={() => signOut()}>
            <LogOut className="size-4 mr-1" /> Sign Out
          </Button>
          <Separator />
          <div>
            <p className="text-sm font-medium text-destructive mb-2">
              Danger Zone
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                if (
                  window.confirm(
                    "Are you sure? This will permanently delete your account and all data."
                  )
                ) {
                  await deleteAccount();
                  signOut();
                }
              }}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

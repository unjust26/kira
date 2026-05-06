import { useQuery, useMutation } from "convex/react";
import { useState, useRef } from "react";
import {
  Plus,
  Receipt,
  Trash2,
  Download,
  Eye,
  Upload,
  Image,
  FileIcon,
} from "lucide-react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Empty } from "@/components/ui/empty";
import { toast } from "sonner";
import { formatCurrency, formatDate, CURRENCIES, DEFAULT_CURRENCY } from "@/lib/constants";
import type { Id } from "../../convex/_generated/dataModel";

export function ReceiptsPage() {
  const receipts = useQuery(api.receipts.list);
  const generateUploadUrl = useMutation(api.receipts.generateUploadUrl);
  const createReceipt = useMutation(api.receipts.create);
  const removeReceipt = useMutation(api.receipts.remove);

  const [showAdd, setShowAdd] = useState(false);
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    description: "",
    amount: "",
    currency: DEFAULT_CURRENCY,
    date: new Date().toISOString().slice(0, 10),
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }
    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });
      const { storageId } = await result.json();

      await createReceipt({
        storageId: storageId as Id<"_storage">,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        description: form.description || undefined,
        amount: form.amount ? Number.parseFloat(form.amount) : undefined,
        currency: form.currency || undefined,
        date: form.date,
      });

      toast.success("Receipt uploaded");
      setShowAdd(false);
      setSelectedFile(null);
      setForm({
        description: "",
        amount: "",
        currency: DEFAULT_CURRENCY,
        date: new Date().toISOString().slice(0, 10),
      });
    } catch {
      toast.error("Failed to upload receipt");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: Id<"receipts">) => {
    try {
      await removeReceipt({ id });
      toast.success("Receipt deleted");
    } catch {
      toast.error("Failed to delete receipt");
    }
  };

  const isImage = (fileType: string) =>
    fileType.startsWith("image/");

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Receipts</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Store and organize your digital receipts
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="size-4 mr-1" /> Upload Receipt
        </Button>
      </div>

      {/* Receipts Grid */}
      {!receipts || receipts.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <Empty
              icon={<Receipt className="size-8" />}
              title="No receipts yet"
              description="Upload photos or screenshots of your receipts to keep them organized."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {receipts.map((receipt) => (
            <Card key={receipt._id} className="overflow-hidden group">
              {/* Preview thumbnail */}
              <div className="relative aspect-[4/3] bg-muted">
                {receipt.url && isImage(receipt.fileType) ? (
                  <img
                    src={receipt.url}
                    alt={receipt.fileName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileIcon className="size-12 text-muted-foreground" />
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {receipt.url && (
                    <>
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => setShowPreview(receipt.url)}
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        asChild
                      >
                        <a href={receipt.url} target="_blank" rel="noopener noreferrer" download>
                          <Download className="size-4" />
                        </a>
                      </Button>
                    </>
                  )}
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => handleDelete(receipt._id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium truncate">
                  {receipt.description || receipt.fileName}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(receipt.date)}
                  </span>
                  {receipt.amount && (
                    <span className="text-sm font-semibold">
                      {formatCurrency(receipt.amount, receipt.currency || DEFAULT_CURRENCY)}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Receipt</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {selectedFile ? (
                <div className="flex items-center justify-center gap-2">
                  {selectedFile.type.startsWith("image/") ? (
                    <Image className="size-5 text-primary" />
                  ) : (
                    <FileIcon className="size-5 text-primary" />
                  )}
                  <span className="text-sm font-medium">{selectedFile.name}</span>
                </div>
              ) : (
                <div>
                  <Upload className="size-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to select a file
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Images, PDFs, screenshots
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,.pdf"
                onChange={handleFileSelect}
              />
            </div>

            <div>
              <Label>Description</Label>
              <Input
                placeholder="What is this receipt for?"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Label>Amount</Label>
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
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={!!showPreview} onOpenChange={() => setShowPreview(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Receipt Preview</DialogTitle>
          </DialogHeader>
          {showPreview && (
            <img
              src={showPreview}
              alt="Receipt"
              className="w-full rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

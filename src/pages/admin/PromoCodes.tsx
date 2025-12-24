import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Copy } from "lucide-react";

interface PromoCode {
  id: string;
  code: string;
  label: string | null;
  type: string;
  value: number | null;
  min_cart_amount: number | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  usage_limit_total: number | null;
  usage_limit_per_email: number;
  used_count: number;
  created_at: string;
}

interface PromoAssignment {
  id: string;
  email: string;
  assigned_at: string;
  promo_codes: { code: string; label: string | null } | null;
}

interface EmailLog {
  id: string;
  recipient_email: string;
  subject: string;
  status: string;
  created_at: string;
  metadata: { promo_code_masked?: string } | null;
}

const emptyPromoForm = {
  code: "",
  label: "",
  type: "percent" as "percent" | "fixed" | "free_shipping",
  value: 10,
  min_cart_amount: null as number | null,
  starts_at: "",
  ends_at: "",
  is_active: true,
  usage_limit_total: null as number | null,
  usage_limit_per_email: 1
};

export default function PromoCodes() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [promoForm, setPromoForm] = useState(emptyPromoForm);

  // Fetch promo codes
  const { data: promoCodes, isLoading: loadingCodes } = useQuery({
    queryKey: ["promo-codes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as PromoCode[];
    }
  });

  // Fetch assignments
  const { data: assignments, isLoading: loadingAssignments } = useQuery({
    queryKey: ["promo-assignments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promo_assignments")
        .select("id, email, assigned_at, promo_codes(code, label)")
        .order("assigned_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as PromoAssignment[];
    }
  });

  // Fetch email logs
  const { data: emailLogs, isLoading: loadingLogs } = useQuery({
    queryKey: ["newsletter-email-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_logs")
        .select("id, recipient_email, subject, status, created_at, metadata")
        .eq("template_key", "newsletter_welcome")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as EmailLog[];
    }
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (promo: typeof promoForm & { id?: string }) => {
      const payload = {
        code: promo.code.toUpperCase().trim(),
        label: promo.label || null,
        type: promo.type,
        value: promo.type === "free_shipping" ? null : promo.value,
        min_cart_amount: promo.min_cart_amount || null,
        starts_at: promo.starts_at || null,
        ends_at: promo.ends_at || null,
        is_active: promo.is_active,
        usage_limit_total: promo.usage_limit_total || null,
        usage_limit_per_email: promo.usage_limit_per_email || 1
      };

      if (promo.id) {
        const { error } = await supabase.from("promo_codes").update(payload).eq("id", promo.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("promo_codes").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promo-codes"] });
      toast.success(editingPromo ? "Code modifié" : "Code créé");
      setDialogOpen(false);
      resetForm();
    },
    onError: (e: Error) => {
      toast.error("Erreur: " + e.message);
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("promo_codes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promo-codes"] });
      toast.success("Code supprimé");
    }
  });

  // Toggle active mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("promo_codes").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promo-codes"] });
    }
  });

  const resetForm = () => {
    setPromoForm(emptyPromoForm);
    setEditingPromo(null);
  };

  const openEditDialog = (promo: PromoCode) => {
    setEditingPromo(promo);
    setPromoForm({
      code: promo.code,
      label: promo.label || "",
      type: promo.type as "percent" | "fixed" | "free_shipping",
      value: promo.value || 10,
      min_cart_amount: promo.min_cart_amount,
      starts_at: promo.starts_at ? promo.starts_at.split("T")[0] : "",
      ends_at: promo.ends_at ? promo.ends_at.split("T")[0] : "",
      is_active: promo.is_active,
      usage_limit_total: promo.usage_limit_total,
      usage_limit_per_email: promo.usage_limit_per_email
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({ ...promoForm, id: editingPromo?.id });
  };

  const formatType = (type: string) => {
    switch (type) {
      case "percent": return "% réduction";
      case "fixed": return "€ réduction";
      case "free_shipping": return "Livraison offerte";
      default: return type;
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("fr-FR");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Codes Promo</h1>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Nouveau code</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingPromo ? "Modifier le code" : "Nouveau code promo"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Code *</Label>
                  <Input
                    value={promoForm.code}
                    onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value })}
                    placeholder="WYDELINE10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Libellé</Label>
                  <Input
                    value={promoForm.label}
                    onChange={(e) => setPromoForm({ ...promoForm, label: e.target.value })}
                    placeholder="Bienvenue -10%"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type *</Label>
                  <Select
                    value={promoForm.type}
                    onValueChange={(v) => setPromoForm({ ...promoForm, type: v as "percent" | "fixed" | "free_shipping" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">% réduction</SelectItem>
                      <SelectItem value="fixed">€ réduction</SelectItem>
                      <SelectItem value="free_shipping">Livraison offerte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {promoForm.type !== "free_shipping" && (
                  <div className="space-y-2">
                    <Label>Valeur *</Label>
                    <Input
                      type="number"
                      value={promoForm.value || ""}
                      onChange={(e) => setPromoForm({ ...promoForm, value: parseFloat(e.target.value) || 0 })}
                      placeholder="10"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Minimum panier (€)</Label>
                <Input
                  type="number"
                  value={promoForm.min_cart_amount || ""}
                  onChange={(e) => setPromoForm({ ...promoForm, min_cart_amount: parseFloat(e.target.value) || null })}
                  placeholder="200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date début</Label>
                  <Input
                    type="date"
                    value={promoForm.starts_at}
                    onChange={(e) => setPromoForm({ ...promoForm, starts_at: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date fin</Label>
                  <Input
                    type="date"
                    value={promoForm.ends_at}
                    onChange={(e) => setPromoForm({ ...promoForm, ends_at: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Limite totale</Label>
                  <Input
                    type="number"
                    value={promoForm.usage_limit_total || ""}
                    onChange={(e) => setPromoForm({ ...promoForm, usage_limit_total: parseInt(e.target.value) || null })}
                    placeholder="Illimité"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Limite par email</Label>
                  <Input
                    type="number"
                    value={promoForm.usage_limit_per_email}
                    onChange={(e) => setPromoForm({ ...promoForm, usage_limit_per_email: parseInt(e.target.value) || 1 })}
                    min={1}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={promoForm.is_active}
                  onCheckedChange={(checked) => setPromoForm({ ...promoForm, is_active: checked })}
                />
                <Label>Actif</Label>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="codes">
        <TabsList>
          <TabsTrigger value="codes">Codes promo</TabsTrigger>
          <TabsTrigger value="assignments">Attributions</TabsTrigger>
          <TabsTrigger value="emails">Emails envoyés</TabsTrigger>
        </TabsList>

        <TabsContent value="codes" className="mt-4">
          {loadingCodes ? (
            <p className="text-muted-foreground">Chargement...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Libellé</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Valeur</TableHead>
                  <TableHead>Min. panier</TableHead>
                  <TableHead>Validité</TableHead>
                  <TableHead>Utilisations</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promoCodes?.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell className="font-mono font-medium">{promo.code}</TableCell>
                    <TableCell>{promo.label || "-"}</TableCell>
                    <TableCell>{formatType(promo.type)}</TableCell>
                    <TableCell>
                      {promo.type === "percent" && `${promo.value}%`}
                      {promo.type === "fixed" && `${promo.value}€`}
                      {promo.type === "free_shipping" && "-"}
                    </TableCell>
                    <TableCell>{promo.min_cart_amount ? `${promo.min_cart_amount}€` : "-"}</TableCell>
                    <TableCell className="text-sm">
                      {promo.starts_at || promo.ends_at ? (
                        <>
                          {formatDate(promo.starts_at)} - {formatDate(promo.ends_at)}
                        </>
                      ) : (
                        "Permanent"
                      )}
                    </TableCell>
                    <TableCell>
                      {promo.used_count}
                      {promo.usage_limit_total && ` / ${promo.usage_limit_total}`}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={promo.is_active}
                        onCheckedChange={(checked) => toggleMutation.mutate({ id: promo.id, is_active: checked })}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(promo)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("Supprimer ce code promo ?")) {
                              deleteMutation.mutate(promo.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="assignments" className="mt-4">
          {loadingAssignments ? (
            <p className="text-muted-foreground">Chargement...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Code</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments?.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{new Date(a.assigned_at).toLocaleString("fr-FR")}</TableCell>
                    <TableCell>{a.email}</TableCell>
                    <TableCell className="font-mono">{a.promo_codes?.code || "-"}</TableCell>
                  </TableRow>
                ))}
                {(!assignments || assignments.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Aucune attribution
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="emails" className="mt-4">
          {loadingLogs ? (
            <p className="text-muted-foreground">Chargement...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Destinataire</TableHead>
                  <TableHead>Sujet</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emailLogs?.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{new Date(log.created_at).toLocaleString("fr-FR")}</TableCell>
                    <TableCell>{log.recipient_email}</TableCell>
                    <TableCell className="max-w-xs truncate">{log.subject}</TableCell>
                    <TableCell className="font-mono">{log.metadata?.promo_code_masked || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={log.status === "sent" ? "default" : "destructive"}>
                        {log.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {(!emailLogs || emailLogs.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Aucun email envoyé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

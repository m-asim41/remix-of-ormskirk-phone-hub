import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  EmptyState,
  Money,
  PageHeader,
  Section,
  StatCard,
  TableShell,
  Td,
  Th,
} from "@/components/admin/ui";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilterPills } from "@/components/admin/ui";
import { downloadCsv } from "@/lib/admin/csv";
import { daysInStock, money, penceToPounds, ukDate } from "@/lib/admin/money";
import { reportsQuery } from "@/lib/admin/queries";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/reports")({
  component: Reports,
});

function isoDay(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().slice(0, 10);
}

function Reports() {
  const [preset, setPreset] = useState<"7" | "30" | "90" | "custom">("30");
  const [from, setFrom] = useState(isoDay(30));
  const [to, setTo] = useState(isoDay(0));

  const range = useMemo(() => {
    const start = preset === "custom" ? from : isoDay(Number(preset));
    const end = preset === "custom" ? to : isoDay(0);
    return { from: `${start}T00:00:00.000Z`, to: `${end}T23:59:59.999Z` };
  }, [preset, from, to]);

  const { data, isLoading } = useQuery(reportsQuery(range.from, range.to));
  const [exporting, setExporting] = useState<string | null>(null);

  async function runExport(kind: "invoices" | "payments" | "stock") {
    setExporting(kind);
    try {
      const stamp = range.from.slice(0, 10);
      if (kind === "invoices") {
        const { data, error } = await supabase
          .from("invoices")
          .select(
            "invoice_number,kind,status,payment_status,subtotal_pence,discount_pence,total_pence,amount_paid_pence,balance_pence,refunded_pence,created_at",
          )
          .gte("created_at", range.from)
          .lte("created_at", range.to)
          .order("created_at");
        if (error) throw error;
        downloadCsv(
          `invoices-${stamp}.csv`,
          [
            "Invoice", "Type", "Status", "Payment status", "Subtotal (£)", "Discount (£)",
            "Total (£)", "Paid (£)", "Balance (£)", "Refunded (£)", "Date",
          ],
          (data ?? []).map((i) => [
            i.invoice_number, i.kind, i.status, i.payment_status,
            penceToPounds(i.subtotal_pence), penceToPounds(i.discount_pence),
            penceToPounds(i.total_pence), penceToPounds(i.amount_paid_pence),
            penceToPounds(i.balance_pence), penceToPounds(i.refunded_pence),
            ukDate(i.created_at),
          ]),
        );
      } else if (kind === "payments") {
        const { data, error } = await supabase
          .from("payments")
          .select("amount_pence,method,direction,reference,notes,created_at,invoices(invoice_number)")
          .gte("created_at", range.from)
          .lte("created_at", range.to)
          .order("created_at");
        if (error) throw error;
        downloadCsv(
          `payments-${stamp}.csv`,
          ["Date", "Invoice", "Method", "Direction", "Amount (£)", "Reference", "Note"],
          (data ?? []).map((p) => [
            ukDate(p.created_at),
            (p.invoices as { invoice_number?: string } | null)?.invoice_number ?? "",
            p.method, p.direction, penceToPounds(p.amount_pence),
            p.reference ?? "", p.notes ?? "",
          ]),
        );
      } else {
        const { data, error } = await supabase
          .from("stock_items")
          .select(
            "sku,brand,model,imei,storage,colour,network,condition,battery_health,purchase_cost_pence,selling_price_pence,status,source,created_at",
          )
          .order("created_at", { ascending: false });
        if (error) throw error;
        downloadCsv(
          `stock-${stamp}.csv`,
          [
            "SKU", "Brand", "Model", "IMEI", "Storage", "Colour", "Network", "Condition",
            "Battery", "Cost (£)", "Selling (£)", "Status", "Source", "Added",
          ],
          (data ?? []).map((s) => [
            s.sku, s.brand ?? "", s.model ?? "", s.imei ?? "", s.storage ?? "",
            s.colour ?? "", s.network ?? "", s.condition ?? "", s.battery_health ?? "",
            penceToPounds(s.purchase_cost_pence),
            s.selling_price_pence == null ? "" : penceToPounds(s.selling_price_pence),
            s.status, s.source ?? "", ukDate(s.created_at),
          ]),
        );
      }
      toast.success("CSV downloaded.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed.");
    } finally {
      setExporting(null);
    }
  }

  const live = <T extends { record_status?: string }>(records: T[]) =>
    records.filter((r) => r.record_status !== "VOIDED");

  const salesLive = live(data?.sales ?? []);
  const repairsLive = live(data?.repairs ?? []);
  const purchasesLive = live(data?.purchases ?? []);

  const salesRevenue = salesLive.reduce((s, r) => s + r.total_pence, 0);
  const salesCost = salesLive.reduce((s, r) => s + r.cost_pence, 0);
  const repairRevenue = repairsLive.reduce((s, r) => s + r.total_pence, 0);
  const outstanding = repairsLive.reduce((s, r) => s + r.balance_pence, 0);
  const spentOnPhones = purchasesLive.reduce((s, r) => s + r.total_pence, 0);
  const revenue = salesRevenue + repairRevenue;
  const grossProfit = salesRevenue - salesCost + repairRevenue;

  const stock = data?.stock ?? [];
  const inStock = stock.filter((s) => s.status === "IN_STOCK");
  const stockValue = inStock.reduce((s, i) => s + i.purchase_cost_pence, 0);
  const ageBands = [
    { label: "0–30 days", test: (d: number) => d <= 30 },
    { label: "31–60 days", test: (d: number) => d > 30 && d <= 60 },
    { label: "61–90 days", test: (d: number) => d > 60 && d <= 90 },
    { label: "Over 90 days", test: (d: number) => d > 90 },
  ].map((band) => {
    const items = inStock.filter((i) => band.test(daysInStock(i.created_at)));
    return {
      label: band.label,
      count: items.length,
      value: items.reduce((s, i) => s + i.purchase_cost_pence, 0),
    };
  });

  const lowStock = (data?.products ?? []).filter(
    (p) => p.active && p.reorder_level > 0 && p.quantity <= p.reorder_level,
  );

  const topFaults = Object.entries(
    repairsLive.reduce<Record<string, { count: number; total: number }>>((acc, r) => {
      const key = r.fault.trim().toLowerCase().slice(0, 40) || "other";
      acc[key] = { count: (acc[key]?.count ?? 0) + 1, total: (acc[key]?.total ?? 0) + r.total_pence };
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8);

  const byMethod = (data?.payments ?? [])
    .filter((p) => p.direction === "IN")
    .reduce<Record<string, number>>((acc, p) => {
      acc[p.method] = (acc[p.method] ?? 0) + p.amount_pence;
      return acc;
    }, {});

  return (
    <div className="space-y-4">
      <PageHeader
        title="Reports"
        description="Revenue, profit and stock health for the period you choose."
        actions={
          <div className="flex flex-wrap gap-2">
            {(["invoices", "payments", "stock"] as const).map((kind) => (
              <Button
                key={kind}
                variant="outline"
                disabled={exporting !== null}
                onClick={() => runExport(kind)}
              >
                {exporting === kind ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Download className="mr-2 size-4" />
                )}
                {kind === "stock" ? "Stock CSV" : `${kind[0].toUpperCase()}${kind.slice(1)} CSV`}
              </Button>
            ))}
          </div>
        }
      />

      <div className="admin-card flex flex-wrap items-end gap-4 p-4">
        <FilterPills
          value={preset}
          onChange={setPreset}
          options={[
            { value: "7", label: "Last 7 days" },
            { value: "30", label: "Last 30 days" },
            { value: "90", label: "Last 90 days" },
            { value: "custom", label: "Custom" },
          ]}
        />
        {preset === "custom" && (
          <div className="flex items-end gap-2">
            <div>
              <p className="admin-label mb-1">From</p>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div>
              <p className="admin-label mb-1">To</p>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <Skeleton className="h-80 w-full" />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total revenue" value={money(revenue)} sub="Repairs plus sales" />
            <StatCard label="Gross profit" value={money(grossProfit)} sub="After stock cost" />
            <StatCard label="Spent buying phones" value={money(spentOnPhones)} />
            <StatCard label="Owed by customers" value={money(outstanding)} sub="Unpaid balances" />
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <Section title="Where the money came from">
              <TableShell>
                <tbody>
                  <tr>
                    <Td>Repairs</Td>
                    <Td className="text-right">
                      <Money pence={repairRevenue} />
                    </Td>
                  </tr>
                  <tr>
                    <Td>Phone and product sales</Td>
                    <Td className="text-right">
                      <Money pence={salesRevenue} />
                    </Td>
                  </tr>
                  <tr>
                    <Td>Cost of items sold</Td>
                    <Td className="text-right">
                      −<Money pence={salesCost} />
                    </Td>
                  </tr>
                  <tr className="bg-surface">
                    <Td className="font-extrabold">Gross profit</Td>
                    <Td className="text-right font-extrabold">
                      <Money pence={grossProfit} />
                    </Td>
                  </tr>
                </tbody>
              </TableShell>
            </Section>

            <Section title="Payments taken by method">
              {Object.keys(byMethod).length ? (
                <TableShell>
                  <tbody>
                    {Object.entries(byMethod).map(([method, amount]) => (
                      <tr key={method}>
                        <Td>{method}</Td>
                        <Td className="text-right">
                          <Money pence={amount} />
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </TableShell>
              ) : (
                <EmptyState title="No payments in this period." />
              )}
            </Section>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <Section title={`Stock ageing — ${money(stockValue)} held in ${inStock.length} phones`}>
              <TableShell>
                <thead>
                  <tr>
                    <Th>Age</Th>
                    <Th className="text-right">Phones</Th>
                    <Th className="text-right">Cost value</Th>
                  </tr>
                </thead>
                <tbody>
                  {ageBands.map((b) => (
                    <tr key={b.label}>
                      <Td>{b.label}</Td>
                      <Td className="text-right font-semibold">{b.count}</Td>
                      <Td className="text-right">
                        <Money pence={b.value} />
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </TableShell>
            </Section>

            <Section title="Most common repairs">
              {topFaults.length ? (
                <TableShell>
                  <thead>
                    <tr>
                      <Th>Fault</Th>
                      <Th className="text-right">Jobs</Th>
                      <Th className="text-right">Revenue</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {topFaults.map(([fault, v]) => (
                      <tr key={fault}>
                        <Td className="capitalize">{fault}</Td>
                        <Td className="text-right font-semibold">{v.count}</Td>
                        <Td className="text-right">
                          <Money pence={v.total} />
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </TableShell>
              ) : (
                <EmptyState title="No repairs in this period." />
              )}
            </Section>
          </div>

          <Section title="Products to reorder">
            {lowStock.length ? (
              <TableShell>
                <thead>
                  <tr>
                    <Th>Product</Th>
                    <Th className="text-right">In stock</Th>
                    <Th className="text-right">Reorder at</Th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map((p) => (
                    <tr key={p.id}>
                      <Td className="font-semibold">{p.name}</Td>
                      <Td className="text-right font-extrabold text-primary">{p.quantity}</Td>
                      <Td className="text-right text-muted-foreground">{p.reorder_level}</Td>
                    </tr>
                  ))}
                </tbody>
              </TableShell>
            ) : (
              <EmptyState title="Nothing needs reordering." />
            )}
          </Section>
        </>
      )}
    </div>
  );
}

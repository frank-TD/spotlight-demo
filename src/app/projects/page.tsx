"use client";
import { useStore } from "@/lib/store";
import AppShell from "@/components/layout/AppShell";
import { ORDER_ACTIVE, ORDER_COMPLETED } from "@/lib/mock-data";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export default function ProjectsPage() {
  const { activeRole, orderStages } = useStore();

  const completedCount = orderStages.filter(s => s.status === "accepted" || s.status === "auto_accepted").length;

  const orders = activeRole === "backer"
    ? [
        { ...ORDER_ACTIVE, completedCount, total: orderStages.length, counterpart: ORDER_ACTIVE.creator.nickname, status: "in_progress" as const },
        { ...ORDER_COMPLETED, completedCount: 5, total: 5, counterpart: ORDER_COMPLETED.creator.nickname, status: "completed" as const },
      ]
    : [
        { ...ORDER_ACTIVE, completedCount, total: orderStages.length, counterpart: ORDER_ACTIVE.backer.nickname, status: "in_progress" as const },
        { ...ORDER_COMPLETED, completedCount: 5, total: 5, counterpart: ORDER_COMPLETED.backer.nickname, status: "completed" as const },
      ];

  const STATUS_CONFIG = {
    in_progress: { label: "In Progress", cls: "bg-blue-50 text-blue-700 border-blue-200" },
    completed: { label: "Completed", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    cancelled: { label: "Cancelled", cls: "bg-muted text-muted-foreground border-border" },
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-xl font-bold text-foreground mb-1">My Projects</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {activeRole === "backer" ? "Projects you have commissioned" : "Projects you are working on"}
        </p>

        <div className="space-y-3">
          {orders.map(order => {
            const sc = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG];
            return (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <div className="bg-white border border-border rounded-xl p-5 hover:border-primary/40 transition-colors group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={cn("text-xs", sc.cls)}>{sc.label}</Badge>
                        {order.status === "in_progress" && (
                          <span className="text-xs text-amber-600 font-medium">Stage 3 pending review</span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-foreground">{order.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {activeRole === "backer" ? "Creator" : "Backer"}: {order.counterpart} · ¥{order.totalFiat.toLocaleString()}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>

                  {/* Stage progress */}
                  <div className="mt-4">
                    <div className="flex gap-1.5">
                      {Array.from({ length: order.total }).map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "flex-1 h-1.5 rounded-full",
                            i < order.completedCount ? "bg-primary" :
                            i === order.completedCount && order.status === "in_progress" ? "bg-primary/30" : "bg-border"
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {order.completedCount} / {order.total} stages complete
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}

import { Topbar } from "@/components/layout/topbar";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Zap } from "lucide-react";

export default function DashboardPage() {
  return (
    <div>
      <Topbar
        title="Dashboard"
        subtitle="Visão geral da sua prospecção"
        actions={
          <div className="flex items-center gap-2">
            <Link href="/searches/new">
              <Button size="sm">
                <Plus size={14} />
                Nova Busca
              </Button>
            </Link>
            <Button size="sm" variant="outline">
              <Zap size={14} />
              Busca Automática
            </Button>
          </div>
        }
      />
      <DashboardContent />
    </div>
  );
}

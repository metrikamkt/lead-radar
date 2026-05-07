import { Topbar } from "@/components/layout/topbar";
import { LeadsContent } from "@/components/leads/leads-content";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import Link from "next/link";

export default function LeadsPage() {
  return (
    <div>
      <Topbar
        title="Leads"
        subtitle="Todos os leads encontrados"
        actions={
          <Link href="/exports">
            <Button size="sm" variant="outline">
              <Download size={14} />
              Exportar
            </Button>
          </Link>
        }
      />
      <LeadsContent />
    </div>
  );
}

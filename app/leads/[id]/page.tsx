import { Topbar } from "@/components/layout/topbar";
import { LeadDetailContent } from "@/components/leads/lead-detail-content";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <Topbar
        title="Detalhe do Lead"
        subtitle="Análise completa e oportunidade comercial"
        actions={
          <Link href="/leads">
            <Button size="sm" variant="outline">
              <ArrowLeft size={14} />
              Voltar
            </Button>
          </Link>
        }
      />
      <LeadDetailContent id={id} />
    </div>
  );
}

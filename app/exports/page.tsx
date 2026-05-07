import { Topbar } from "@/components/layout/topbar";
import { ExportsContent } from "@/components/exports-content";

export default function ExportsPage() {
  return (
    <div>
      <Topbar title="Exportar" subtitle="Exporte seus leads para planilhas e CRMs" />
      <ExportsContent />
    </div>
  );
}

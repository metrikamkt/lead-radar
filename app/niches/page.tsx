import { Topbar } from "@/components/layout/topbar";
import { NichesContent } from "@/components/niches-content";

export default function NichesPage() {
  return (
    <div>
      <Topbar title="Nichos" subtitle="Análise por segmento de mercado" />
      <NichesContent />
    </div>
  );
}

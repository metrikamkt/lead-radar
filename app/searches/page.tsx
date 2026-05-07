import { Topbar } from "@/components/layout/topbar";
import { SearchesContent } from "@/components/searches/searches-content";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function SearchesPage() {
  return (
    <div>
      <Topbar
        title="Buscas"
        subtitle="Gerencie suas campanhas de prospecção"
        actions={
          <Link href="/searches/new">
            <Button size="sm">
              <Plus size={14} />
              Nova Busca
            </Button>
          </Link>
        }
      />
      <SearchesContent />
    </div>
  );
}

import { Topbar } from "@/components/layout/topbar";
import { NewSearchForm } from "@/components/searches/new-search-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewSearchPage() {
  return (
    <div>
      <Topbar
        title="Nova Busca"
        subtitle="Configure uma nova campanha de prospecção"
        actions={
          <Link href="/searches">
            <Button size="sm" variant="outline">
              <ArrowLeft size={14} />
              Voltar
            </Button>
          </Link>
        }
      />
      <NewSearchForm />
    </div>
  );
}

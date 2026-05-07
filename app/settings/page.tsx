import { Topbar } from "@/components/layout/topbar";
import { SettingsContent } from "@/components/settings-content";

export default function SettingsPage() {
  return (
    <div>
      <Topbar title="Configurações" subtitle="Busca automática, LGPD e preferências" />
      <SettingsContent />
    </div>
  );
}

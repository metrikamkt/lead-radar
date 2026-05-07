import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lead Radar — Prospecção Inteligente B2B",
  description: "Encontre, pontue e converta leads com sinais públicos de intenção comercial.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}>
        <Sidebar />
        <main className="ml-60 min-h-screen">{children}</main>
      </body>
    </html>
  );
}

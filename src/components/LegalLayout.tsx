import { ReactNode } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface LegalLayoutProps {
  title: string;
  updated: string;
  children: ReactNode;
}

// Legal notices are published in French only — they're filings under French
// law (LCEN, RGPD), not general UI copy, so they don't follow the rest of the
// site's FR/EN split. The one-line English notice below is the exception.
const LegalLayout = ({ title, updated, children }: LegalLayoutProps) => {
  const { language } = useLanguage();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {language === "en" && (
        <p className="mb-6 rounded-md border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
          This page is a legal notice published under French law and is only available in French.
        </p>
      )}
      <h1 className="font-serif text-3xl font-bold" style={{ fontFamily: "'Libre Baskerville', serif" }}>
        {title}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">Dernière mise à jour : {updated}</p>
      <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-foreground">
        {children}
      </div>
    </div>
  );
};

export default LegalLayout;

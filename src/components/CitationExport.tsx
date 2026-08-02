import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { degreeLabel } from "@/i18n/fields";
import { buildApaCitation, buildBibtexCitation, buildRisCitation, type CitableThesis } from "@/lib/citation";
import { Quote, Copy, Download } from "lucide-react";

interface CitationExportProps {
  thesis: CitableThesis;
}

const CitationExport = ({ thesis }: CitationExportProps) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const degree = degreeLabel(thesis.degree_type, language);

  const apa = buildApaCitation(thesis, degree);
  const bibtex = buildBibtexCitation(thesis, degree);
  const ris = buildRisCitation(thesis, degree);

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: t("detail.citeCopied") });
  };

  const download = (content: string, filename: string) => {
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Quote className="h-4 w-4" /> {t("detail.cite")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("detail.citeTitle")}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="apa">
          <TabsList>
            <TabsTrigger value="apa">APA</TabsTrigger>
            <TabsTrigger value="bibtex">BibTeX</TabsTrigger>
            <TabsTrigger value="ris">RIS (Zotero…)</TabsTrigger>
          </TabsList>

          <TabsContent value="apa" className="space-y-3">
            <pre className="whitespace-pre-wrap rounded-md border bg-muted/50 p-3 text-sm leading-relaxed">{apa}</pre>
            <Button size="sm" variant="outline" className="gap-2" onClick={() => copy(apa)}>
              <Copy className="h-3.5 w-3.5" /> {t("detail.citeCopy")}
            </Button>
          </TabsContent>

          <TabsContent value="bibtex" className="space-y-3">
            <pre className="overflow-x-auto rounded-md border bg-muted/50 p-3 font-mono text-xs leading-relaxed">{bibtex}</pre>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-2" onClick={() => copy(bibtex)}>
                <Copy className="h-3.5 w-3.5" /> {t("detail.citeCopy")}
              </Button>
              <Button size="sm" variant="outline" className="gap-2" onClick={() => download(bibtex, `${thesis.id}.bib`)}>
                <Download className="h-3.5 w-3.5" /> {t("detail.citeDownload")}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="ris" className="space-y-3">
            <p className="text-xs text-muted-foreground">{t("detail.citeRisHint")}</p>
            <pre className="overflow-x-auto rounded-md border bg-muted/50 p-3 font-mono text-xs leading-relaxed">{ris}</pre>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-2" onClick={() => copy(ris)}>
                <Copy className="h-3.5 w-3.5" /> {t("detail.citeCopy")}
              </Button>
              <Button size="sm" variant="outline" className="gap-2" onClick={() => download(ris, `${thesis.id}.ris`)}>
                <Download className="h-3.5 w-3.5" /> {t("detail.citeDownload")}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CitationExport;

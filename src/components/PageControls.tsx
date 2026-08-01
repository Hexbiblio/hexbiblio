import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { useLanguage } from "@/contexts/LanguageContext";

interface PageControlsProps {
  page: number; // 1-indexed
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

// Windows down to a handful of buttons regardless of how many pages exist —
// always the first, the last, and a run around the current page, with an
// ellipsis standing in for whatever's skipped.
function pageWindow(current: number, last: number): (number | "ellipsis")[] {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);
  const keep = new Set([1, 2, last - 1, last, current - 1, current, current + 1]);
  const sorted = [...keep].filter((p) => p >= 1 && p <= last).sort((a, b) => a - b);
  const out: (number | "ellipsis")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("ellipsis");
    out.push(p);
  });
  return out;
}

const PageControls = ({ page, pageSize, total, onPageChange }: PageControlsProps) => {
  const { language } = useLanguage();
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  if (lastPage <= 1) return null;

  const go = (e: React.MouseEvent, p: number) => {
    e.preventDefault();
    if (p < 1 || p > lastPage || p === page) return;
    onPageChange(p);
  };

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const rangeLabel = language === "fr" ? `${from}–${to} sur ${total}` : `${from}–${to} of ${total}`;

  return (
    <div className="mt-8 flex flex-col items-center gap-3">
      <p className="text-xs text-muted-foreground tabular-nums">{rangeLabel}</p>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink
              href="#"
              aria-label={language === "fr" ? "Page précédente" : "Previous page"}
              onClick={(e) => go(e, page - 1)}
              className={page === 1 ? "pointer-events-none opacity-40" : ""}
            >
              <ChevronLeft className="h-4 w-4" />
            </PaginationLink>
          </PaginationItem>

          {pageWindow(page, lastPage).map((p, i) =>
            p === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={p}>
                <PaginationLink href="#" isActive={p === page} onClick={(e) => go(e, p)}>
                  {p}
                </PaginationLink>
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <PaginationLink
              href="#"
              aria-label={language === "fr" ? "Page suivante" : "Next page"}
              onClick={(e) => go(e, page + 1)}
              className={page === lastPage ? "pointer-events-none opacity-40" : ""}
            >
              <ChevronRight className="h-4 w-4" />
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default PageControls;

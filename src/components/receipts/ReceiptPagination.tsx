import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReceiptPaginationProps {
  page: number;
  totalPages: number;
  pageNumbers: Array<number | string>;
  onPage: (page: number) => void;
  labelPrevious: string;
  labelNext: string;
}

/**
 * Pagination per the design system: bordered pill shell, emerald active page,
 * tabular alignment.
 */
export const ReceiptPagination = ({ page, totalPages, pageNumbers, onPage, labelPrevious, labelNext }: ReceiptPaginationProps) => {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-8 flex justify-center">
      <nav className="inline-flex items-center gap-1 rounded-xl border border-border bg-card p-3 shadow-sm">
        <button
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => onPage(Math.max(1, page - 1))}
          disabled={page === 1}
          aria-label={labelPrevious}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pageNumbers.map((pageNum, idx) => (
          <button
            key={idx}
            className={cn(
              "h-8 min-w-[32px] rounded-md px-1 text-sm font-medium transition-colors",
              pageNum === page
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            onClick={() => typeof pageNum === "number" && onPage(pageNum)}
            disabled={pageNum === "..."}
            aria-current={pageNum === page ? "page" : undefined}
          >
            {pageNum}
          </button>
        ))}
        <button
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => onPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          aria-label={labelNext}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
};
"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  const start = (currentPage - 1) * itemsPerPage;

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
      <p className="text-sm text-[var(--fg-muted)]">
        Showing {start + 1}–{Math.min(start + itemsPerPage, totalItems)} of {totalItems}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm font-medium text-[var(--fg-muted)] hover:bg-[var(--card-hover)] hover:text-[var(--fg)] disabled:opacity-50 disabled:pointer-events-none transition"
          aria-label="Previous page"
        >
          Previous
        </button>
        <span className="px-3 py-2 text-sm text-[var(--fg-muted)]">
          Page {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm font-medium text-[var(--fg-muted)] hover:bg-[var(--card-hover)] hover:text-[var(--fg)] disabled:opacity-50 disabled:pointer-events-none transition"
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </div>
  );
}

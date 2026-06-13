"use client";

type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

export default function Pagination({
  page,
  totalPages,
  onChange,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-3 mt-10">
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="
          px-4 py-2
          rounded-xl
          border
          disabled:opacity-40
          disabled:cursor-not-allowed
        "
      >
        ← Anterior
      </button>

      <span className="text-sm text-zinc-500">
        Página {page} de {totalPages}
      </span>

      <button
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className="
          px-4 py-2
          rounded-xl
          border
          disabled:opacity-40
          disabled:cursor-not-allowed
        "
      >
        Próxima →
      </button>
    </div>
  );
}
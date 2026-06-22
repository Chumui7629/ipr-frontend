import React from 'react';

interface DataTableProps<T> {
  headers: string[];
  data?: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
  loading?: boolean;
  emptyMessage?: string;
}

function DataTable<T>({
  headers,
  data = [],
  renderRow,
  loading = false,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="text-center py-10 font-outfit">
        <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-slate-500 font-medium">Loading records...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full border border-slate-200/80 rounded-xl shadow-sm bg-white">
      <table className="min-w-full divide-y divide-slate-100 text-left text-sm font-sans">
        <thead className="bg-slate-50/75 text-slate-500 font-bold uppercase text-[0.7rem] tracking-wider font-outfit border-b border-slate-200/50">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-6 py-4 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-600">
          {data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-12 text-center text-slate-400 font-medium font-outfit">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => renderRow(item, index))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;

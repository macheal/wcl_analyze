import React from 'react';

interface Column {
  key: string;
  label: string;
}

interface DataTableProps<T> {
  columns: Column[];
  data: T[];
  isLoading: boolean;
  keyField: keyof T;
}

const formatNumber = (value: unknown): string => {
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  return String(value);
};

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading,
  keyField,
}: DataTableProps<T>): React.ReactElement {
  const SkeletonRow: React.FC = () => (
    <tr className="border-b border-gray-700">
      {columns.map((col) => (
        <td key={col.key} className="px-4 py-3">
          <div className="h-5 bg-gray-700 rounded animate-pulse"></div>
        </td>
      ))}
    </tr>
  );

  return (
    <div className="overflow-x-auto bg-gray-800 rounded-lg">
      <table className="min-w-full text-sm text-left text-gray-300">
        <thead className="text-xs text-gray-400 uppercase bg-gray-700">
          <tr>
            {columns.map((col) => (
              <th key={col.key} scope="col" className="px-4 py-3 font-semibold">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-10 text-gray-400">
                无可用数据。
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={String(row[keyField]) || index} className="border-b border-gray-700 hover:bg-gray-600/50 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                    {formatNumber(row[col.key])}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
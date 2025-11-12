import React from 'react';

export type SortDirection = 'asc' | 'desc' | undefined;

export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  columns: Column[];
  data: T[];
  isLoading: boolean;
  keyField: keyof T;
  onSort?: (columnKey: string, direction: SortDirection) => void;
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
  onSort,
}: DataTableProps<T>): React.ReactElement {
  // 内部状态管理排序
  const [sortColumn, setSortColumn] = React.useState<string>('');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>(undefined);
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
            {columns.map((col) => {
              const isSortable = col.sortable !== false && onSort;
              
              const handleSort = () => {
                if (!isSortable) return;
                
                let newDirection: SortDirection;
                if (sortColumn !== col.key) {
                  // 点击新列时默认为升序
                  newDirection = 'asc';
                } else {
                  // 点击已排序的列时切换排序方向
                  newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
                }
                
                // 先调用onSort回调，确保数据排序正确
                onSort!(col.key, newDirection);
                
                // 然后更新组件内部状态，用于UI显示
                setSortColumn(col.key);
                setSortDirection(newDirection);
              };
              
              return (
                <th 
                  key={col.key} 
                  scope="col" 
                  className={`px-4 py-3 font-semibold ${isSortable ? 'cursor-pointer hover:text-white' : ''}`}
                  onClick={isSortable ? handleSort : undefined}
                >
                  <span className="inline-flex items-center">
                    {col.label}
                    {isSortable && (
                      <span className="ml-1 text-xs">
                        {sortColumn === col.key && sortDirection === 'asc' ? '↑' : 
                         sortColumn === col.key && sortDirection === 'desc' ? '↓' : ''}
                      </span>
                    )}
                  </span>
                </th>
              );
            })}
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
              <tr key={row[keyField] !== undefined && row[keyField] !== null ? String(row[keyField]) : index} className="border-b border-gray-700 hover:bg-gray-600/50 transition-colors">
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
// components/Table.tsx
import React from 'react';

// Fix: Export TableColumn interface
export interface TableColumn<T> {
  key: keyof T | 'actions';
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  className?: string;
}

export const Table = <T extends object>({
  data,
  columns,
  keyExtractor,
  emptyMessage = 'No data available',
  className = '',
}: TableProps<T>): React.ReactElement => {
  return (
    <div className={`overflow-x-auto bg-card dark:bg-slate-800 rounded-lg shadow-md ${className}`}>
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-700">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-textSecondary dark:text-slate-400 uppercase tracking-wider ${column.className || ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-4 whitespace-nowrap text-center text-sm text-textSecondary dark:text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={keyExtractor(item)}>
                {columns.map((column) => (
                  <td
                    key={`${keyExtractor(item)}-${String(column.key)}`}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-textPrimary dark:text-slate-300 ${column.className || ''}`}
                  >
                    {column.render ? column.render(item) : (item as any)[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

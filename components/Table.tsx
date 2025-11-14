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
    <div className={`overflow-x-auto bg-card rounded-lg shadow-md ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={keyExtractor(item)}>
                {columns.map((column) => (
                  <td
                    key={`${keyExtractor(item)}-${String(column.key)}`}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${column.className || ''}`}
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
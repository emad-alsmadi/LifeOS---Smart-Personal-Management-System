import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';
import { Badge } from './badge';
import Button from './Button';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  loading?: boolean;
}

const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  onEdit,
  onDelete,
  loading = false,
}) => {
  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'completed':
        return 'default';
      case 'paused':
        return 'warning';
      case 'next':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="h-12 bg-gray-200 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
    >
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className="font-semibold">
                {column.label}
              </TableHead>
            ))}
            {(onEdit || onDelete) && (
              <TableHead className="w-[50px]">
                <span className="sr-only">Actions</span>
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="text-center py-8">
                <div className="text-gray-500">
                  <p className="text-lg font-medium">No data found</p>
                  <p className="text-sm">Get started by creating your first item.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow
                key={row.id || index}
                className="hover:bg-gray-50 transition-colors"
              >
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    {column.render ? (
                      column.render(row[column.key], row)
                    ) : column.key === 'status' ? (
                      <Badge variant={getStatusBadgeVariant(row[column.key])}>
                        {row[column.key]}
                      </Badge>
                    ) : column.key === 'priority' ? (
                      <Badge variant={getPriorityBadgeVariant(row[column.key])}>
                        {row[column.key]}
                      </Badge>
                    ) : (
                      <span className="text-gray-900">{row[column.key]}</span>
                    )}
                  </TableCell>
                ))}
                {(onEdit || onDelete) && (
                  <TableCell>
                    <div className="flex space-x-1">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            console.log('Edit clicked in DataTable for:', row);
                            onEdit(row);
                          }}
                          className="h-8 px-2 text-xs hover:bg-blue-100 text-blue-600 border border-blue-200"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            console.log('Delete clicked in DataTable for:', row);
                            onDelete(row);
                          }}
                          className="h-8 px-2 text-xs hover:bg-red-100 text-red-600 border border-red-200"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </motion.div>
  );
};

export default DataTable;
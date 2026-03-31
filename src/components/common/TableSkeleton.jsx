import React from 'react';
import { TableRow, TableCell, Skeleton } from '@mui/material';

/**
 * TableSkeleton — Renders animated skeleton rows for table loading states.
 *
 * Usage:
 *   <TableSkeleton columns={6} rows={5} />
 */
const TableSkeleton = ({ columns = 5, rows = 5 }) => (
  <>
    {Array.from({ length: rows }).map((_, rowIdx) => (
      <TableRow key={rowIdx}>
        {Array.from({ length: columns }).map((_, colIdx) => (
          <TableCell key={colIdx} sx={{ py: 1.5 }}>
            <Skeleton
              variant="text"
              animation="wave"
              width={colIdx === 0 ? '70%' : '50%'}
              height={20}
            />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);

export default TableSkeleton;

import React from 'react';
import { render } from '@testing-library/react';
import { Table, TableBody } from '@mui/material';
import TableSkeleton from '../../components/common/TableSkeleton';

const renderSkeleton = (props) =>
  render(
    <Table>
      <TableBody>
        <TableSkeleton {...props} />
      </TableBody>
    </Table>
  );

describe('TableSkeleton', () => {
  it('renders default 5 rows x 5 columns', () => {
    renderSkeleton({});
    const rows = document.querySelectorAll('tr');
    expect(rows.length).toBe(5);
    // Each row has 5 cells
    const cells = document.querySelectorAll('td');
    expect(cells.length).toBe(25);
  });

  it('renders specified rows and columns', () => {
    renderSkeleton({ rows: 3, columns: 4 });
    const rows = document.querySelectorAll('tr');
    expect(rows.length).toBe(3);
    const cells = document.querySelectorAll('td');
    expect(cells.length).toBe(12);
  });

  it('renders skeleton animations', () => {
    renderSkeleton({ rows: 1, columns: 2 });
    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBe(2);
  });
});

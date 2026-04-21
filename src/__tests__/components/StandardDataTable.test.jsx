import React from 'react';
import { renderWithProviders, screen, fireEvent } from '../../test-utils';
import StandardDataTable from '../../components/common/StandardDataTable';

describe('StandardDataTable', () => {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
  ];

  it('renders row data correctly', () => {
    renderWithProviders(
      <StandardDataTable
        columns={columns}
        rows={[{ id: '1', name: 'Alice', email: 'alice@test.com' }]}
      />
    );

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('alice@test.com')).toBeInTheDocument();
  });

  it('renders empty state without crashing when rows are empty', () => {
    renderWithProviders(
      <StandardDataTable
        columns={columns}
        rows={[]}
        emptyMessage="No customers found"
      />
    );

    expect(screen.getByText('No customers found')).toBeInTheDocument();
  });

  it('fires onRowClick when a row is selected', () => {
    const onRowClick = jest.fn();

    renderWithProviders(
      <StandardDataTable
        columns={columns}
        rows={[{ id: '1', name: 'Alice', email: 'alice@test.com' }]}
        onRowClick={onRowClick}
      />
    );

    fireEvent.click(screen.getByText('Alice'));

    expect(onRowClick).toHaveBeenCalledWith(
      { id: '1', name: 'Alice', email: 'alice@test.com' },
      0
    );
  });
});

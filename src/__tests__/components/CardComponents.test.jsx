import React from 'react';
import { renderWithProviders, screen, fireEvent } from '../../test-utils';

import BillCard from '../../components/common/BillCard';
import CustomerCard from '../../components/common/CustomerCard';
import ExpenseCard from '../../components/common/ExpenseCard';
import InvoiceCard from '../../components/common/InvoiceCard';
import ItemCard from '../../components/common/ItemCard';
import PurchaseOrderCard from '../../components/common/PurchaseOrderCard';
import QuoteCard from '../../components/common/QuoteCard';
import RecurringProfileCard from '../../components/common/RecurringProfileCard';
import SalesOrderCard from '../../components/common/SalesOrderCard';
import VendorCard from '../../components/common/VendorCard';
import ResponsiveDataView from '../../components/common/ResponsiveDataView';
import FormDatePicker from '../../components/common/FormDatePicker';

beforeEach(() => jest.clearAllMocks());

// ─── BillCard ─────────────────────────────────────────────────────────────────
describe('BillCard', () => {
  const bill = {
    id: 'b1',
    bill_number: 'BILL-001',
    payment_status: 'Unpaid',
    total_amount: 5000,
    balance_due: 5000,
    bill_date: '2026-03-01',
    due_date: '2026-03-31',
  };

  it('renders bill number and status', () => {
    renderWithProviders(
      <BillCard bill={bill} vendorName="Acme Corp" onEdit={jest.fn()} onDelete={jest.fn()} />
    );
    expect(screen.getByText('BILL-001')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    // StatusBadge maps "Unpaid" to display label "Open".
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('calls onEdit when bill number is clicked', () => {
    const onEdit = jest.fn();
    renderWithProviders(
      <BillCard bill={bill} vendorName="Acme Corp" onEdit={onEdit} onDelete={jest.fn()} />
    );
    fireEvent.click(screen.getByText('BILL-001'));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = jest.fn();
    renderWithProviders(
      <BillCard bill={bill} vendorName="Acme Corp" onEdit={jest.fn()} onDelete={onDelete} />
    );
    const deleteButton = screen.getByTestId('DeleteIcon').closest('button');
    expect(deleteButton).toBeTruthy();
    fireEvent.click(deleteButton);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('renders fallback bill number when bill_number is missing', () => {
    renderWithProviders(
      <BillCard bill={{ ...bill, bill_number: undefined }} vendorName="Acme" onEdit={jest.fn()} onDelete={jest.fn()} />
    );
    expect(screen.getByText('BILL-b1')).toBeInTheDocument();
  });

  it('renders em-dash when vendorName is absent', () => {
    renderWithProviders(
      <BillCard bill={bill} onEdit={jest.fn()} onDelete={jest.fn()} />
    );
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});

// ─── CustomerCard ─────────────────────────────────────────────────────────────
describe('CustomerCard', () => {
  // CustomerCard uses customer.name (not display_name) and onClick (not onEdit) for the name click
  const customer = {
    id: 'c1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '9876543210',
    status: 'Active',
  };

  it('renders customer name and email', () => {
    renderWithProviders(
      <CustomerCard customer={customer} onClick={jest.fn()} onEdit={jest.fn()} onDelete={jest.fn()} />
    );
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('calls onClick when name is clicked', () => {
    const onClick = jest.fn();
    renderWithProviders(
      <CustomerCard customer={customer} onClick={onClick} onEdit={jest.fn()} onDelete={jest.fn()} />
    );
    fireEvent.click(screen.getByText('John Doe'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onEdit when edit button pressed', () => {
    const onEdit = jest.fn();
    renderWithProviders(
      <CustomerCard customer={customer} onClick={jest.fn()} onEdit={onEdit} onDelete={jest.fn()} />
    );
    // Edit is the first icon button in the action row
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});

// ─── ExpenseCard ──────────────────────────────────────────────────────────────
describe('ExpenseCard', () => {
  // ExpenseCard uses expense.vendor_name for the header, expense.category as badge
  const expense = {
    id: 'e1',
    vendor_name: 'Travel Co',
    category: 'Travel',
    amount: 1500,
    date: '2026-03-10',
  };

  it('renders vendor name and category', () => {
    renderWithProviders(
      <ExpenseCard expense={expense} onEdit={jest.fn()} onDelete={jest.fn()} />
    );
    expect(screen.getByText('Travel Co')).toBeInTheDocument();
    expect(screen.getByText('Travel')).toBeInTheDocument();
  });

  it('calls onDelete when delete button clicked', () => {
    const onDelete = jest.fn();
    renderWithProviders(
      <ExpenseCard expense={expense} onEdit={jest.fn()} onDelete={onDelete} />
    );
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[buttons.length - 1]);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('renders notes when provided', () => {
    renderWithProviders(
      <ExpenseCard expense={{ ...expense, notes: 'Team lunch' }} onEdit={jest.fn()} onDelete={jest.fn()} />
    );
    expect(screen.getByText('Team lunch')).toBeInTheDocument();
  });
});

// ─── InvoiceCard ──────────────────────────────────────────────────────────────
describe('InvoiceCard', () => {
  // InvoiceCard takes customerName as a separate prop (resolved by parent)
  const invoice = {
    id: 'inv1',
    invoice_number: 'INV-001',
    total_amount: 10000,
    balance_due: 5000,
    invoice_date: '2026-03-01',
    due_date: '2026-03-31',
    status: 'Partial',
  };

  it('renders invoice number and customer name', () => {
    renderWithProviders(
      <InvoiceCard invoice={invoice} customerName="Jane Doe" onEdit={jest.fn()} onActionMenu={jest.fn()} />
    );
    expect(screen.getByText('INV-001')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('calls onEdit when invoice number clicked', () => {
    const onEdit = jest.fn();
    renderWithProviders(
      <InvoiceCard invoice={invoice} customerName="Jane Doe" onEdit={onEdit} onActionMenu={jest.fn()} />
    );
    fireEvent.click(screen.getByText('INV-001'));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});

// ─── ItemCard ─────────────────────────────────────────────────────────────────
describe('ItemCard', () => {
  const product = {
    id: 'p1',
    name: 'Widget Pro',
    sku: 'WP-001',
    unit_price: 499,
    stock_quantity: 20,
    category: 'Electronics',
    hsn_sac: '8471',
  };

  it('renders product name', () => {
    renderWithProviders(
      <ItemCard product={product} onEdit={jest.fn()} onDelete={jest.fn()} />
    );
    expect(screen.getByText('Widget Pro')).toBeInTheDocument();
  });

  it('calls onEdit when name clicked', () => {
    const onEdit = jest.fn();
    renderWithProviders(
      <ItemCard product={product} onEdit={onEdit} onDelete={jest.fn()} />
    );
    fireEvent.click(screen.getByText('Widget Pro'));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('shows restock button if onRestock provided', () => {
    const onRestock = jest.fn();
    renderWithProviders(
      <ItemCard product={product} onEdit={jest.fn()} onDelete={jest.fn()} onRestock={onRestock} />
    );
    // With onRestock: buttons order is add-stock(0), edit(1), restock(2), delete(3)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(4);
    fireEvent.click(buttons[2]);
    expect(onRestock).toHaveBeenCalledTimes(1);
  });

  it('hides restock button when onRestock not provided', () => {
    renderWithProviders(
      <ItemCard product={product} onEdit={jest.fn()} onDelete={jest.fn()} />
    );
    // Without onRestock: add-stock, edit, and delete buttons
    expect(screen.getAllByRole('button').length).toBe(3);
  });
});

// ─── PurchaseOrderCard ────────────────────────────────────────────────────────
describe('PurchaseOrderCard', () => {
  // PurchaseOrderCard takes vendorName as a separate resolved prop
  const po = {
    id: 'po1',
    po_number: 'PO-001',
    total_amount: 8000,
    status: 'Pending',
    po_date: '2026-03-05',
    expected_delivery: '2026-03-20',
  };

  it('renders PO number and vendor', () => {
    renderWithProviders(
      <PurchaseOrderCard po={po} vendorName="Supplier Ltd" onEdit={jest.fn()} onDelete={jest.fn()} />
    );
    expect(screen.getByText('PO-001')).toBeInTheDocument();
    expect(screen.getByText('Supplier Ltd')).toBeInTheDocument();
  });

  it('calls onEdit when PO number clicked', () => {
    const onEdit = jest.fn();
    renderWithProviders(
      <PurchaseOrderCard po={po} vendorName="Supplier Ltd" onEdit={onEdit} onDelete={jest.fn()} />
    );
    fireEvent.click(screen.getByText('PO-001'));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});

// ─── QuoteCard ────────────────────────────────────────────────────────────────
describe('QuoteCard', () => {
  // QuoteCard takes customerName as a separate resolved prop
  const quote = {
    id: 'q1',
    quote_number: 'QT-001',
    total_amount: 12000,
    status: 'Sent',
    quote_date: '2026-03-01',
    expiry_date: '2026-04-01',
  };

  it('renders quote number and customer', () => {
    renderWithProviders(
      <QuoteCard quote={quote} customerName="Alice Corp" onEdit={jest.fn()} onActionMenu={jest.fn()} />
    );
    expect(screen.getByText('QT-001')).toBeInTheDocument();
    expect(screen.getByText('Alice Corp')).toBeInTheDocument();
  });

  it('calls onEdit when quote number clicked', () => {
    const onEdit = jest.fn();
    renderWithProviders(
      <QuoteCard quote={quote} customerName="Alice Corp" onEdit={onEdit} onActionMenu={jest.fn()} />
    );
    fireEvent.click(screen.getByText('QT-001'));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});

// ─── RecurringProfileCard ─────────────────────────────────────────────────────
describe('RecurringProfileCard', () => {
  // RecurringProfileCard uses profile.profile_name and customerName as separate prop
  const profile = {
    id: 'rp1',
    profile_name: 'Monthly Retainer',
    frequency: 'Monthly',
    amount: 5000,
    next_invoice_date: '2026-04-01',
    status: 'Active',
  };

  it('renders profile name', () => {
    renderWithProviders(
      <RecurringProfileCard profile={profile} customerName="Bob Ltd" onEdit={jest.fn()} onActionMenu={jest.fn()} />
    );
    expect(screen.getByText('Monthly Retainer')).toBeInTheDocument();
    expect(screen.getByText('Bob Ltd')).toBeInTheDocument();
  });

  it('calls onEdit when edit button clicked', () => {
    const onEdit = jest.fn();
    renderWithProviders(
      <RecurringProfileCard profile={profile} customerName="Bob Ltd" onEdit={onEdit} onActionMenu={jest.fn()} />
    );
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});

// ─── SalesOrderCard ───────────────────────────────────────────────────────────
describe('SalesOrderCard', () => {
  // SalesOrderCard takes salesOrder prop and customerName as a separate resolved prop
  const salesOrder = {
    id: 'so1',
    so_number: 'SO-001',
    total_amount: 7500,
    status: 'Confirmed',
    order_date: '2026-03-10',
  };

  it('renders SO number and customer', () => {
    renderWithProviders(
      <SalesOrderCard salesOrder={salesOrder} customerName="Charlie Inc" onEdit={jest.fn()} onActionMenu={jest.fn()} />
    );
    expect(screen.getByText('SO-001')).toBeInTheDocument();
    expect(screen.getByText('Charlie Inc')).toBeInTheDocument();
  });

  it('calls onEdit when edit button clicked', () => {
    const onEdit = jest.fn();
    renderWithProviders(
      <SalesOrderCard salesOrder={salesOrder} customerName="Charlie Inc" onEdit={onEdit} onActionMenu={jest.fn()} />
    );
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});

// ─── VendorCard ───────────────────────────────────────────────────────────────
describe('VendorCard', () => {
  // VendorCard uses vendor.vendor_name (not display_name)
  const vendor = {
    id: 'v1',
    vendor_name: 'Delta Supplies',
    email: 'delta@example.com',
    phone: '9000000001',
    status: 'Active',
  };

  it('renders vendor name and email', () => {
    renderWithProviders(
      <VendorCard vendor={vendor} onEdit={jest.fn()} onDelete={jest.fn()} />
    );
    expect(screen.getByText('Delta Supplies')).toBeInTheDocument();
    expect(screen.getByText('delta@example.com')).toBeInTheDocument();
  });

  it('calls onEdit when edit button clicked', () => {
    const onEdit = jest.fn();
    renderWithProviders(
      <VendorCard vendor={vendor} onEdit={onEdit} onDelete={jest.fn()} />
    );
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});

// ─── ResponsiveDataView ───────────────────────────────────────────────────────
describe('ResponsiveDataView', () => {
  const columns = [{ field: 'name', headerName: 'Name', flex: 1 }];
  const rows = [{ id: '1', name: 'Test Row' }];

  it('renders StandardDataTable on desktop (isMobile=false)', () => {
    renderWithProviders(
      <ResponsiveDataView
        isMobile={false}
        rows={rows}
        columns={columns}
        loading={false}
      />
    );
    // StandardDataTable renders — no crash
    expect(document.body).toBeInTheDocument();
  });

  it('renders card view on mobile (isMobile=true)', () => {
    renderWithProviders(
      <ResponsiveDataView
        isMobile={true}
        rows={rows}
        columns={columns}
        loading={false}
        renderCard={(item) => <div key={item.id}>{item.name}</div>}
        pagination={{ count: 1, page: 0, rowsPerPage: 10, onPageChange: jest.fn(), onRowsPerPageChange: jest.fn() }}
      />
    );
    expect(screen.getByText('Test Row')).toBeInTheDocument();
  });

  it('renders skeleton cards when loading on mobile', () => {
    renderWithProviders(
      <ResponsiveDataView
        isMobile={true}
        rows={[]}
        columns={columns}
        loading={true}
        skeletonRows={2}
        renderCard={(item) => <div>{item.name}</div>}
      />
    );
    // Skeleton renders without crash
    expect(document.body).toBeInTheDocument();
  });

  it('renders empty state when no rows on mobile', () => {
    renderWithProviders(
      <ResponsiveDataView
        isMobile={true}
        rows={[]}
        columns={columns}
        loading={false}
        emptyTitle="No data"
        emptySubtitle="Nothing here"
        renderCard={(item) => <div>{item.name}</div>}
      />
    );
    expect(screen.getByText('No data')).toBeInTheDocument();
  });
});

// ─── FormDatePicker ───────────────────────────────────────────────────────────
describe('FormDatePicker', () => {
  it('renders label and date input', () => {
    renderWithProviders(
      <FormDatePicker label="Due Date" name="due_date" value="2026-03-31" onChange={jest.fn()} />
    );
    expect(screen.getByText('Due Date')).toBeInTheDocument();
  });

  it('calls onChange when value changes', () => {
    const onChange = jest.fn();
    renderWithProviders(
      <FormDatePicker label="Invoice Date" name="invoice_date" value="" onChange={onChange} />
    );
    const input = document.querySelector('input[type="date"]');
    fireEvent.change(input, { target: { value: '2026-04-01' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('applies error styling when error prop is true', () => {
    renderWithProviders(
      <FormDatePicker
        label="Date"
        name="date"
        value=""
        onChange={jest.fn()}
        error={true}
        helperText="Required"
      />
    );
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('renders required asterisk', () => {
    renderWithProviders(
      <FormDatePicker label="Start Date" name="start_date" value="" onChange={jest.fn()} required />
    );
    expect(screen.getByText('*')).toBeInTheDocument();
  });
});

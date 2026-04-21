import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SummaryCard from '../../components/common/SummaryCard';
import TabbedFormWrapper from '../../components/common/TabbedFormWrapper';
import StandardFormLayout from '../../components/common/StandardFormLayout';
import { People as PeopleIcon } from '@mui/icons-material';

const theme = createTheme();
const wrap = (ui) => render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

// ─── SummaryCard ────────────────────────────────────────────────────────────

describe('SummaryCard', () => {
  it('renders label and value', () => {
    wrap(<SummaryCard label="Total Revenue" value="$12,000" />);
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('$12,000')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    wrap(<SummaryCard label="Customers" value={10} icon={<PeopleIcon data-testid="icon" />} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders fallback dash when value is null', () => {
    wrap(<SummaryCard label="Pending" value={null} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders without icon', () => {
    wrap(<SummaryCard label="No Icon" value={0} />);
    expect(screen.getByText('No Icon')).toBeInTheDocument();
  });
});

// ─── TabbedFormWrapper ───────────────────────────────────────────────────────

describe('TabbedFormWrapper', () => {
  const tabs = [
    { value: 'details', label: 'Details' },
    { value: 'address', label: 'Address' },
  ];

  it('renders tab labels', () => {
    wrap(
      <TabbedFormWrapper tabs={tabs} value="details" onChange={jest.fn()}>
        <div>Panel content</div>
      </TabbedFormWrapper>
    );
    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
  });

  it('renders children content', () => {
    wrap(
      <TabbedFormWrapper tabs={tabs} value="details" onChange={jest.fn()}>
        <div>My Form Content</div>
      </TabbedFormWrapper>
    );
    expect(screen.getByText('My Form Content')).toBeInTheDocument();
  });

  it('renders with empty tabs array', () => {
    wrap(
      <TabbedFormWrapper tabs={[]} value="" onChange={jest.fn()}>
        <span>Empty</span>
      </TabbedFormWrapper>
    );
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });
});

// ─── StandardFormLayout ──────────────────────────────────────────────────────

describe('StandardFormLayout', () => {
  it('renders title and subtitle', () => {
    wrap(
      <StandardFormLayout title="New Invoice" subtitle="Fill in the details below">
        <div>form fields</div>
      </StandardFormLayout>
    );
    expect(screen.getByText('New Invoice')).toBeInTheDocument();
    expect(screen.getByText('Fill in the details below')).toBeInTheDocument();
  });

  it('renders children', () => {
    wrap(
      <StandardFormLayout>
        <div>Child content</div>
      </StandardFormLayout>
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('renders action buttons when provided', () => {
    wrap(
      <StandardFormLayout actions={<button>Save</button>}>
        <div>content</div>
      </StandardFormLayout>
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('renders without title or subtitle', () => {
    wrap(
      <StandardFormLayout>
        <div>Just content</div>
      </StandardFormLayout>
    );
    expect(screen.getByText('Just content')).toBeInTheDocument();
  });
});

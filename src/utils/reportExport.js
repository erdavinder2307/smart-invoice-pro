import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// ─── Shared PDF setup ────────────────────────────────────────────────────────
const createPdf = (title, subtitle) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Header bar
  doc.setFillColor(63, 81, 181); // primary blue
  doc.rect(0, 0, 210, 22, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 13);

  // Subtitle / date
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitle, 14, 19);

  // Generated timestamp (right-aligned)
  const ts = `Generated: ${new Date().toLocaleString()}`;
  doc.text(ts, 196, 19, { align: 'right' });

  doc.setTextColor(0, 0, 0);
  return doc;
};

const savePdf = (doc, filename) => {
  doc.save(filename);
};

// ─── Profit & Loss ───────────────────────────────────────────────────────────
export const exportProfitLossPDF = (data, startDate, endDate) => {
  const doc = createPdf(
    'Profit & Loss Statement',
    `Period: ${startDate} to ${endDate}`
  );

  let y = 30;

  // Summary section
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', 14, y);
  y += 2;

  autoTable(doc, {
    startY: y + 2,
    head: [['Metric', 'Amount']],
    body: [
      ['Total Revenue', `$${data.revenue.total.toLocaleString()}`],
      ['Cost of Goods Sold (COGS)', `$${data.cost_of_goods_sold.total.toLocaleString()}`],
      ['Gross Profit', `$${data.gross_profit.toLocaleString()}`],
      ['Total Expenses', `$${data.expenses.total.toLocaleString()}`],
      ['Net Profit', `$${data.net_profit.toLocaleString()}`],
      ['Net Margin', `${data.net_margin?.toFixed(1) ?? 'N/A'}%`],
    ],
    headStyles: { fillColor: [63, 81, 181] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  // Revenue breakdown
  if (data.revenue.by_category && Object.keys(data.revenue.by_category).length > 0) {
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 8,
      head: [['Revenue by Category', 'Amount']],
      body: Object.entries(data.revenue.by_category).map(([cat, amt]) => [cat, `$${amt.toLocaleString()}`]),
      headStyles: { fillColor: [76, 175, 80] },
    });
  }

  // Expense breakdown
  if (data.expenses.by_category && Object.keys(data.expenses.by_category).length > 0) {
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 8,
      head: [['Expenses by Category', 'Amount']],
      body: Object.entries(data.expenses.by_category).map(([cat, amt]) => [cat, `$${amt.toLocaleString()}`]),
      headStyles: { fillColor: [244, 67, 54] },
    });
  }

  savePdf(doc, `profit-loss-${startDate}-to-${endDate}.pdf`);
};

export const exportProfitLossExcel = (data, startDate, endDate) => {
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryRows = [
    ['Profit & Loss Statement'],
    [`Period: ${startDate} to ${endDate}`],
    [`Generated: ${new Date().toLocaleString()}`],
    [],
    ['Metric', 'Amount'],
    ['Total Revenue', data.revenue.total],
    ['COGS', data.cost_of_goods_sold.total],
    ['Gross Profit', data.gross_profit],
    ['Total Expenses', data.expenses.total],
    ['Net Profit', data.net_profit],
    ['Net Margin %', data.net_margin ?? ''],
  ];

  if (data.revenue.by_category) {
    summaryRows.push([], ['Revenue Breakdown'], ['Category', 'Amount']);
    Object.entries(data.revenue.by_category).forEach(([cat, amt]) => summaryRows.push([cat, amt]));
  }

  if (data.expenses.by_category) {
    summaryRows.push([], ['Expense Breakdown'], ['Category', 'Amount']);
    Object.entries(data.expenses.by_category).forEach(([cat, amt]) => summaryRows.push([cat, amt]));
  }

  const ws = XLSX.utils.aoa_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, ws, 'Profit & Loss');
  XLSX.writeFile(wb, `profit-loss-${startDate}-to-${endDate}.xlsx`);
};

// ─── A/R Aging ───────────────────────────────────────────────────────────────
export const exportARAgingPDF = (data, asOfDate) => {
  const doc = createPdf('A/R Aging Report', `As of: ${asOfDate}`);

  // Aging summary table
  autoTable(doc, {
    startY: 30,
    head: [['Age Bracket', 'Count', 'Total Amount', '% of Total']],
    body: Object.entries(data.aging_buckets).map(([bucket, d]) => {
      const pct = data.total_outstanding > 0
        ? ((d.total / data.total_outstanding) * 100).toFixed(1)
        : '0.0';
      return [
        bucket === 'current' ? 'Current' : `${bucket} Days`,
        d.count,
        `$${d.total.toLocaleString()}`,
        `${pct}%`,
      ];
    }),
    foot: [['Total', data.total_invoices, `$${data.total_outstanding.toLocaleString()}`, '100%']],
    headStyles: { fillColor: [63, 81, 181] },
    footStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  // Customer summary
  if (data.customer_summary?.length > 0) {
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 8,
      head: [['Customer', 'Outstanding Balance']],
      body: data.customer_summary.slice(0, 20).map(c => [
        c.customer_name,
        `$${c.total_outstanding.toLocaleString()}`,
      ]),
      headStyles: { fillColor: [255, 152, 0] },
    });
  }

  savePdf(doc, `ar-aging-${asOfDate}.pdf`);
};

export const exportARAgingExcel = (data, asOfDate) => {
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryRows = [
    ['A/R Aging Report'],
    [`As of: ${asOfDate}`],
    [`Generated: ${new Date().toLocaleString()}`],
    [],
    ['Age Bracket', 'Count', 'Total Amount', '% of Total'],
    ...Object.entries(data.aging_buckets).map(([bucket, d]) => {
      const pct = data.total_outstanding > 0
        ? ((d.total / data.total_outstanding) * 100).toFixed(1)
        : '0.0';
      return [bucket === 'current' ? 'Current' : `${bucket} Days`, d.count, d.total, `${pct}%`];
    }),
    ['Total', data.total_invoices, data.total_outstanding, '100%'],
  ];

  const ws1 = XLSX.utils.aoa_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, ws1, 'Aging Summary');

  // Customer sheet
  if (data.customer_summary?.length > 0) {
    const custRows = [
      ['Customer', 'Outstanding Balance'],
      ...data.customer_summary.map(c => [c.customer_name, c.total_outstanding]),
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(custRows);
    XLSX.utils.book_append_sheet(wb, ws2, 'Customer Summary');
  }

  // Invoice detail sheets per bucket
  Object.entries(data.aging_buckets).forEach(([bucket, d]) => {
    if (d.invoices?.length > 0) {
      const rows = [
        ['Invoice #', 'Customer', 'Issue Date', 'Due Date', 'Days Overdue', 'Balance Due'],
        ...d.invoices.map(inv => [
          inv.invoice_number,
          inv.customer_name,
          inv.issue_date,
          inv.due_date,
          inv.days_overdue,
          inv.balance_due,
        ]),
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, bucket === 'current' ? 'Current' : `${bucket} Days`);
    }
  });

  XLSX.writeFile(wb, `ar-aging-${asOfDate}.xlsx`);
};

// ─── Balance Sheet ───────────────────────────────────────────────────────────
export const exportBalanceSheetPDF = (data, asOfDate) => {
  const doc = createPdf('Balance Sheet', `As of: ${asOfDate}`);

  autoTable(doc, {
    startY: 30,
    head: [['ASSETS', 'Amount']],
    body: [
      ['Cash', `$${data.assets.cash.toLocaleString()}`],
      ['Accounts Receivable', `$${data.assets.accounts_receivable.toLocaleString()}`],
      ['Inventory', `$${data.assets.inventory.toLocaleString()}`],
      ['Total Assets', `$${data.assets.total.toLocaleString()}`],
    ],
    headStyles: { fillColor: [33, 150, 243] },
    bodyStyles: {},
    didParseCell: (hookData) => {
      if (hookData.row.index === 3) {
        hookData.cell.styles.fontStyle = 'bold';
        hookData.cell.styles.fillColor = [227, 242, 253];
      }
    },
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 6,
    head: [['LIABILITIES', 'Amount']],
    body: [
      ['Accounts Payable', `$${data.liabilities.accounts_payable.toLocaleString()}`],
      ['Total Liabilities', `$${data.liabilities.total.toLocaleString()}`],
    ],
    headStyles: { fillColor: [255, 152, 0] },
    didParseCell: (hookData) => {
      if (hookData.row.index === 1) {
        hookData.cell.styles.fontStyle = 'bold';
        hookData.cell.styles.fillColor = [255, 243, 224];
      }
    },
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 6,
    head: [['EQUITY', 'Amount']],
    body: [
      ['Retained Earnings', `$${data.equity.retained_earnings.toLocaleString()}`],
      ['Total Equity', `$${data.equity.total.toLocaleString()}`],
    ],
    headStyles: { fillColor: [76, 175, 80] },
    didParseCell: (hookData) => {
      if (hookData.row.index === 1) {
        hookData.cell.styles.fontStyle = 'bold';
        hookData.cell.styles.fillColor = [232, 245, 233];
      }
    },
  });

  savePdf(doc, `balance-sheet-${asOfDate}.pdf`);
};

export const exportBalanceSheetExcel = (data, asOfDate) => {
  const wb = XLSX.utils.book_new();

  const rows = [
    ['Balance Sheet'],
    [`As of: ${asOfDate}`],
    [`Generated: ${new Date().toLocaleString()}`],
    [],
    ['ASSETS', ''],
    ['Cash', data.assets.cash],
    ['Accounts Receivable', data.assets.accounts_receivable],
    ['Inventory', data.assets.inventory],
    ['Total Assets', data.assets.total],
    [],
    ['LIABILITIES', ''],
    ['Accounts Payable', data.liabilities.accounts_payable],
    ['Total Liabilities', data.liabilities.total],
    [],
    ['EQUITY', ''],
    ['Retained Earnings', data.equity.retained_earnings],
    ['Total Equity', data.equity.total],
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Balance Sheet');
  XLSX.writeFile(wb, `balance-sheet-${asOfDate}.xlsx`);
};

// ─── Cash Flow ───────────────────────────────────────────────────────────────
export const exportCashFlowPDF = (data, startDate, endDate) => {
  const doc = createPdf('Cash Flow Statement', `Period: ${startDate} to ${endDate}`);

  autoTable(doc, {
    startY: 30,
    head: [['Operating Activities', 'Amount']],
    body: [
      ['Cash Received from Customers', `$${data.operating_activities.cash_received_from_customers.toLocaleString()}`],
      ['Cash Paid for Expenses', `($${data.operating_activities.cash_paid_for_expenses.toLocaleString()})`],
      ['Cash Paid to Suppliers', `($${data.operating_activities.cash_paid_to_suppliers.toLocaleString()})`],
      ['Net Cash from Operating Activities', `$${data.operating_activities.net_cash_from_operating.toLocaleString()}`],
    ],
    headStyles: { fillColor: [63, 81, 181] },
    didParseCell: (hookData) => {
      if (hookData.row.index === 3) {
        hookData.cell.styles.fontStyle = 'bold';
        hookData.cell.styles.fillColor = [232, 234, 246];
      }
    },
  });

  savePdf(doc, `cash-flow-${startDate}-to-${endDate}.pdf`);
};

export const exportCashFlowExcel = (data, startDate, endDate) => {
  const wb = XLSX.utils.book_new();

  const rows = [
    ['Cash Flow Statement'],
    [`Period: ${startDate} to ${endDate}`],
    [`Generated: ${new Date().toLocaleString()}`],
    [],
    ['Operating Activities', 'Amount'],
    ['Cash Received from Customers', data.operating_activities.cash_received_from_customers],
    ['Cash Paid for Expenses', -data.operating_activities.cash_paid_for_expenses],
    ['Cash Paid to Suppliers', -data.operating_activities.cash_paid_to_suppliers],
    ['Net Cash from Operating Activities', data.operating_activities.net_cash_from_operating],
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Cash Flow');
  XLSX.writeFile(wb, `cash-flow-${startDate}-to-${endDate}.xlsx`);
};

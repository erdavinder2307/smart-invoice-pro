const FIRST_NAMES = ["Aarav", "Isha", "Rohan", "Meera", "Arjun", "Kavya", "Neel", "Diya"];
const LAST_NAMES = ["Sharma", "Patel", "Reddy", "Gupta", "Kapoor", "Nair", "Joshi", "Mehta"];
const CITIES = ["Mumbai", "Delhi", "Bengaluru", "Pune", "Chennai", "Ahmedabad", "Hyderabad"];
const CATEGORIES = ["Electronics", "Office Supplies", "Software", "FMCG", "Services"];
const PAYMENT_TERMS = ["Due on Receipt", "Net 15", "Net 30", "Net 45"];

const pick = (arr, fallback = "") => (Array.isArray(arr) && arr.length ? arr[Math.floor(Math.random() * arr.length)] : fallback);
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const today = () => new Date().toISOString().slice(0, 10);
const plusDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const makeName = () => `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
const makeCompany = () => `${pick(LAST_NAMES)} ${pick(["Industries", "Solutions", "Traders", "Technologies"])}`;
const makeEmail = (seed) => `${String(seed || "user").toLowerCase().replace(/\s+/g, ".")}${rnd(10, 999)}@example.com`;
const makePhone = () => `9${rnd(100000000, 999999999)}`;
const makeGSTIN = () => {
  const state = String(rnd(10, 37)).padStart(2, "0");
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const alpha = () => letters[rnd(0, 25)];
  const pan = `${alpha()}${alpha()}${alpha()}${alpha()}${alpha()}${rnd(1000, 9999)}${alpha()}`;
  return `${state}${pan}${rnd(1, 9)}Z${alpha()}`;
};

export const generateCustomerMockData = ({ scenario = "full" } = {}) => {
  const fullName = makeName();
  const first = fullName.split(" ")[0];
  const last = fullName.split(" ").slice(1).join(" ") || pick(LAST_NAMES);
  const company = makeCompany();
  const city = pick(CITIES);
  const zip = `${rnd(100000, 999999)}`;
  const gstNumber = makeGSTIN();
  const pan = gstNumber.slice(2, 12);

  if (scenario === "minimal") {
    return {
      customer_type: "business",
      salutation: "Mr.",
      first_name: first,
      last_name: last,
      company_name: company,
      display_name: company,
      email: makeEmail(company),
      work_phone_code: "+91",
      phone: makePhone(),
    };
  }

  return {
    customer_type: "business",
    salutation: "Mr.",
    first_name: first,
    last_name: last,
    company_name: company,
    display_name: company,
    email: makeEmail(company),
    work_phone_code: "+91",
    phone: makePhone(),
    mobile_code: "+91",
    mobile: makePhone(),
    gst_number: gstNumber,
    pan,
    gst_treatment: "regular",
    place_of_supply: "Maharashtra",
    language: "en",
    comm_email: true,
    comm_sms: false,
    billing_country: "India",
    billing_attention: `${first} ${last}`,
    billing_city: city,
    billing_state: "Maharashtra",
    billing_zip: zip,
    billing_street: `${rnd(10, 99)} Business Park Road`,
    billing_street2: `Suite ${rnd(100, 999)}`,
    shipping_country: "India",
    shipping_attention: `${first} ${last}`,
    shipping_city: city,
    shipping_state: "Maharashtra",
    shipping_zip: zip,
    shipping_street: `${rnd(10, 99)} Warehouse Street`,
    shipping_street2: `Block ${rnd(1, 9)}`,
    payment_terms: "net_30",
    tax_preference: "taxable",
    website_url: `https://${company.toLowerCase().replace(/\s+/g, "-")}.example.com`,
    department: "Finance",
    designation: "Accounts Lead",
    portal_enabled: true,
    contact_persons: [
      {
        salutation: "Ms.",
        first_name: first,
        last_name: last,
        email: makeEmail(`${company}.contact`),
        phone: makePhone(),
        mobile: makePhone(),
        designation: "Accounts Manager",
      },
    ],
    custom_fields: {
      customer_segment: "Enterprise",
      internal_owner: pick(FIRST_NAMES),
    },
    reporting_tags: "VIP, Monthly Billing",
    remarks: scenario === "edge" ? "Requires manual approval for large orders." : "Prefers invoices with PO references.",
  };
};

export const generateVendorMockData = ({ scenario = "full" } = {}) => {
  const name = makeCompany();
  const contactPerson = makeName();
  const localPart = contactPerson.toLowerCase().replace(/\s+/g, '.');
  const domain = `${name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.in`;
  const addressLine = `${rnd(12, 88)}, ${pick(['MIDC Industrial Estate', 'Phase II Commercial Hub', 'Trade Center Road', 'Logistics Park'])}`;
  const city = pick(CITIES, 'Mumbai');
  const state = pick(['Maharashtra', 'Karnataka', 'Delhi', 'Telangana', 'Gujarat']);
  const pinCode = `${rnd(100000, 999999)}`;

  return {
    vendor_name: name,
    contact_person: contactPerson,
    email: `${localPart}@${domain}`,
    phone: makePhone(),
    address: `${addressLine}, ${city}, ${state} - ${pinCode}`,
    gst_number: makeGSTIN(),
    payment_terms: pick(PAYMENT_TERMS, "Net 30"),
    status: "Active",
    notes: scenario === "minimal" ? "" : "Handles rush orders within 48 hours.",
  };
};

export const generateProductMockData = ({ scenario = "full", context = {} } = {}) => {
  const category = pick(CATEGORIES, "Office Supplies");
  const name = `${pick(["Premium", "Smart", "Eco", "Pro", "Ultra"])} ${pick(["Notebook", "Keyboard", "Cable", "Service Plan", "Adapter"])}`;
  const price = rnd(250, 3500);
  const cost = Math.max(100, price - rnd(20, 300));
  return {
    item_type: scenario === "edge" ? "service" : "goods",
    name,
    hsn_sac: `${rnd(1000, 9999)}`,
    category,
    unit: pick(["pcs", "kg", "litre", "pack"], "pcs"),
    tax_preference: "taxable",
    tax_rate: "18",
    description: `High quality ${name.toLowerCase()} for business use.`,
    purchase_description: `Bulk purchase ${name.toLowerCase()}.`,
    price,
    purchase_rate: cost,
    sales_enabled: true,
    purchase_enabled: true,
    sales_account: "Sales",
    purchase_account: "Cost of Goods Sold",
    reorder_level: rnd(5, 20),
    reorder_qty: rnd(10, 60),
    preferred_vendor_id: context.vendors?.[0]?.id || "",
    stock: scenario === "edge" ? 0 : rnd(15, 120),
  };
};

export const generateInvoiceMockData = ({ scenario = "full", context = {} } = {}) => {
  const itemOneQty = scenario === "minimal" ? 1 : 2;
  const itemOneRate = 4200;
  const itemTwoQty = 3;
  const itemTwoRate = 950;
  const itemOneDiscount = scenario === "edge" ? 150 : 0;
  const itemTwoDiscount = 0;

  const itemOneBase = itemOneQty * itemOneRate - itemOneDiscount;
  const itemTwoBase = itemTwoQty * itemTwoRate - itemTwoDiscount;

  const itemOneTax = (itemOneBase * 18) / 100;
  const itemTwoTax = (itemTwoBase * 18) / 100;

  const issueDate = today();
  return {
    customer_id: context.customers?.[0]?.id || "",
    issue_date: issueDate,
    due_date: plusDays(15),
    payment_terms: "Net 15",
    invoice_type: "Tax Invoice",
    subject: "Website redesign and monthly support",
    salesperson: "Karan Mehta",
    notes: "Thanks for choosing Smart Invoice Pro. Please process payment within agreed terms.",
    terms_conditions: "Late payment may attract interest as per agreement.",
    is_gst_applicable: true,
    invoice_discount: scenario === "edge" ? 100 : 0,
    round_off: 0,
    items: [
      {
        name: "UI/UX Revamp - Phase 1",
        description: "Design system setup, responsive pages, and review cycle.",
        quantity: itemOneQty,
        rate: itemOneRate,
        discount: itemOneDiscount,
        tax: 18,
        amount: itemOneBase + itemOneTax,
      },
      {
        name: "Monthly Support Retainer",
        description: "Bug fixes, deployment support, and priority issue handling.",
        quantity: itemTwoQty,
        rate: itemTwoRate,
        discount: itemTwoDiscount,
        tax: 18,
        amount: itemTwoBase + itemTwoTax,
      },
    ],
  };
};

export const generateQuoteMockData = ({ scenario = "full", context = {} } = {}) => ({
  customer_id: context.customers?.[0]?.id || "",
  issue_date: today(),
  expiry_date: plusDays(20),
  payment_terms: "Net 30",
  subject: "Project proposal",
  salesperson: makeName(),
  reference_number: `REF-${rnd(1000, 9999)}`,
  project_name: `${pick(["ERP", "POS", "Automation", "Migration"])} rollout`,
  notes: "Quoted prices valid for 20 days.",
  terms_conditions: "Final scope to be confirmed before work starts.",
  is_gst_applicable: true,
  tds_tcs_mode: "tds",
  tds_tcs_rate: scenario === "edge" ? "10" : "",
  adjustment_label: "Adjustment",
  adjustment_amount: scenario === "edge" ? "-50" : "",
  items: [{ name: "Consulting", quantity: 2, rate: 1200, discount: 0, tax: 18, amount: 2400 }],
});

export const generateSalesOrderMockData = ({ context = {} } = {}) => ({
  customer_id: context.customers?.[0]?.id || "",
  order_date: today(),
  delivery_date: plusDays(7),
  payment_terms: "Net 30",
  status: "Draft",
  subject: "Supply order",
  salesperson: makeName(),
  notes: "Deliver in two batches.",
  terms_conditions: "Goods once sold will not be taken back.",
  is_gst_applicable: true,
  items: [{ item_name: "Office Chair", description: "Ergonomic chair", quantity: 5, rate: 3500, discount: 0, tax: 18, amount: 17500 }],
});

export const generatePurchaseOrderMockData = ({ context = {} } = {}) => ({
  vendor_id: context.vendors?.[0]?.id || "",
  order_date: today(),
  delivery_date: plusDays(10),
  status: "Draft",
  subject: "Procurement request",
  notes: "Please confirm dispatch schedule.",
  items: [{ item_name: "Raw Material", quantity: 10, rate: 800, tax: 18, amount: 8000 }],
});

export const generateBillMockData = ({ context = {} } = {}) => ({
  vendor_id: context.vendors?.[0]?.id || "",
  bill_date: today(),
  due_date: plusDays(15),
  payment_status: "Unpaid",
  subject: "Monthly procurement bill",
  notes: "Auto-filled for QA testing.",
  amount_paid: 0,
  items: [{ item_name: "Purchased Goods", quantity: 4, rate: 2400, tax: 18, amount: 9600 }],
  expenses: [{ description: "Freight", amount: 500 }],
});

export const generateExpenseMockData = () => ({
  vendor_name: makeCompany(),
  date: today(),
  category: pick(CATEGORIES, "Other"),
  amount: rnd(500, 7000),
  currency: "INR",
  notes: "Business expense for testing.",
});

export const generateRecurringProfileMockData = ({ context = {} } = {}) => ({
  profile_name: `${pick(["Monthly", "Quarterly", "Annual"])} Service Contract`,
  customer_id: context.customers?.[0]?.id || "",
  frequency: "Monthly",
  start_date: today(),
  next_run_date: plusDays(30),
  status: "Active",
  payment_terms: "Net 30",
  notes: "Recurring invoice profile for subscription billing.",
  terms_conditions: "Auto-generated invoices based on frequency.",
  is_gst_applicable: true,
  items: [{ name: "Support Plan", quantity: 1, rate: 1999, discount: 0, tax: 18, amount: 1999 }],
});
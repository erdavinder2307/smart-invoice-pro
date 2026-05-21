import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import BillList from "../../components/BillList";
import * as billService from "../../services/billService";

const mockNavigate = jest.fn();
const mockLocation = { pathname: "/bills", search: "" };

jest.mock("axios");
jest.mock("../../services/billService");
jest.mock("@mui/material/useMediaQuery", () => jest.fn(() => false));
jest.mock("../../services/searchService", () => ({
  saveSearchHistory: jest.fn(() => Promise.resolve({ ok: true })),
}));

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

jest.mock("../../components/Layout/MainLayout", () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

jest.mock("../../context/AuthContext", () => ({
  ...jest.requireActual("../../context/AuthContext"),
  useAuth: jest.fn(() => ({ user: { id: 'test-user-id', username: 'testuser' } })),
  AuthProvider: ({ children }) => children,
}));

const testTheme = createTheme();

const renderBillList = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <MemoryRouter initialEntries={["/bills"]}>
      <ThemeProvider theme={testTheme}>
        <QueryClientProvider client={queryClient}>
          <BillList />
        </QueryClientProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
};

const sampleResponse = {
  data: [
    {
      id: "b-1",
      bill_number: "BILL-001",
      vendor_id: "v-1",
      vendor_name: "Acme Supplies",
      bill_date: "2026-05-01",
      due_date: "2026-05-20",
      total_amount: 1000,
      amount_paid: 0,
      balance_due: 1000,
      payment_status: "Open",
      status_bucket: "Open",
    },
  ],
  total: 1,
  page: 1,
  page_size: 10,
  summary: { total: 1, draft: 0, open: 1, paid: 0, overdue: 0 },
};

describe("BillList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    billService.getBillsList.mockResolvedValue(sampleResponse);
    billService.deleteBillById.mockResolvedValue({ ok: true });
    billService.markBillAsPaid.mockResolvedValue({ payment_status: "Paid" });
    axios.get.mockResolvedValue({ data: [{ id: "v-1", vendor_name: "Acme Supplies" }] });
  });

  it("fetches bills with server-side list params", async () => {
    renderBillList();

    await waitFor(() => expect(billService.getBillsList).toHaveBeenCalled());

    const params = billService.getBillsList.mock.calls[0][0];
    expect(params.include_meta).toBe("1");
    expect(params.sort_by).toBe("created_at");
    expect(params.sort_order).toBe("desc");
    expect(params.page).toBe(1);
    expect(params.page_size).toBe(10);
  });

  it("applies status filter and re-fetches", async () => {
    renderBillList();

    await waitFor(() => expect(billService.getBillsList).toHaveBeenCalledTimes(1));

    const selects = screen.getAllByRole("combobox");
    fireEvent.mouseDown(selects[0]);
    fireEvent.click(screen.getByText("Paid"));

    await waitFor(() => {
      const latestParams = billService.getBillsList.mock.calls[billService.getBillsList.mock.calls.length - 1][0];
      expect(latestParams.status).toBe("Paid");
    });
  });

  it("renders server-side pagination metadata", async () => {
    billService.getBillsList.mockResolvedValue({
      ...sampleResponse,
      total: 25,
      summary: { total: 25, draft: 0, open: 25, paid: 0, overdue: 0 },
    });

    renderBillList();

    await waitFor(() => expect(billService.getBillsList).toHaveBeenCalledTimes(1));

    await waitFor(() => {
      expect(screen.getByText(/of 25/i)).toBeInTheDocument();
      const latestParams = billService.getBillsList.mock.calls[billService.getBillsList.mock.calls.length - 1][0];
      expect(latestParams.page_size).toBe(10);
      expect(latestParams.page).toBe(1);
    });
  });

  it("calls mark as paid from row actions menu", async () => {
    renderBillList();

    await waitFor(() => expect(screen.getByText("BILL-001")).toBeInTheDocument());

    const moreButton = screen.getAllByLabelText("More").at(-1);
    fireEvent.click(moreButton);

    fireEvent.click(screen.getByText("Mark as Paid"));

    await waitFor(() => expect(billService.markBillAsPaid).toHaveBeenCalledTimes(1));
  });
});

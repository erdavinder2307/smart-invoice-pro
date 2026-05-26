import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import QuoteList from "../../components/QuoteList";
import * as quoteService from "../../services/quoteService";
import { saveSearchHistory } from "../../services/searchService";

jest.mock("../../services/quoteService");
jest.mock("axios");
jest.mock("@mui/material/useMediaQuery", () => jest.fn(() => false));
jest.mock("../../services/searchService", () => ({
  saveSearchHistory: jest.fn(() => Promise.resolve({ ok: true })),
}));

jest.mock("../../components/common/QuoteCard", () => ({
  __esModule: true,
  default: ({ quote }) => <div>{quote.quote_number}</div>,
}));

jest.mock("../../components/Layout/MainLayout", () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

// Prevent MUI Popper (search-history dropdown in ListHeader) from creating a
// popperjs instance that fires async position updates outside act().
jest.mock("@mui/material/Popper", () => ({
  __esModule: true,
  default: ({ open, children }) =>
    open ? <div data-testid="mock-popper">{children}</div> : null,
}));

jest.mock("../../context/AuthContext", () => ({
  ...jest.requireActual("../../context/AuthContext"),
  useAuth: jest.fn(() => ({ user: { id: 'test-user-id', username: 'testuser' } })),
  AuthProvider: ({ children }) => children,
}));

const testTheme = createTheme();

const renderQuoteList = (route = "/quotes") => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <MemoryRouter initialEntries={[route]}>
      <ThemeProvider theme={testTheme}>
        <QueryClientProvider client={queryClient}>
          <QuoteList />
        </QueryClientProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
};

const sampleResponse = {
  items: [
    {
      id: "q-1",
      quote_number: "QT-001",
      customer_id: "cust-1",
      customer_name: "Acme Corp",
      issue_date: "2026-04-10",
      total_amount: 1200,
      status: "Draft",
    },
  ],
  total: 1,
  page: 1,
  page_size: 10,
  summary: { Draft: 1 },
};

describe("QuoteList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    quoteService.getQuotesList.mockResolvedValue(sampleResponse);
    axios.get.mockResolvedValue({ data: [{ id: "cust-1", name: "Acme Corp" }] });
    saveSearchHistory.mockResolvedValue({ ok: true });
  });

  afterEach(async () => {
    // Flush any pending MUI Popper (ListHeader search dropdown) state updates
    // to avoid "not wrapped in act(...)" console warnings.
    await act(async () => {});
  });

  it("fetches once on mount and refetches once after debounced search", async () => {
    jest.useFakeTimers();
    renderQuoteList();

    await waitFor(() => expect(quoteService.getQuotesList).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByPlaceholderText("Search in Quotes"), {
      target: { value: "acme" },
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => expect(quoteService.getQuotesList).toHaveBeenCalledTimes(2));
    const latestParams = quoteService.getQuotesList.mock.calls[1][0];
    expect(latestParams.q).toBe("acme");

    jest.useRealTimers();
  });

  it("triggers status-filtered fetch when summary chip is clicked", async () => {
    renderQuoteList();

    await waitFor(() => expect(quoteService.getQuotesList).toHaveBeenCalled());

    fireEvent.click(screen.getByText(/Draft:/));

    await waitFor(() => {
      const latestParams = quoteService.getQuotesList.mock.calls[quoteService.getQuotesList.mock.calls.length - 1][0];
      expect(latestParams.status).toBe("Draft");
    });
  });
});

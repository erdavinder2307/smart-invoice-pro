import React from "react";
import { fireEvent, renderWithProviders, screen, waitFor } from "../../test-utils";
import ProductList from "../../components/ProductList";
import axios from "axios";
import { deleteProduct, getProducts } from "../../services/productService";

const mockNavigate = jest.fn();

jest.mock("axios");
jest.mock("../../services/productService", () => ({
  getProducts: jest.fn(),
  deleteProduct: jest.fn(),
}));

jest.mock("../../components/Layout/MainLayout", () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const PRODUCTS = [
  { id: "p-1", name: "Critical Item", category: "Office", stock: -2, reorder_level: 10, price: 99, purchase_rate: 45 },
  { id: "p-2", name: "Low Item", category: "Office", stock: 3, reorder_level: 10, price: 120, purchase_rate: 70 },
  { id: "p-3", name: "Healthy Item", category: "Electronics", stock: 25, reorder_level: 10, price: 1000, purchase_rate: 700 },
];

describe("ProductList inventory console", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    if (!URL.createObjectURL) {
      URL.createObjectURL = jest.fn(() => "blob:test");
    }
    if (!URL.revokeObjectURL) {
      URL.revokeObjectURL = jest.fn();
    }

    getProducts.mockResolvedValue(PRODUCTS);
    deleteProduct.mockResolvedValue({ success: true });
    axios.post.mockResolvedValue({ data: { message: "Stock added" } });
  });

  it("shows stock status labels and negative stock alert", async () => {
    renderWithProviders(<ProductList />);

    expect(await screen.findByText("Critical Item")).toBeInTheDocument();
    expect(screen.getAllByText("Out of Stock").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Low Stock").length).toBeGreaterThan(0);
    expect(screen.getAllByText("In Stock").length).toBeGreaterThan(0);
    expect(screen.getByText("1 items have negative stock. Restock immediately.")).toBeInTheDocument();
  });

  it("filters by critical stock", async () => {
    renderWithProviders(<ProductList />);
    await screen.findByText("Critical Item");

    const statusSelect = screen.getAllByRole("combobox")[0];
    fireEvent.mouseDown(statusSelect);
    fireEvent.click(screen.getByText("Critical"));

    await waitFor(() => {
      expect(screen.getByText("Critical Item")).toBeInTheDocument();
      expect(screen.queryByText("Low Item")).not.toBeInTheDocument();
      expect(screen.queryByText("Healthy Item")).not.toBeInTheDocument();
    });
  });

  it("runs bulk delete for selected rows", async () => {
    renderWithProviders(<ProductList />);
    await screen.findByText("Critical Item");

    fireEvent.click(screen.getByLabelText("Select Critical Item"));
    fireEvent.click(screen.getByRole("button", { name: "Delete Selected" }));

    await waitFor(() => {
      expect(deleteProduct).toHaveBeenCalledWith("p-1");
    });
  });

  it("runs bulk stock update for selected rows", async () => {
    renderWithProviders(<ProductList />);
    await screen.findByText("Critical Item");

    fireEvent.click(screen.getByLabelText("Select Critical Item"));
    fireEvent.click(screen.getByLabelText("Select Low Item"));
    fireEvent.click(screen.getByRole("button", { name: "Update Stock" }));

    const quantityInput = screen.getByLabelText("Quantity");
    fireEvent.change(quantityInput, { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(2);
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/api/stock/add"),
        expect.objectContaining({ product_id: "p-1", quantity: 2 })
      );
    });
  });

  it("runs single stock decrease from adjust stock modal", async () => {
    renderWithProviders(<ProductList />);
    await screen.findByText("Critical Item");

    fireEvent.click(screen.getAllByLabelText("Add stock")[0]);

    const modeSelect = screen.getByLabelText("Stock mode");
    fireEvent.mouseDown(modeSelect);
    fireEvent.click(screen.getByText("Decrease stock"));

    const quantityInput = screen.getByLabelText("Quantity");
    fireEvent.change(quantityInput, { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/api/stock/reduce"),
        expect.objectContaining({ product_id: "p-1", quantity: 3, operation: "decrement" })
      );
    });
  });

  it("exports selected rows", async () => {
    const createObjectURLSpy = jest.spyOn(URL, "createObjectURL").mockReturnValue("blob:test");
    const revokeObjectURLSpy = jest.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    const anchorClickSpy = jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    renderWithProviders(<ProductList />);
    await screen.findByText("Critical Item");

    fireEvent.click(screen.getByLabelText("Select Critical Item"));
    fireEvent.click(screen.getByRole("button", { name: "Export" }));

    await waitFor(() => {
      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalled();
    });

    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
    anchorClickSpy.mockRestore();
  });
});

import axios from "axios";
import { updateProductStock } from "../../services/stockService";

jest.mock("axios");

describe("stockService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls stock add endpoint for increment", async () => {
    axios.post.mockResolvedValue({ data: { message: "Stock added", current_stock: 15 } });

    const result = await updateProductStock({
      productId: "p-1",
      quantity: 5,
      operation: "increment",
      source: "Manual adjustment",
    });

    expect(result).toEqual({ message: "Stock added", current_stock: 15 });
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/api/stock/add"),
      expect.objectContaining({ product_id: "p-1", quantity: 5, operation: "increment" })
    );
  });

  it("calls stock reduce endpoint for decrement", async () => {
    axios.post.mockResolvedValue({ data: { message: "Stock reduced", current_stock: 2 } });

    await updateProductStock({
      productId: "p-1",
      quantity: 3,
      operation: "decrement",
      source: "Manual adjustment",
    });

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/api/stock/reduce"),
      expect.objectContaining({ product_id: "p-1", quantity: 3, operation: "decrement" })
    );
  });

  it("throws for invalid quantity", async () => {
    await expect(
      updateProductStock({ productId: "p-1", quantity: 0, operation: "increment" })
    ).rejects.toThrow("quantity must be greater than 0");
  });
});

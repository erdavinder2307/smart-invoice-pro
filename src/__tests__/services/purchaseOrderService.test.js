import axios from "axios";
import {
  bulkPurchaseOrderAction,
  convertPurchaseOrderToBill,
  deletePurchaseOrderById,
  getPurchaseOrdersList,
  sendPurchaseOrderEmail,
} from "../../services/purchaseOrderService";

jest.mock("axios");

beforeEach(() => jest.clearAllMocks());

describe("purchaseOrderService", () => {
  it("getPurchaseOrdersList compacts params and forwards signal", async () => {
    const signal = { aborted: false };
    axios.get.mockResolvedValue({ data: { data: [{ id: "po-1" }], total: 1 } });

    const result = await getPurchaseOrdersList(
      {
        page: 1,
        limit: 10,
        q: "PO-001",
        status: "",
        vendor_id: null,
      },
      signal
    );

    expect(result).toEqual({ data: [{ id: "po-1" }], total: 1 });
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining("/api/purchase-orders"),
      expect.objectContaining({
        params: {
          page: 1,
          limit: 10,
          q: "PO-001",
        },
        signal,
      })
    );
  });

  it("deletePurchaseOrderById deletes by id", async () => {
    axios.delete.mockResolvedValue({ data: { ok: true } });

    const result = await deletePurchaseOrderById("po-1");

    expect(result).toEqual({ ok: true });
    expect(axios.delete).toHaveBeenCalledWith(expect.stringContaining("/api/purchase-orders/po-1"));
  });

  it("bulkPurchaseOrderAction posts payload", async () => {
    const payload = { action: "cancel", ids: ["po-1", "po-2"] };
    axios.post.mockResolvedValue({ data: { success_count: 2 } });

    const result = await bulkPurchaseOrderAction(payload);

    expect(result).toEqual({ success_count: 2 });
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/api/purchase-orders/bulk"),
      payload
    );
  });

  it("sendPurchaseOrderEmail posts payload", async () => {
    const payload = { recipient_email: "vendor@test.com" };
    axios.post.mockResolvedValue({ data: { sent: true } });

    const result = await sendPurchaseOrderEmail("po-1", payload);

    expect(result).toEqual({ sent: true });
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/api/purchase-orders/po-1/send-email"),
      payload
    );
  });

  it("convertPurchaseOrderToBill posts payload", async () => {
    const payload = { bill_number: "BILL-001" };
    axios.post.mockResolvedValue({ data: { bill_id: "bill-1" } });

    const result = await convertPurchaseOrderToBill("po-1", payload);

    expect(result).toEqual({ bill_id: "bill-1" });
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/api/purchase-orders/po-1/convert-bill"),
      payload
    );
  });
});

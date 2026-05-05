import axios from "axios";
import {
  deleteBillById,
  getBillById,
  getBillsList,
  markBillAsPaid,
  recordBillPayment,
} from "../../services/billService";

jest.mock("axios");

beforeEach(() => jest.clearAllMocks());

describe("billService", () => {
  it("getBillsList compacts params and forwards signal", async () => {
    const signal = { aborted: false };
    axios.get.mockResolvedValue({ data: { data: [{ id: "b-1" }], total: 1 } });

    const result = await getBillsList(
      {
        page: 1,
        page_size: 10,
        q: "BILL-001",
        status: "",
        vendor_id: null,
      },
      signal
    );

    expect(result).toEqual({ data: [{ id: "b-1" }], total: 1 });
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining("/api/bills"),
      expect.objectContaining({
        params: {
          page: 1,
          page_size: 10,
          q: "BILL-001",
        },
        signal,
      })
    );
  });

  it("getBillById fetches single bill", async () => {
    axios.get.mockResolvedValue({ data: { id: "b-1" } });

    const result = await getBillById("b-1");

    expect(result).toEqual({ id: "b-1" });
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining("/api/bills/b-1"), { signal: undefined });
  });

  it("deleteBillById deletes by id", async () => {
    axios.delete.mockResolvedValue({ data: { ok: true } });

    const result = await deleteBillById("b-1");

    expect(result).toEqual({ ok: true });
    expect(axios.delete).toHaveBeenCalledWith(expect.stringContaining("/api/bills/b-1"));
  });

  it("recordBillPayment posts payload", async () => {
    const payload = { amount: 50, payment_date: "2026-05-01" };
    axios.post.mockResolvedValue({ data: { message: "Payment recorded successfully" } });

    const result = await recordBillPayment("b-1", payload);

    expect(result).toEqual({ message: "Payment recorded successfully" });
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/api/bills/b-1/record-payment"),
      payload
    );
  });

  it("markBillAsPaid uses balance_due and posts payment", async () => {
    axios.post.mockResolvedValue({ data: { payment_status: "Paid" } });

    const result = await markBillAsPaid({ id: "b-1", balance_due: 120 });

    expect(result).toEqual({ payment_status: "Paid" });
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/api/bills/b-1/record-payment"),
      expect.objectContaining({ amount: 120 })
    );
  });

  it("markBillAsPaid skips when bill has no payable balance", async () => {
    const result = await markBillAsPaid({ id: "b-1", balance_due: 0 });

    expect(result).toEqual({ skipped: true });
    expect(axios.post).not.toHaveBeenCalled();
  });
});

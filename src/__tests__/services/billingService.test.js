import axios from "axios";
import { downloadTaxInvoicePdf } from "../../services/billingService";

jest.mock("axios");

describe("billingService.downloadTaxInvoicePdf", () => {
  const originalCreate = URL.createObjectURL;
  const originalRevoke = URL.revokeObjectURL;

  beforeEach(() => {
    jest.clearAllMocks();
    URL.createObjectURL = jest.fn(() => "blob:invoice");
    URL.revokeObjectURL = jest.fn();
  });

  afterAll(() => {
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
  });

  it("fetches the PDF as a blob and saves it under the invoice number", async () => {
    axios.get.mockResolvedValue({ data: "pdf-bytes" });
    const clicked = [];
    const click = jest
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(function record() {
        clicked.push(this.getAttribute("download"));
      });

    await downloadTaxInvoicePdf({ id: "tinv_pay_1", number: "SB/2026-27/0001" });

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining("/api/billing/invoices/tinv_pay_1/pdf"),
      { responseType: "blob" }
    );
    expect(clicked).toEqual(["SB-2026-27-0001.pdf"]);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:invoice");
    click.mockRestore();
  });
});

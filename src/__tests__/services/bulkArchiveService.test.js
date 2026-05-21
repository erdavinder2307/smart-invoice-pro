import axios from "axios";
import { bulkArchiveEntities } from "../../services/bulkArchiveService";

jest.mock("axios");

beforeEach(() => jest.clearAllMocks());

describe("bulkArchiveService", () => {
  it("posts lifecycle-aware bulk archive request", async () => {
    axios.post.mockResolvedValue({
      data: {
        successCount: 2,
        failedCount: 1,
      },
    });

    const result = await bulkArchiveEntities("bill", ["b-1", "b-2", "b-3"]);

    expect(result).toEqual({ successCount: 2, failedCount: 1 });
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/api/lifecycle/bills/bulk-execute"),
      {
        ids: ["b-1", "b-2", "b-3"],
        action: "delete",
      }
    );
  });

  it("throws for unsupported entity type", async () => {
    await expect(bulkArchiveEntities("unknown", ["x-1"]))
      .rejects
      .toThrow("Unsupported bulk archive entity type: unknown");
    expect(axios.post).not.toHaveBeenCalled();
  });
});

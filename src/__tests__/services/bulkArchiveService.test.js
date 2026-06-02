import axios from "axios";
import {
  bulkArchiveEntities,
  parseBulkArchiveResult,
} from "../../services/bulkArchiveService";

jest.mock("axios");

beforeEach(() => jest.clearAllMocks());

describe("bulkArchiveService", () => {
  describe("bulkArchiveEntities", () => {
    it("posts lifecycle-aware bulk archive request", async () => {
      axios.post.mockResolvedValue({
        data: {
          processedCount: 2,
          failedCount: 1,
        },
      });

      const result = await bulkArchiveEntities("bill", ["b-1", "b-2", "b-3"]);

      expect(result).toEqual({ processedCount: 2, failedCount: 1 });
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/api/lifecycle/bills/bulk-execute"),
        {
          ids: ["b-1", "b-2", "b-3"],
          action: "delete",
        }
      );
    });

    it("resolves correct path for customer", async () => {
      axios.post.mockResolvedValue({ data: {} });
      await bulkArchiveEntities("customer", ["c-1"]);
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/api/lifecycle/customers/bulk-execute"),
        expect.objectContaining({ action: "delete" })
      );
    });

    it("resolves recurring_profile alias", async () => {
      axios.post.mockResolvedValue({ data: {} });
      await bulkArchiveEntities("recurring_profile", ["rp-1"]);
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/api/lifecycle/recurring-profiles/bulk-execute"),
        expect.anything()
      );
    });

    it("throws for unsupported entity type", async () => {
      await expect(bulkArchiveEntities("unknown", ["x-1"]))
        .rejects
        .toThrow("Unsupported bulk archive entity type: unknown");
      expect(axios.post).not.toHaveBeenCalled();
    });

    it("propagates API errors", async () => {
      axios.post.mockRejectedValue(new Error("Server error"));
      await expect(bulkArchiveEntities("vendor", ["v-1"])).rejects.toThrow("Server error");
    });
  });

  describe("parseBulkArchiveResult", () => {
    it("parses full result correctly", () => {
      const data = {
        processedCount: 5,
        failedCount: 1,
        deletedCount: 3,
        archivedCount: 1,
        restoredCount: 0,
        dependencySummary: { invoices: 2 },
        results: [{ id: "p-1", status: "deleted" }],
      };

      const parsed = parseBulkArchiveResult(data);

      expect(parsed.successCount).toBe(5);
      expect(parsed.failedCount).toBe(1);
      expect(parsed.deletedCount).toBe(3);
      expect(parsed.archivedCount).toBe(1);
      expect(parsed.restoredCount).toBe(0);
      expect(parsed.hasPartialFailure).toBe(true);
      expect(parsed.dependencySummary).toEqual({ invoices: 2 });
      expect(parsed.results).toHaveLength(1);
      expect(parsed.message).toContain("5 record(s)");
      expect(parsed.message).toContain("1 failed");
    });

    it("includes restored count in message when > 0", () => {
      const data = {
        processedCount: 2,
        failedCount: 0,
        deletedCount: 0,
        archivedCount: 0,
        restoredCount: 2,
      };

      const parsed = parseBulkArchiveResult(data);

      expect(parsed.restoredCount).toBe(2);
      expect(parsed.message).toContain("2 restored");
      expect(parsed.hasPartialFailure).toBe(false);
    });

    it("handles missing fields gracefully", () => {
      const parsed = parseBulkArchiveResult({});

      expect(parsed.successCount).toBe(0);
      expect(parsed.failedCount).toBe(0);
      expect(parsed.deletedCount).toBe(0);
      expect(parsed.archivedCount).toBe(0);
      expect(parsed.restoredCount).toBe(0);
      expect(parsed.hasPartialFailure).toBe(false);
      expect(parsed.dependencySummary).toEqual({});
      expect(parsed.results).toEqual([]);
    });

    it("handles null data gracefully", () => {
      const parsed = parseBulkArchiveResult(null);

      expect(parsed.successCount).toBe(0);
      expect(parsed.failedCount).toBe(0);
      expect(parsed.hasPartialFailure).toBe(false);
      expect(parsed.results).toEqual([]);
    });
  });
});

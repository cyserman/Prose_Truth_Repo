import { describe, it, expect } from "vitest";
import {
  getEventKey,
  generateId,
  DEFAULT_EVENT_TYPES,
  DEFAULT_LANES,
} from "@/types/timeline";
import { getTimelineDataSummary } from "@/lib/export-import";
import type { TimelineState } from "@/types/timeline";
import type { Event } from "@/types/timeline";

describe("Timeline Data Model", () => {
  describe("getEventKey", () => {
    it("should generate correct event key", () => {
      const key = getEventKey(2025, "lead", 5);
      expect(key).toBe("2025_lead_5");
    });

    it("should handle different parameters", () => {
      expect(getEventKey(2023, "para", 0)).toBe("2023_para_0");
      expect(getEventKey(2026, "judge", 11)).toBe("2026_judge_11");
    });
  });

  describe("generateId", () => {
    it("should generate unique IDs", () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it("should generate string IDs", () => {
      const id = generateId();
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(0);
    });
  });

  describe("DEFAULT_EVENT_TYPES", () => {
    it("should have correct structure", () => {
      expect(DEFAULT_EVENT_TYPES.length).toBeGreaterThan(0);
      DEFAULT_EVENT_TYPES.forEach((type) => {
        expect(type).toHaveProperty("id");
        expect(type).toHaveProperty("label");
        expect(type).toHaveProperty("icon");
        expect(type).toHaveProperty("color");
      });
    });

    it("should have unique IDs", () => {
      const ids = DEFAULT_EVENT_TYPES.map((t) => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe("DEFAULT_LANES", () => {
    it("should have correct structure", () => {
      expect(DEFAULT_LANES.length).toBeGreaterThan(0);
      DEFAULT_LANES.forEach((lane) => {
        expect(lane).toHaveProperty("id");
        expect(lane).toHaveProperty("title");
        expect(lane).toHaveProperty("order");
      });
    });

    it("should have sequential order", () => {
      const orders = DEFAULT_LANES.map((l) => l.order);
      orders.forEach((order, index) => {
        expect(order).toBe(index);
      });
    });
  });
});

describe("Export/Import Utilities", () => {
  describe("getTimelineDataSummary", () => {
    it("should generate correct summary for empty state", () => {
      const state: TimelineState = {
        lanes: DEFAULT_LANES,
        eventTypes: DEFAULT_EVENT_TYPES,
        events: {},
        selectedYear: 2025,
        zoomLevel: 3,
      };
      const summary = getTimelineDataSummary(state);
      expect(summary).toContain("Events: 0");
      expect(summary).toContain("Lanes: 3");
    });

    it("should generate correct summary with events", () => {
      const event1: Event = {
        id: "1",
        year: 2024,
        laneId: "lead",
        monthIndex: 0,
        typeId: "filing",
        note: "Test event",
        attachments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const event2: Event = {
        id: "2",
        year: 2025,
        laneId: "para",
        monthIndex: 5,
        typeId: "court",
        note: "Another event",
        attachments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const state: TimelineState = {
        lanes: DEFAULT_LANES,
        eventTypes: DEFAULT_EVENT_TYPES,
        events: { "1": event1, "2": event2 },
        selectedYear: 2025,
        zoomLevel: 3,
      };

      const summary = getTimelineDataSummary(state);
      expect(summary).toContain("Events: 2");
      expect(summary).toContain("Lanes: 3");
      expect(summary).toContain("2024-2025");
    });
  });
});

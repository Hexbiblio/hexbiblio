import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebouncedValue } from "./useDebouncedValue";

describe("useDebouncedValue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebouncedValue("a", 300));
    expect(result.current).toBe("a");
  });

  it("keeps the old value until the delay elapses", () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: "a" },
    });

    rerender({ value: "ab" });
    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("ab");
  });

  it("resets the timer on every change, so only the last value in a burst survives", () => {
    // The regression this hook exists for: typing "sociologie" should not
    // fire a fetch per keystroke — only the value left standing once typing
    // pauses should ever reach the debounced output.
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: "s" },
    });

    for (const value of ["so", "soc", "soci", "socio"]) {
      rerender({ value });
      act(() => {
        vi.advanceTimersByTime(100);
      });
    }
    // Only 100ms has elapsed since the last keystroke — still debouncing.
    expect(result.current).toBe("s");

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("socio");
  });
});

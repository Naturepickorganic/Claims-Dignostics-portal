import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Cleanup after each test
afterEach(() => { cleanup(); });

// Suppress known console noise in tests
const originalError = console.error;
beforeEach(() => {
  console.error = (...args) => {
    if (args[0]?.includes?.("Warning: ReactDOM.render")) return;
    if (args[0]?.includes?.("not wrapped in act")) return;
    originalError(...args);
  };
});
afterEach(() => { console.error = originalError; });


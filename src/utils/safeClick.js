// MUI v7's useButton calls onClick(event) unconditionally — no optional chaining.
// Returning undefined causes "onClick is not a function" on every click.
// Always return a callable: the real function if valid, a no-op otherwise.
export const safeClick = (fn) => (typeof fn === "function" ? fn : () => {});

// Helper to check if an onClick value is a real (intended) handler.
export const isClickHandler = (fn) => typeof fn === "function";

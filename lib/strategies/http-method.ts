import type { ConstraintStrategy } from "../../types.d.ts";
import type { Handler } from "../node.ts";

export default {
  name: "__fmw_internal_strategy_merged_tree_http_method__",
  storage: function () {
    const handlers = new Map<string, Handler>();
    return {
      get: (type: string) => {
        return handlers.get(type) ?? null;
      },
      set: (type: string, store: Handler) => {
        handlers.set(type, store);
      },
    };
  },
  /* c8 ignore next 1 */
  deriveConstraint: (req) => req.method,
  mustMatchWhenDerived: true,
} satisfies ConstraintStrategy;

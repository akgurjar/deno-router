import { assert } from "@std/assert";
import type { Handler } from "../node.ts";
import type { ConstraintStrategy } from "../../types.d.ts";

function HostStorage() {
  const hosts = new Map<string, Handler>();
  const regexHosts: { host: RegExp; value: Handler }[] = [];
  return {
    get: (host: string) => {
      const exact = hosts.get(host);
      if (exact) {
        return exact;
      }
      for (const regex of regexHosts) {
        if (regex.host.test(host)) {
          return regex.value;
        }
      }
      return null;
    },
    set: (host: string | RegExp, value: Handler) => {
      if (host instanceof RegExp) {
        regexHosts.push({ host, value });
      } else {
        hosts.set(host, value);
      }
    },
  };
}

export default {
  name: "host",
  mustMatchWhenDerived: false,
  storage: HostStorage,
  validate(value: string | RegExp) {
    assert(
      typeof value === "string" ||
        Object.prototype.toString.call(value) === "[object RegExp]",
      "Host should be a string or a RegExp",
    );
  },
} satisfies ConstraintStrategy;

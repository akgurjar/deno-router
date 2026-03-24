import { assert } from "@std/assert";
import type { ConstraintStrategy } from "../../types.d.ts";
import type { Handler } from "../node.ts";

class SemVerStore {
  #store: Map<string, Handler> = new Map();
  #maxMajor: number = 0;
  #maxMinors: Record<number, number> = {};
  #maxPatches: Record<string, number> = {};
  set(version: string, store: Handler) {
    if (typeof version !== "string") {
      throw new TypeError("Version should be a string");
    }
    const [major, minor = 0, patch = 0] = version.split(".", 3).map(Number);

    if (isNaN(major)) {
      throw new TypeError("Major version must be a numeric value");
    }

    if (major >= this.#maxMajor) {
      this.#maxMajor = major;
      this.#store.set("x", store);
      this.#store.set("*", store);
      this.#store.set("x.x", store);
      this.#store.set("x.x.x", store);
    }

    if (minor >= (this.#maxMinors[major] || 0)) {
      this.#maxMinors[major] = minor;
      this.#store.set(`${major}.x`, store);
      this.#store.set(`${major}.x.x`, store);
    }

    if (patch >= (this.#maxPatches[`${major}.${minor}`] || 0)) {
      this.#maxPatches[`${major}.${minor}`] = patch;
      this.#store.set(`${major}.${minor}.x`, store);
    }

    this.#store.set(`${major}.${minor}.${patch}`, store);
    return this;
  }

  get(version: string) {
    return this.#store.get(version) ?? null;
  }
}

export default {
  name: "version",
  mustMatchWhenDerived: true,
  storage: () => new SemVerStore(),
  validate(value: string) {
    assert(typeof value === "string", "Version should be a string");
  },
} satisfies ConstraintStrategy;

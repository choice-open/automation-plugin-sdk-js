import { isFunction } from "es-toolkit/predicate"
import type { JsonValue } from "type-fest"
import type { Feature } from "../types"

/**
 * Serializes a Feature object by removing any function-type properties.
 *
 * @param feature - The Feature object to serialize.
 * @returns An object with only non-function properties of the Feature.
 */
export const serializeFeature = (feature: Feature) => {
  return Object.keys(feature).reduce<Record<string, JsonValue>>((finale, key) => {
    const value = feature[key as keyof typeof feature]

    if (isFunction(value)) {
      return finale
    }

    return Object.assign(finale, { [key]: value })
  }, {})
}

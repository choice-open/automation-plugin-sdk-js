import type { LiteralUnion } from "type-fest"

/**
 * I18n Entry
 */
export interface I18nText {
  /**
   * English is required
   */
  en_US: string
  [locale: `${LiteralUnion<"zh_Hans", string>}_${string}`]: string | undefined
}

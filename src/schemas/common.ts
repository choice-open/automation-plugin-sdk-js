import { isPlainObject } from "es-toolkit"
import type { IsEqual } from "type-fest"
import { z } from "zod"
import type { I18nText } from "../types"

/**
 * I18n 词条模式
 *
 * NOTE: Zod 无法定义复杂的字面量模版，此处使用 `z.custom` 实现自定义验证
 */
export const I18nEntrySchema = z.custom<I18nText>((value) => {
  // 必须是对象字面量
  if (!isPlainObject(value)) return false
  // 必须包含 en_US 键
  if (!("en_US" in value)) return false

  for (const [locale, text] of Object.entries(value)) {
    // 值必须是字符串
    if (typeof text !== "string") return false

    // NOTE: 支持的语言码并不严格符合标准，因为 TS 字面量模版无法描述所有可能的情况
    //       故以下仅对满足需求的子集做简单检查而不是严格的 RFC 5646 标准检查
    const parts = locale.split("_")
    // 其它语言代码必须符合格式：<语言代码>_<国家或脚本代码>，且第二部份首字母必须大写
    if (parts.length !== 2 || parts[1][0] !== parts[1][0].toUpperCase()) {
      return false
    }
  }
  return true
}, "Invalid I18n entry")
{
  const _: IsEqual<z.infer<typeof I18nEntrySchema>, I18nText> = true
}

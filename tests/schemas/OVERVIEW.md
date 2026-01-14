# Schema 验证测试

本目录包含所有 Zod Schema 的边界条件测试。

## 测试文件

- `common.test.ts` - I18nEntrySchema 测试
- `definition.test.ts` - 各种 Definition Schema 测试 (Base, Plugin, Credential, DataSource, Model, Tool)
- `property.test.ts` - Property Schema 测试 (String, Number, Boolean, Array, Object 等)
- `property-ui.test.ts` - Property UI 组件 Schema 测试

## 已解决的问题

### ✅ Zod `.pick()` 限制（已解决）

**问题描述：** 之前 `PropertyDiscriminatedUnionSchema` 的 `any_of` getter 使用 `.pick()` 方法作用于 `PropertyObjectSchema`，而后者包含 `.refine()` 调用。这是 Zod 的已知限制 - 无法在包含 refinements 的 schema 上使用 `.pick()`。

**解决方案：** `PropertyDiscriminatedUnionSchema` 的 `any_of` getter 现在直接使用 `z.array(PropertyObjectSchema)`，不再使用 `.pick()` 方法。

**状态：** ✅ 已修复，所有相关测试已启用。

### ✅ PropertyUIPropsSchema 问题（已解决）

**问题描述：** `PropertyUIPropsSchema` 之前使用 `discriminatedUnion("type", ...)` 但组件 schema 实际使用 `component` 字段作为区分器。

**解决方案：** `PropertyUIPropsSchema` 现在使用 `discriminatedUnion("component", ...)`，与实际的组件 schema 字段匹配。

**状态：** ✅ 已修复，所有相关测试已启用。

## 运行测试

```bash
bun test tests/schemas/
```

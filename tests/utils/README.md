# utils

工具函数的测试目录。

## 测试文件

### `serialize-feature.test.ts`

测试 `serializeFeature` 函数的各种场景：

- 序列化包含基本类型值的功能
- 排除函数属性
- 处理多个函数属性
- 处理仅包含函数的功能对象
- 处理空功能对象
- 保留嵌套对象结构
- 处理数组值
- 处理 null 和 undefined 值

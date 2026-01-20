# core

核心模块的测试目录，包含注册表和传输器的测试。

## 测试文件

### `registry.test.ts`

测试插件注册表（Registry）的核心功能：

- **注册功能**：测试 credential、tool、model、data_source 的注册
- **解析功能**：测试通过类型和名称解析已注册的功能
- **序列化**：测试注册表的序列化，包括功能列表和函数属性的排除
- **集成测试**：测试完整的注册-解析-序列化工作流

### `transporter.test.ts`

测试网络传输器（Transporter）的功能：

- **创建传输器**：测试传输器的初始化，包括 WebSocket URL、心跳间隔等配置
- **事件处理**：测试 onOpen、onClose、onError、onMessage 事件处理器
- **连接管理**：测试通道连接、加入、离开等操作
- **错误处理**：测试连接失败、超时等错误场景
- **清理**：测试 dispose 函数的行为

**注意：** 此测试使用 mock 来模拟 Phoenix Socket 和 Channel，避免实际网络连接。

# src

源代码目录，包含 SDK 的核心实现。

## 核心模块

### `index.ts`
SDK 的入口文件，导出主要的公共 API。

**导出：**
- `createPlugin` - 创建插件实例的工厂函数

### `plugin.ts`
插件核心模块，提供插件创建和管理的功能。

**功能：**
- 创建插件实例
- 管理凭证（credential）、工具（tool）、模型（model）的定义
- 处理工具调用请求
- 与 Hub Server 建立连接并注册插件

**主要接口：**
- `createPlugin()` - 创建插件实例，返回包含 `addCredential`、`addTool`、`addModel`、`run` 方法的对象

**依赖：**
- `registry.ts` - 用于管理功能注册
- `transporter.ts` - 用于网络通信

### `registry.ts`
插件注册表，管理所有已注册的功能定义。

**功能：**
- 注册和解析 credential、tool、model 等功能
- 序列化注册表为 JSON 格式
- 提供类型安全的功能查找

**主要接口：**
- `createRegistry()` - 创建注册表实例
- `register()` - 注册功能定义
- `resolve()` - 解析已注册的功能
- `serialize()` - 序列化注册表

**相关模块：**
- 使用 `utils/serialize-feature.ts` 来序列化功能定义

### `transporter.ts`
网络传输器，负责与 Hub Server 的 WebSocket 通信。

**功能：**
- 建立和管理 WebSocket 连接
- 创建和管理 Phoenix Channel
- 处理连接生命周期事件（open、close、error、message）
- 提供优雅的关闭机制

**主要接口：**
- `createTransporter()` - 创建传输器实例
- `connect()` - 连接到指定的通道
- `dispose()` - 清理连接并退出进程

**依赖：**
- `env.ts` - 获取环境配置（WebSocket URL、API Key 等）
- Phoenix Socket 库

### `env.ts`
环境变量管理模块，提供类型安全的环境变量访问。

**功能：**
- 验证必需的环境变量（HUB_SERVER_WS_URL、DEBUG_API_KEY）
- 解析和转换环境变量（如 DEBUG 标志）
- 缓存解析结果以提高性能

**环境变量：**
- `HUB_SERVER_WS_URL` - Hub Server 的 WebSocket URL（必需）
- `DEBUG_API_KEY` - 调试 API 密钥（必需）
- `DEBUG` - 是否启用调试模式（可选，默认根据 NODE_ENV 判断）
- `NODE_ENV` - 环境模式（development/production/test）

### `logger.ts`
日志记录模块，基于 Pino 日志库。

**功能：**
- 根据环境配置日志级别
- 在开发/测试环境中使用 pino-pretty 格式化输出
- 在生产环境中使用标准 JSON 格式

**配置：**
- 开发/测试环境：使用彩色格式化输出
- 生产环境：使用 JSON 格式，仅记录 error 级别

### `types.ts`
类型定义文件，重新导出外部类型定义。

**导出：**
- 从 `@choiceopen/atomemo-plugin-schema/types` 导出所有类型定义

## 工具模块

### `utils/`
工具函数目录，参见 [utils/README.md](./utils/README.md)

## 模块关系

```
index.ts
  └─> plugin.ts
        ├─> registry.ts
        │     └─> utils/serialize-feature.ts
        └─> transporter.ts
              └─> env.ts
                    └─> logger.ts (间接使用)
```

# tests

测试目录，包含所有单元测试和集成测试。

## 测试结构

### `core/`
核心模块的测试，参见 [core/README.md](./core/README.md)

### `utils/`
工具函数的测试，参见 [utils/README.md](./utils/README.md)

### `env.test.ts`
环境变量模块的测试：

- WebSocket URL 验证（ws:// 和 wss://）
- DEBUG 标志的解析和转换
- 环境变量缓存机制
- 错误处理和进程退出

## 测试框架

项目使用 **Bun** 作为测试运行器和运行时环境。

**运行测试：**
```bash
bun test
```

## 测试覆盖

- ✅ 注册表功能（注册、解析、序列化）
- ✅ 传输器功能（连接、事件处理、清理）
- ✅ 环境变量管理
- ✅ 功能序列化工具

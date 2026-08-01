# Pot App LLM OCR 插件

这是一个使用 OpenAI 兼容多模态接口识别截图文字的 Pot App 外部插件工程。工程会生成两个独立插件包，避免预置地址和手动地址同时出现在同一个配置窗口。

## 选择插件

| 插件包 | 配置界面 | 适用场景 |
| --- | --- | --- |
| `plugin.com.dean-op.llm_ocr.potext` | Base URL 下拉、API Key、Model | 使用 SiliconFlow、OpenAI、OpenRouter、阿里云百炼、Moonshot、DeepSeek、LM Studio 或 Ollama |
| `plugin.com.dean-op.llm_ocr_custom.potext` | Base URL 输入、API Key、Model | 使用任何其他 OpenAI 兼容接口 |

预置版不会显示 `Custom Base URL` 输入框；自定义版也不会显示预置平台下拉框。需要同时配置多个供应商时，可以安装两个插件，它们会作为独立的 OCR 服务出现。

## 使用

1. 运行 `npm run build`。
2. 在 Pot 中打开“服务设置 → 文字识别 → 添加外部插件”。
3. 按用途安装上表对应的 `.potext` 文件。
4. 填写 API Key 和视觉模型名称。

SiliconFlow 示例：

```text
插件：LLM OCR
Base URL：SiliconFlow
Model：Qwen/Qwen3-VL-32B-Instruct
```

自定义接口示例：

```text
插件：LLM OCR (Custom)
Base URL：https://example.com/v1
Model：your-vision-model
```

## 接口要求

服务必须支持：

- `POST /v1/chat/completions` 或完整的 `/chat/completions` 地址；
- `Authorization: Bearer <API_KEY>`；
- `image_url` 多模态消息内容；
- 非流式 JSON 响应中的 `choices[0].message.content`。

Base URL 可以填写服务根地址、带 `/v1` 的地址或完整的 `/chat/completions` 地址，插件会自动补全缺失路径。

## 开发与打包

需要 Node.js 18 或更高版本：

```powershell
npm test
npm run build
```

两个 `.potext` 的根目录均只包含 Pot 运行所需的 `main.js`、`info.json` 和 `icon.svg`。

## 隐私

插件不保存 API Key，也不包含默认密钥。截图会上传到配置的第三方服务，请确认服务商的隐私政策并避免识别敏感信息。

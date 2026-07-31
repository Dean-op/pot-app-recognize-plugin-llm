# Pot App LLM OCR 插件

这是一个 Pot App 外部 OCR 插件，使用 OpenAI 兼容的多模态接口识别截图文字。

当前 `info.json` 使用了示例插件 ID 和仓库地址；本地安装不受影响，发布到插件列表前请替换为你自己的唯一 ID 和仓库地址。

## 配置

安装插件后，只需要填写：

- `Base URL`：例如 `https://api.openai.com`、`https://api.openai.com/v1`，也支持填写完整的 `/chat/completions` 地址。
- `API Key`：以 Bearer 方式发送。
- `Model`：视觉模型名称，例如 `gpt-4o`、`gpt-4o-mini` 或供应商提供的模型名。

## 要求

第三方服务必须支持 OpenAI 风格的 `POST /v1/chat/completions` 多模态请求，并接受 `image_url` 类型的图片内容。

## 开发

需要 Node.js 18 或更高版本。

```powershell
npm test
npm run build
```

构建产物位于 `dist/plugin.com.example.llm_ocr.potext`。在 Pot 中打开“服务设置 → 文字识别 → 添加外部插件”安装它。

## 隐私

截图会上传到配置的第三方服务。请确认服务商的隐私政策，并避免识别敏感信息。

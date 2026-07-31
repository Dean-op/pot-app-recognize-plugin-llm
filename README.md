# Pot App LLM OCR 插件

这是一个 Pot App 外部 OCR 插件，使用 OpenAI 兼容的多模态接口识别截图文字。插件不保存 API Key，也不包含任何默认密钥。

## 使用

1. 运行 `npm run build`。
2. 在 Pot 中打开“服务设置 → 文字识别 → 添加外部插件”。
3. 选择 `dist/plugin.com.dean-op.llm_ocr.potext`。
4. 编辑 `LLM OCR` 服务，填写下面三项：

| 配置项 | 示例 |
| --- | --- |
| Base URL | 从下拉列表选择平台，或选择 `Custom` |
| Custom Base URL | 选择 `Custom` 后填写，例如 `https://example.com/v1` |
| API Key | 供应商的 Bearer API Key |
| Model | `Qwen/Qwen3-VL-32B-Instruct` |

`Base URL` 在插件配置中是下拉选项，已预置 SiliconFlow、OpenAI、OpenRouter、阿里云百炼、Moonshot、DeepSeek、LM Studio 和 Ollama。需要接入其他平台时选择 `Custom`，再在 `Custom Base URL` 中手动填写地址。不同平台可用的视觉模型不同，`Model` 仍需根据平台文档手动填写。当前下拉列表面向 OpenAI 兼容接口，不兼容该格式的平台不能直接使用。

安装后将 `LLM OCR` 加入文字识别服务列表，使用 Pot 的截图 OCR 快捷键框选区域即可识别。

## 接口要求

第三方服务必须支持：

- `POST /v1/chat/completions` 或完整的 `/chat/completions` 地址；
- OpenAI 风格的 `Authorization: Bearer <API_KEY>`；
- `image_url` 多模态消息内容；
- 非流式 JSON 响应中的 `choices[0].message.content`。

预置地址和 `Custom Base URL` 都可以填写服务根地址、带 `/v1` 的地址或完整的 `/chat/completions` 地址，插件会自动补全缺失路径。

## 开发与打包

需要 Node.js 18 或更高版本：

```powershell
npm test
npm run build
```

构建产物位于 `dist/plugin.com.dean-op.llm_ocr.potext`。`.potext` 内部只包含 Pot 运行所需的 `main.js`、`info.json` 和 `icon.svg`。

## 发布前检查

- 如果更换了维护者或仓库地址，请同步修改 `info.json` 的 `id` 和 `homepage`。
- 插件 ID 必须保持唯一；修改 ID 后，需要在 Pot 中卸载旧插件再安装新包。
- 不要把 API Key 写入源代码、README、测试或 Git 历史。

## 隐私

截图会上传到配置的第三方服务。请确认服务商的隐私政策，并避免识别敏感信息。

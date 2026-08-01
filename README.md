# Pot App LLM OCR 插件

这是一个使用 OpenAI 兼容多模态接口识别截图文字的 Pot App 外部插件。插件只提供手动配置，不预置任何服务商地址或模型。

## 使用

1. 运行 `npm run build`。
2. 在 Pot 中打开“服务设置 → 文字识别 → 添加外部插件”。
3. 选择 `dist/plugin.com.dean-op.llm_ocr.potext`。
4. 编辑 `LLM OCR`，填写三项配置：

| 配置项 | 示例 |
| --- | --- |
| Base URL | `https://api.siliconflow.cn/v1` |
| API Key | 供应商的 Bearer API Key |
| Model | `Qwen/Qwen3-VL-32B-Instruct` |

Base URL 可以填写服务根地址、带 `/v1` 的地址或完整的 `/chat/completions` 地址，插件会自动补全缺失路径。

## 接口要求

服务必须支持：

- `POST /v1/chat/completions` 或完整的 `/chat/completions` 地址；
- `Authorization: Bearer <API_KEY>`；
- `image_url` 多模态消息内容；
- 非流式 JSON 响应中的 `choices[0].message.content`。

## 开发与打包

需要 Node.js 18 或更高版本：

```powershell
npm test
npm run build
```

构建产物的根目录只包含 Pot 运行所需的 `main.js`、`info.json` 和 `icon.svg`。

## 隐私

插件不保存 API Key，也不包含默认密钥。截图会上传到配置的第三方服务，请确认服务商的隐私政策并避免识别敏感信息。

import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";

const source = await readFile(new URL("../main.js", import.meta.url), "utf8");
const info = JSON.parse(await readFile(new URL("../info.json", import.meta.url), "utf8"));

async function loadRecognize() {
    const context = {};
    vm.runInNewContext(`${source}\nthis.recognize = recognize;`, context);
    return context.recognize;
}

test("provides mainstream Base URL presets", () => {
    const baseUrl = info.needs.find((item) => item.key === "base_url");

    assert.equal(baseUrl.type, "select");
    assert.equal(baseUrl.options["https://api.siliconflow.cn/v1"], "SiliconFlow");
    assert.equal(baseUrl.options["https://api.openai.com/v1"], "OpenAI");
    assert.equal(baseUrl.options["https://openrouter.ai/api/v1"], "OpenRouter");
    assert.equal(baseUrl.options["http://localhost:1234/v1"], "LM Studio (Local)");
    assert.equal(baseUrl.options.__custom__, "Custom");
    assert.equal(info.needs.some((item) => item.key === "custom_base_url"), true);
});

test("normalizes base URL and sends a multimodal request", async () => {
    let request;
    const recognize = await loadRecognize();
    const result = await recognize("aGVsbG8=", "Chinese", {
        config: {
            base_url: "https://example.com/v1",
            apiKey: "test-key",
            model: "vision-model"
        },
        utils: {
            tauriFetch: async (url, options) => {
                request = { url, options };
                return {
                    ok: true,
                    status: 200,
                    data: { choices: [{ message: { content: "识别结果" } }] }
                };
            }
        }
    });

    assert.equal(result, "识别结果");
    assert.equal(request.url, "https://example.com/v1/chat/completions");
    assert.equal(request.options.headers.Authorization, "Bearer test-key");
    assert.equal(request.options.body.payload.model, "vision-model");
    assert.equal(request.options.body.payload.messages[0].content[1].image_url.url, "data:image/png;base64,aGVsbG8=");
});

test("uses a manually entered custom base URL", async () => {
    let requestUrl;
    const recognize = await loadRecognize();
    await recognize("aGVsbG8=", "auto", {
        config: {
            base_url: "__custom__",
            custom_base_url: "https://custom.example/v1",
            apiKey: "test-key",
            model: "vision-model"
        },
        utils: {
            tauriFetch: async (url) => {
                requestUrl = url;
                return {
                    ok: true,
                    data: { choices: [{ message: { content: "自定义地址结果" } }] }
                };
            }
        }
    });

    assert.equal(requestUrl, "https://custom.example/v1/chat/completions");
});

test("returns array-form message content", async () => {
    const recognize = await loadRecognize();
    const result = await recognize("aGVsbG8=", "auto", {
        config: {
            base_url: "https://example.com",
            apiKey: "test-key",
            model: "vision-model"
        },
        utils: {
            tauriFetch: async () => ({
                ok: true,
                data: {
                    choices: [{
                        message: {
                            content: [
                                { type: "text", text: "第一行" },
                                { type: "text", text: "\n第二行" }
                            ]
                        }
                    }]
                }
            })
        }
    });

    assert.equal(result, "第一行\n第二行");
});

test("rejects incomplete configuration", async () => {
    const recognize = await loadRecognize();
    await assert.rejects(
        recognize("aGVsbG8=", "auto", {
            config: { apiKey: "test-key", model: "vision-model" },
            utils: { tauriFetch: async () => ({ ok: true }) }
        }),
        (error) => error === "Base URL not found"
    );
});

test("reports provider HTTP errors without leaking request credentials", async () => {
    const recognize = await loadRecognize();
    await assert.rejects(
        recognize("aGVsbG8=", "auto", {
            config: {
                base_url: "https://example.com/v1",
                apiKey: "secret-test-key",
                model: "vision-model"
            },
            utils: {
                tauriFetch: async () => ({
                    ok: false,
                    status: 401,
                    data: { error: { message: "invalid api key" } }
                })
            }
        }),
        (error) => error === 'HTTP 401: {"error":{"message":"invalid api key"}}'
    );
});

test("rejects empty model output", async () => {
    const recognize = await loadRecognize();
    await assert.rejects(
        recognize("aGVsbG8=", "auto", {
            config: {
                base_url: "https://example.com",
                apiKey: "test-key",
                model: "vision-model"
            },
            utils: {
                tauriFetch: async () => ({
                    ok: true,
                    data: { choices: [{ message: { content: "   " } }] }
                })
            }
        }),
        (error) => error === "LLM returned empty text"
    );
});

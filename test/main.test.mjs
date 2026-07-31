import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";

const source = await readFile(new URL("../main.js", import.meta.url), "utf8");

async function loadRecognize() {
    const context = {};
    vm.runInNewContext(`${source}\nthis.recognize = recognize;`, context);
    return context.recognize;
}

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

function normalizeEndpoint(baseUrl) {
    let endpoint = (baseUrl || "").trim();

    if (!endpoint) {
        throw "Base URL not found";
    }

    if (!/^https?:\/\//i.test(endpoint)) {
        endpoint = `https://${endpoint}`;
    }

    endpoint = endpoint.replace(/\/+$/, "");

    if (!/\/chat\/completions$/i.test(endpoint)) {
        if (!/\/v1$/i.test(endpoint)) {
            endpoint += "/v1";
        }
        endpoint += "/chat/completions";
    }

    return endpoint;
}

function extractText(data) {
    const content = data?.choices?.[0]?.message?.content;

    if (typeof content === "string") {
        return content;
    }

    if (Array.isArray(content)) {
        return content
            .map((item) => typeof item === "string" ? item : item?.text || "")
            .join("");
    }

    const completionText = data?.choices?.[0]?.text;
    if (typeof completionText === "string") {
        return completionText;
    }

    throw "LLM response does not contain text";
}

async function recognize(base64, lang, options) {
    const { config = {}, utils = {} } = options || {};
    const { tauriFetch } = utils;

    const apiKey = (config.apiKey || "").trim();
    const model = (config.model || "").trim();
    const endpoint = normalizeEndpoint(config.base_url);

    if (!apiKey) {
        throw "API Key not found";
    }

    if (!model) {
        throw "Model not found";
    }

    if (typeof base64 !== "string" || base64.trim().length === 0) {
        throw "Image data not found";
    }

    if (typeof tauriFetch !== "function") {
        throw "Pot tauriFetch is unavailable";
    }

    const languageHint = lang && lang !== "auto"
        ? `图片主要语言是：${lang}`
        : "请自动判断图片中的语言";

    const prompt = [
        "请识别图片中的所有文字。",
        "只输出识别到的原文，不要解释，不要添加 Markdown 或代码块。",
        "尽量保留原始换行、段落和标点。",
        languageHint
    ].join("\n");

    const imageUrl = base64.startsWith("data:")
        ? base64
        : `data:image/png;base64,${base64}`;

    const response = await tauriFetch(endpoint, {
        method: "POST",
        url: endpoint,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: {
            type: "Json",
            payload: {
                model,
                stream: false,
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: prompt
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: imageUrl,
                                    detail: "high"
                                }
                            }
                        ]
                    }
                ]
            }
        }
    });

    if (!response || !response.ok) {
        const status = response?.status ?? "unknown";
        const detail = response?.data === undefined
            ? "No response body"
            : JSON.stringify(response.data);
        throw `HTTP ${status}: ${detail}`;
    }

    const result = extractText(response.data).trim();
    if (!result) {
        throw "LLM returned empty text";
    }

    return result;
}

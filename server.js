require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const llmEndpoint = process.env.LLM_ENDPOINT;
const llmApiKey = process.env.LLM_API_KEY;
const llmModel = process.env.LLM_MODEL || 'gpt-4o';

function serveStatic(req, res) {
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    const ext = path.extname(filePath);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('404 Not Found');
            return;
        }
        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
        res.end(data);
    });
}

function handleGetConfig(req, res) {
    const configured = !!(llmEndpoint && llmApiKey && llmApiKey !== 'your-api-key-here');
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
        configured,
        endpoint: configured ? llmEndpoint : '',
        model: configured ? llmModel : ''
    }));
}

async function handleLLMProxy(req, res) {
    if (!llmEndpoint || !llmApiKey || llmApiKey === 'your-api-key-here') {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: '请先配置 .env 文件中的 LLM_API_KEY' }));
        return;
    }

    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
        try {
            const { messages } = JSON.parse(body);
            console.log(`[LLM代理] 收到请求, 模型: ${llmModel}, 消息数: ${messages?.length || 0}`);

            const url = `${llmEndpoint.replace(/\/$/, '')}/chat/completions`;
            console.log(`[LLM代理] 转发请求到: ${url}`);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${llmApiKey}`
                },
                body: JSON.stringify({
                    model: llmModel,
                    messages: messages,
                    response_format: { type: 'json_object' }
                })
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => '');
                console.log(`[LLM代理] API错误: ${response.status}`);
                res.writeHead(response.status, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({
                    error: `API错误: ${response.status} ${response.statusText}${errorText ? ' - ' + errorText : ''}`
                }));
                return;
            }

            const data = await response.json();
            console.log(`[LLM代理] 请求成功`);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(data));
        } catch (error) {
            console.log(`[LLM代理] 异常: ${error.message}`);
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: `代理请求失败: ${error.message}` }));
        }
    });
}

async function handleTestConnection(req, res) {
    if (!llmEndpoint || !llmApiKey || llmApiKey === 'your-api-key-here') {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: '请先配置 .env 文件中的 LLM_API_KEY' }));
        return;
    }

    try {
        const url = `${llmEndpoint.replace(/\/$/, '')}/chat/completions`;
        console.log(`[LLM测试] 测试连接: ${url}`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${llmApiKey}`
            },
            body: JSON.stringify({
                model: llmModel,
                messages: [
                    { role: 'system', content: '你是一个助手。' },
                    { role: 'user', content: '回复"连接成功"四个字。' }
                ]
            })
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            console.log(`[LLM测试] 失败: ${response.status}`);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                success: false,
                error: `API错误: ${response.status} ${response.statusText}${errorText ? ' - ' + errorText : ''}`
            }));
            return;
        }

        console.log(`[LLM测试] 连接成功`);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true }));
    } catch (error) {
        console.log(`[LLM测试] 异常: ${error.message}`);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: `连接失败: ${error.message}` }));
    }
}

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'GET' && req.url === '/api/llm/config') {
        handleGetConfig(req, res);
    } else if (req.method === 'POST' && req.url === '/api/llm/chat') {
        handleLLMProxy(req, res);
    } else if (req.method === 'POST' && req.url === '/api/llm/test') {
        handleTestConnection(req, res);
    } else {
        serveStatic(req, res);
    }
});

server.listen(PORT, () => {
    const configured = !!(llmEndpoint && llmApiKey && llmApiKey !== 'your-api-key-here');
    console.log(`💊 用药提醒服务已启动`);
    console.log(`   本地访问: http://localhost:${PORT}`);
    console.log(`   LLM状态: ${configured ? '✅ 已配置 (' + llmModel + ')' : '⚠️ 未配置 (请编辑 .env 文件)'}`);
    if (configured) {
        console.log(`   LLM接口: ${llmEndpoint}`);
    }
});
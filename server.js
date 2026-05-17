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

async function handleLLMProxy(req, res) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
        try {
            const { endpoint, apiKey, model, messages } = JSON.parse(body);
            console.log(`[LLM代理] 收到请求 → ${model || 'gpt-4o'} @ ${endpoint}`);
            console.log(`[LLM代理] 消息数: ${messages?.length || 0}`);

            if (!endpoint || !apiKey) {
                console.log('[LLM代理] 错误: 缺少API地址或密钥');
                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: '缺少API地址或密钥' }));
                return;
            }

            const url = `${endpoint.replace(/\/$/, '')}/chat/completions`;
            console.log(`[LLM代理] 转发请求到: ${url.replace(apiKey, '***')}`);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: model || 'gpt-4o',
                    messages: messages,
                    response_format: { type: 'json_object' }
                })
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => '');
                console.log(`[LLM代理] API响应错误: ${response.status}`);
                res.writeHead(response.status, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({
                    error: `API错误: ${response.status} ${response.statusText}${errorText ? ' - ' + errorText : ''}`
                }));
                return;
            }

            const data = await response.json();
            console.log(`[LLM代理] 请求成功, 响应已返回`);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(data));
        } catch (error) {
            console.log(`[LLM代理] 异常: ${error.message}`);
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: `代理请求失败: ${error.message}` }));
        }
    });
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

    if (req.method === 'POST' && req.url === '/api/llm/chat') {
        handleLLMProxy(req, res);
    } else {
        console.log(`[静态文件] ${req.url}`);
        serveStatic(req, res);
    }
});

server.listen(PORT, () => {
    console.log(`💊 用药提醒服务已启动`);
    console.log(`   本地访问: http://localhost:${PORT}`);
    console.log(`   LLM代理:  http://localhost:${PORT}/api/llm/chat`);
});
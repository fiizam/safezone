import http from 'node:http'
import { spawn, exec } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'

const PORT = Number(process.env.REMOTE_UI_PORT || 3030)
const WORKDIR = process.cwd()

const envWithAgy = {
  ...process.env,
  PATH: `${path.join(os.homedir(), '.local', 'bin')}:${path.join(os.homedir(), '.gemini', 'bin')}:${process.env.PATH || ''}`
}

let isBusy = false
let hasConversation = false

const HTML_PAGE = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <title>Antigravity Mobile Remote</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans antialiased">
  <header class="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between sticky top-0 z-20">
    <div class="flex items-center gap-2.5">
      <span id="status-dot" class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
      <div>
        <h1 class="text-sm font-bold text-white leading-tight">Antigravity Mobile Remote</h1>
        <p class="text-[11px] text-slate-400">Kendali Penuh Proyek via HP (Tanpa Terminal Ribet)</p>
      </div>
    </div>
    <div class="flex items-center gap-1.5">
      <button onclick="runQuickCmd('status')" class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 border border-slate-700">
        Git Status
      </button>
      <button onclick="runQuickCmd('push')" class="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-[11px] font-bold text-white">
        Push GitHub
      </button>
    </div>
  </header>

  <main id="chat-box" class="flex-1 overflow-y-auto p-4 space-y-3 pb-36">
    <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1.5">
      <div class="font-bold text-emerald-400">Terhubung ke Mesin Cloud Antigravity (agy)</div>
      <p>Ketik perintah/prompt di kotak bawah seperti chat biasa. Antigravity akan langsung membaca file, mengedit kodingan proyek ini, dan menampilkan prosesnya secara real-time di layar HP lu.</p>
    </div>
  </main>

  <footer class="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 p-3 z-20">
    <form id="prompt-form" onsubmit="sendPrompt(event)" class="flex items-end gap-2 max-w-3xl mx-auto">
      <textarea
        id="prompt-input"
        rows="2"
        placeholder="Ketik perintah untuk Antigravity... (contoh: perbaiki tampilan navbar lalu push ke github)"
        class="flex-1 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:outline-none px-3.5 py-2.5 text-xs text-white placeholder-slate-500 resize-none"
        required
      ></textarea>
      <button
        id="send-btn"
        type="submit"
        class="h-[58px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs shrink-0 disabled:opacity-50"
      >
        Kirim
      </button>
    </form>
  </footer>

  <script>
    const chatBox = document.getElementById('chat-box');
    const promptInput = document.getElementById('prompt-input');
    const sendBtn = document.getElementById('send-btn');
    const statusDot = document.getElementById('status-dot');

    function appendBubble(role, text) {
      const div = document.createElement('div');
      if (role === 'user') {
        div.className = 'ml-auto max-w-[88%] p-3 rounded-2xl bg-emerald-700 text-white text-xs font-medium whitespace-pre-wrap';
      } else {
        div.className = 'mr-auto w-full p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed';
      }
      div.textContent = text;
      chatBox.appendChild(div);
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      return div;
    }

    async function sendPrompt(e) {
      e.preventDefault();
      const prompt = promptInput.value.trim();
      if (!prompt) return;

      promptInput.value = '';
      sendBtn.disabled = true;
      statusDot.className = 'w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse';

      appendBubble('user', prompt);
      const agentBubble = appendBubble('agent', 'Menjalankan Antigravity Agent...\\n');

      try {
        const res = await fetch('/api/prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let started = false;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          if (!started) {
            agentBubble.textContent = '';
            started = true;
          }
          agentBubble.textContent += chunk;
          window.scrollTo({ top: document.body.scrollHeight });
        }
      } catch (err) {
        agentBubble.textContent += '\\n[Error koneksi]: ' + err.message;
      } finally {
        sendBtn.disabled = false;
        statusDot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-400';
      }
    }

    async function runQuickCmd(action) {
      sendBtn.disabled = true;
      const bubble = appendBubble('agent', 'Menjalankan perintah ' + action + '...\\n');
      try {
        const res = await fetch('/api/quick?action=' + encodeURIComponent(action), { method: 'POST' });
        const data = await res.json();
        bubble.textContent = data.output || 'Selesai.';
      } catch (err) {
        bubble.textContent = 'Gagal: ' + err.message;
      } finally {
        sendBtn.disabled = false;
      }
    }
  </script>
</body>
</html>`

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)

  if (req.method === 'GET' && url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(HTML_PAGE)
    return
  }

  if (req.method === 'POST' && url.pathname === '/api/quick') {
    const action = url.searchParams.get('action')
    const cmd =
      action === 'push'
        ? 'git add -A && git commit -m "chore: update via Antigravity Mobile Remote" && git push origin main'
        : 'git status -s'

    exec(cmd, { cwd: WORKDIR, env: envWithAgy }, (err, stdout, stderr) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(
        JSON.stringify({
          ok: !err,
          output: [stdout, stderr, err ? err.message : ''].filter(Boolean).join('\n').trim() || 'Tidak ada perubahan file.'
        })
      )
    })
    return
  }

  if (req.method === 'POST' && url.pathname === '/api/prompt') {
    if (isBusy) {
      res.writeHead(429, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end('Antigravity masih mengerjakan perintah sebelumnya, tunggu sebentar...')
      return
    }

    let body = ''
    req.on('data', chunk => {
      body += chunk
    })
    req.on('end', () => {
      let prompt = ''
      try {
        prompt = JSON.parse(body).prompt || ''
      } catch {
        prompt = body
      }

      if (!prompt.trim()) {
        res.writeHead(400)
        res.end('Prompt kosong.')
        return
      }

      isBusy = true
      res.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache'
      })

      const args = hasConversation
        ? ['-c', '--dangerously-skip-permissions', '-p', prompt]
        : ['--dangerously-skip-permissions', '-p', prompt]

      const child = spawn('agy', args, {
        cwd: WORKDIR,
        env: envWithAgy
      })

      child.stdout.on('data', data => {
        res.write(data)
      })
      child.stderr.on('data', data => {
        res.write(data)
      })

      child.on('close', code => {
        isBusy = false
        if (code === 0) {
          hasConversation = true
        }
        res.write(`\n\n[Selesai dengan status ${code}]`)
        res.end()
      })

      child.on('error', err => {
        isBusy = false
        res.write(`\n[Gagal menjalankan agy: ${err.message}]`)
        res.end()
      })
    })
    return
  }

  res.writeHead(404)
  res.end('Not found')
})

server.listen(PORT, '0.0.0.0', () => {
  console.log('====================================================')
  console.log(`ANTIGRAVITY MOBILE WEB UI AKTIF DI PORT ${PORT}!`)
  console.log('Klik tombol "Open in Browser" yang muncul di layar HP,')
  console.log('atau buka tab "Pelabuhan / Ports" -> klik ikon bola dunia (Globe) pada port 3030.')
  console.log('====================================================')

  if (process.env.BROWSER) {
    exec(`"${process.env.BROWSER}" "http://localhost:${PORT}"`, () => {})
  }
})

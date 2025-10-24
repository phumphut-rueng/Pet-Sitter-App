import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>🐾 Pet Sitter • API & ERD Docs</title>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"/>
  <style>
    :root {
      --brand-orange: #FF7A00;
      --brand-pink:   #FF6F91;
      --bg:           #FAFAFA;
      --gray-1:       #F3F4F6;
      --gray-2:       #E5E7EB;
      --text:         #333;
    }
    html, body { margin:0; padding:0; background:var(--bg); color:var(--text); font-family: Inter, system-ui, sans-serif; }
    .topbar { display:none !important; }

    .wrap { max-width:1200px; margin:0 auto; padding:24px 16px 80px; }
    .title { font-size:2.25rem; font-weight:700; color:var(--brand-orange); text-align:center; margin-bottom:12px; }
    .subtitle { font-size:1rem; color:#666; text-align:center; margin-bottom:24px; }

    .tabs { display:flex; justify-content:center; gap:10px; margin-bottom:20px; flex-wrap:wrap; }
    .tab { padding:8px 18px; border:2px solid transparent; border-radius:9999px; font-weight:600; background:var(--gray-1); color:#555; cursor:pointer; transition:.2s; }
    .tab:hover { background:var(--gray-2); }
    .tab.active { background:var(--brand-orange); color:#fff; border-color:var(--brand-orange); box-shadow:0 2px 4px rgba(255,122,0,.2); }

    .panel { display:none; }
    .panel.active { display:block; }

    .erd-toolbar {
      display:flex; gap:8px; align-items:center; justify-content:space-between;
      background:#f6f7fb; padding:10px 14px; border-radius:12px; border:1px solid var(--gray-2); margin-bottom:10px;
    }
    .left, .right { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }

    .erd-btn {
      background:var(--brand-orange); border:none; color:#fff; font-weight:600; border-radius:9999px;
      padding:8px 14px; cursor:pointer; transition:.2s;
    }
    .erd-btn.secondary { background:#fff; color:#333; border:1px solid var(--gray-2); }
    .erd-btn.pink { background:var(--brand-pink); }
    .erd-btn:disabled { opacity:.5; cursor:not-allowed; }

    .zoom-chip { min-width:58px; text-align:center; font-weight:700; padding:6px 10px; border-radius:9999px; background:#fff; border:1px solid var(--gray-2); }
    .hint { color:#6b7280; font-size:12px; margin-left:8px; }

    .erd-frame-outer { border:1px solid var(--gray-2); border-radius:16px; background:#fff; height: calc(100vh - 220px); overflow:auto; }

    /* แสดง ERD ด้วย <img> (SVG) */
    .erd-frame { width:100%; height:auto; border:0; transform-origin: 0 0; display:block; transition: transform 0.2s ease; }

    /* พื้นที่ลากเลื่อน */
    .pannable { cursor: grab; }
    .pannable.grabbing { cursor: grabbing; }

    /* กันการ select ตอนลาก */
    .no-select { user-select: none; -webkit-user-select: none; -ms-user-select: none; }

    /* เมื่อ fullscreen: toolbar ลอยติดบน */
    .fullscreen-active .erd-toolbar {
      position: sticky; top: 0; background: rgba(255,255,255,0.9); backdrop-filter: blur(8px); z-index: 10;
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="title">🐾 Pet Sitter API Documentation</div>
    <div class="subtitle">Interactive API & Database Relationship Diagram (ERD)</div>

    <div class="tabs">
      <button id="tab-docs" class="tab active">📘 API Docs</button>
      <button id="tab-erd" class="tab">📊 Database ERD</button>
    </div>

    <div id="panel-docs" class="panel active">
      <div id="swagger-ui"></div>
    </div>

    <div id="panel-erd" class="panel">
      <div class="erd-toolbar">
        <div class="left">
          <button id="zoom-out" class="erd-btn secondary" title="Zoom Out">–</button>
          <span id="zoom-level" class="zoom-chip">100%</span>
          <button id="zoom-in" class="erd-btn" title="Zoom In">+</button>
          <button id="zoom-reset" class="erd-btn secondary" title="Reset to 100%">100%</button>
          <span class="hint">🧭 ใช้ปุ่มซูม • Fullscreen รองรับ Ctrl/⌘ + / − / 0</span>
        </div>
        <div class="right">
          <button id="fullscreen" class="erd-btn secondary" title="Fullscreen">🔍 Fullscreen</button>
          <button id="reload-erd" class="erd-btn" title="Reload ERD">Reload</button>
          <a href="/api/erd" target="_blank" rel="noopener" class="erd-btn pink" title="Open in new tab">Open in New Tab</a>
        </div>
      </div>

      <div id="erd-outer" class="erd-frame-outer pannable">
        <img id="erd-img" class="erd-frame" src="/api/erd" alt="Database ERD (SVG)" draggable="false"/>
      </div>
    </div>
  </div>

  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    // Swagger init
    const ui = SwaggerUIBundle({ url: '/api/docs-json', dom_id: '#swagger-ui' });
    const $ = (s) => document.querySelector(s);

    // Tabs
    const tabDocs = $('#tab-docs'), tabErd = $('#tab-erd');
    const panelDocs = $('#panel-docs'), panelErd = $('#panel-erd');
    function activate(which){
      [tabDocs, tabErd].forEach(el => el.classList.remove('active'));
      [panelDocs, panelErd].forEach(el => el.classList.remove('active'));
      if (which === 'erd') { tabErd.classList.add('active'); panelErd.classList.add('active'); }
      else { tabDocs.classList.add('active'); panelDocs.classList.add('active'); }
    }
    tabDocs.onclick = () => activate('docs');
    tabErd.onclick  = () => activate('erd');

    // ===== ERD controls =====
    const outer = document.getElementById('erd-outer');
    const erdImg = document.getElementById('erd-img');
    const zoomLevel = document.getElementById('zoom-level');

    let zoom = 1;      // normal tab zoom
    let fsZoom = 1;    // fullscreen zoom (emulated Ctrl+/Ctrl-)
    let isFullscreen = false;

    function applyZoomNormal() {
      erdImg.style.transform = 'scale(' + zoom + ')';
      zoomLevel.textContent = Math.round((isFullscreen ? fsZoom : zoom) * 100) + '%';
    }
    function applyZoomFullscreen() {
      erdImg.style.transform = 'scale(' + fsZoom + ')';
      zoomLevel.textContent = Math.round(fsZoom * 100) + '%';
    }

    // Buttons
    document.getElementById('zoom-in').onclick    = () => { if (isFullscreen) { fsZoom = Math.min(fsZoom + 0.1, 4); applyZoomFullscreen(); } else { zoom = Math.min(zoom + 0.1, 4); applyZoomNormal(); } };
    document.getElementById('zoom-out').onclick   = () => { if (isFullscreen) { fsZoom = Math.max(fsZoom - 0.1, 0.3); applyZoomFullscreen(); } else { zoom = Math.max(zoom - 0.1, 0.3); applyZoomNormal(); } };
    document.getElementById('zoom-reset').onclick = () => { if (isFullscreen) { fsZoom = 1; applyZoomFullscreen(); } else { zoom = 1; applyZoomNormal(); } };

    document.getElementById('reload-erd').onclick = () => {
      erdImg.src = '/api/erd?ts=' + Date.now(); // cache-bust
    };

    // Fullscreen toggle
    const fullscreenBtn = document.getElementById('fullscreen');
    fullscreenBtn.onclick = async () => {
      if (!document.fullscreenElement) {
        await outer.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    };
    document.addEventListener('fullscreenchange', () => {
      isFullscreen = !!document.fullscreenElement;
      document.body.classList.toggle('fullscreen-active', isFullscreen);
      if (isFullscreen) applyZoomFullscreen(); else applyZoomNormal();
    });

    // Emulate Ctrl/⌘ + / − / 0 in fullscreen
    document.addEventListener('keydown', (e) => {
      if (!isFullscreen) return;
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;
      const key = e.key;
      if (key === '+' || key === '=') {
        fsZoom = Math.min(fsZoom + 0.1, 4); applyZoomFullscreen(); e.preventDefault();
      } else if (key === '-' || key === '_') {
        fsZoom = Math.max(fsZoom - 0.1, 0.3); applyZoomFullscreen(); e.preventDefault();
      } else if (key === '0') {
        fsZoom = 1; applyZoomFullscreen(); e.preventDefault();
      }
    });

    // Ctrl + wheel = zoom (fullscreen only)
    outer.addEventListener('wheel', (e) => {
      if (!isFullscreen) return;
      if (!e.ctrlKey) return;
      e.preventDefault();
      fsZoom += (e.deltaY < 0 ? 0.1 : -0.1);
      fsZoom = Math.max(0.3, Math.min(fsZoom, 4));
      applyZoomFullscreen();
    }, { passive: false });

    // ===== Drag to pan (Pointer Events): ลากได้เฉพาะตอน "กดค้าง" =====
    (function enablePanning(){
      let isPanning = false;
      let startX = 0, startY = 0;
      let startScrollLeft = 0, startScrollTop = 0;
      let spaceDown = false; // Space-drag บน outer

      function beginPan(e) {
        // เฉพาะ mouse-left / touch / pen
        if (e.pointerType === 'mouse' && e.button !== 0) return;

        isPanning = true;
        startX = e.clientX; startY = e.clientY;
        startScrollLeft = outer.scrollLeft; startScrollTop = outer.scrollTop;

        outer.classList.add('grabbing', 'no-select');
        try { outer.setPointerCapture(e.pointerId); } catch {}
      }

      function doPan(e) {
        if (!isPanning) return;

        // ถ้าเป็นเมาส์และปล่อยปุ่มแล้ว ให้เลิกโหมดลากทันที
        if (e.pointerType === 'mouse' && e.buttons !== 1) {
          endPan(e);
          return;
        }

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        outer.scrollLeft = startScrollLeft - dx;
        outer.scrollTop  = startScrollTop  - dy;
        e.preventDefault();
      }

      function endPan(e) {
        if (!isPanning) return;
        isPanning = false;
        outer.classList.remove('grabbing', 'no-select');
        try { if (e && e.pointerId != null) outer.releasePointerCapture(e.pointerId); } catch {}
      }

      // เริ่มลากเมื่อ pointerdown บนภาพ
      erdImg.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        beginPan(e);
      });

      // เริ่มลากเมื่อ pointerdown บน outer แต่ต้องกด Space ค้าง
      outer.addEventListener('pointerdown', (e) => {
        if (!spaceDown) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        beginPan(e);
      });

      // ใช้ window เพื่อรับ move/up/cancel แม้ออกนอกกรอบ
      window.addEventListener('pointermove', doPan, { passive: false });
      window.addEventListener('pointerup', endPan);
      window.addEventListener('pointercancel', endPan);
      outer.addEventListener('pointerleave', (e) => { if (isPanning) endPan(e); });

      // Space-drag: กด Space เพื่อเปิดโหมดลากบน outer
      window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
          if (!spaceDown) {
            spaceDown = true;
            // กัน Space ทำให้หน้าเลื่อน
            if (document.activeElement === document.body) e.preventDefault();
          }
        }
      });
      window.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
          spaceDown = false;
        }
      });

      // Shift + wheel => แนวนอน (ยกเว้นขณะ Ctrl+wheel ที่ไว้ซูมใน fullscreen)
      outer.addEventListener('wheel', (e) => {
        if (e.shiftKey && !e.ctrlKey) {
          outer.scrollLeft += e.deltaY;
          e.preventDefault();
        }
      }, { passive: false });

      // ปิด default drag ของรูป
      erdImg.addEventListener('dragstart', (e) => e.preventDefault());
    })();

    // รักษาค่า zoom หลังโหลดรูปใหม่
    erdImg.addEventListener('load', () => { if (isFullscreen) applyZoomFullscreen(); else applyZoomNormal(); });

    // init
    applyZoomNormal();
  </script>
</body>
</html>`;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
}

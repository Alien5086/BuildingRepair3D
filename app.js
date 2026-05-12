/**
 * 🚀 app.js - 2D 平面圖控制與 3D 聯動邏輯 (V13.30 黃金備份版)
 * 📍 完全復原自 app.js.old 的精確點位與逆時針邏輯
 */

// 📍 各樓層設備點位資料庫
const FLOOR_MARKERS = {
  // === 圓樓 (D棟) 1F - 均勻散佈全圓 (101-117) ===
  "round_0": [
    { id: '109', x: 65.5, y: 33.5 }, { id: '108', x: 69.5, y: 37.5 }, { id: '107', x: 72.0, y: 42.0 }, { id: '106', x: 73.0, y: 47.5 },
    { id: '105', x: 73.0, y: 52.5 }, { id: '103', x: 71.5, y: 57.5 }, { id: '102', x: 68.5, y: 62.5 }, { id: '101', x: 59.20, y: 68.75 },
    { id: '117', x: 42.71, y: 68.75 }, { id: '116', x: 32.5, y: 57.5 }, { id: '115', x: 29.5, y: 52.5 }, { id: '113', x: 29.5, y: 47.5 },
    { id: '112', x: 30.5, y: 42.0 }, { id: '111', x: 33.5, y: 37.5 }, { id: '110', x: 37.0, y: 33.5 },
    { id: '⚡ 配電箱 D1-A', x: 60.81, y: 29.05 }, { id: '⚡ 配電箱 D1-B', x: 61.77, y: 64.36 },
    { id: '⚡ 配電箱 D1-C', x: 40.63, y: 64.03 }, { id: '⚡ 配電箱 D1-D', x: 42.38, y: 29.13 }
  ],

  // === 圓樓 (D棟) 2F - 完美的 201-238 逆時針排列 ===
  "round_1": (function() {
    const cx = 51.3, cy = 49.16, rx = 24.1, ry = 23.18;
    const rooms = [
      { id: '201', angle: 138 }, { id: '202', angle: 132 }, { id: '203', angle: 126 },
      { id: '205', angle: 120 }, { id: '206', angle: 114 }, { id: '207', angle: 108 },
      { id: '208', angle: 102 }, { id: '209', angle: 96 }, { id: '210', angle: 90 },
      { id: '211', angle: 84 }, { id: '212', angle: 77.5 }, { id: '213', angle: 72 },
      { id: '215', angle: 65.5 }, { id: '216', angle: 59 }, { id: '217', angle: 52 },
      { id: '218', angle: 46 }, { id: '219', x: 66.80, y: 31.65 }, { id: '220', angle: 320 },
      { id: '221', angle: 313 }, { id: '222', angle: 307 }, { id: '223', angle: 301 },
      { id: '225', angle: 295 }, { id: '226', angle: 289 }, { id: '227', angle: 283 },
      { id: '228', angle: 276 }, { id: '229', angle: 270 }, { id: '230', angle: 265 },
      { id: '231', angle: 258 }, { id: '232', angle: 252 }, { id: '233', angle: 246 },
      { id: '235', angle: 240 }, { id: '236', angle: 235 }, { id: '237', angle: 229 },
      { id: '238', angle: 223 }, { id: '200聯誼室', x: 59.31, y: 70.92 }, { id: '239貴賓室', x: 42.97, y: 71.66 },
      { id: '⚡ 配電箱 D2-A', x: 61.94, y: 28.63 }, { id: '⚡ 配電箱 D2-B', x: 62.43, y: 68.67 },
      { id: '⚡ 配電箱 D2-C', x: 39.22, y: 68.50 }, { id: '⚡ 配電箱 D2-D', x: 41.54, y: 28.38 }
    ];
    return rooms.map(m => {
      if (m.x !== undefined) return m;
      const angle = m.angle * Math.PI / 180;
      return { id: m.id, x: cx + rx * Math.sin(angle), y: cy - ry * Math.cos(angle) };
    });
  })(),

  // === 主殿 (A棟) ===
  "main_hall_0": [ { id: "1F大廳", x: 50, y: 50 }, { id: "⚡ 配電箱 A1", x: 32.80, y: 28.64 } ],
  "main_hall_1": [ { id: "母堂", x: 50, y: 50 }, { id: "⚡ 配電箱 A2", x: 32.62, y: 29.28 } ],
  "main_hall_2": [ { id: "穹頂", x: 49.67, y: 49.09 }, { id: "⚡ 配電箱 A3", x: 32.81, y: 29.44 } ],
  "main_hall_3": [ { id: "頂樓機房", x: 50, y: 38.75 }, { id: "⚡ 配電箱 A4", x: 51, y: 28.06 } ],

  // === 地宮 (B1) ===
  "basement_0": [ 
    { id: "宴會廳", x: 50.33, y: 29.04 }, 
    { id: "廚房", x: 44.98, y: 30.96 },
    { id: "地下室", x: 50.75, y: 66.68 },
    { id: "⚡ 宴會廳配電箱", x: 37.90, y: 27.42 },
    { id: "⚡ 廚房配電箱", x: 37.80, y: 33.20 },
    { id: "⚡ 地下室配電箱", x: 32.68, y: 67.35 }
  ],

  // === 東西側殿 (B, C棟) ===
  "east_0": [ { id: "B1教室", x: 50, y: 58.44 }, { id: "⚡ 配電箱 B1", x: 41.87, y: 31.90 } ],
  "east_1": [ { id: "B2教室", x: 50, y: 58.44 }, { id: "⚡ 配電箱 B2", x: 40.82, y: 31.74 } ],
  "west_0": [ { id: "C1教室", x: 50, y: 58.44 }, { id: "⚡ 配電箱 C1", x: 58.07, y: 31.65 } ],
  "west_1": [ { id: "C2教室", x: 50, y: 58.44 }, { id: "⚡ 配電箱 C2", x: 57.66, y: 31.74 } ]
};

// 🗺️ 各樓層導航清單
const ALL_FLOORS = [
  { name: "圓樓 1F", bid: "round", idx: 0, img: "plan.png" },
  { name: "圓樓 2F", bid: "round", idx: 1, img: "plan02.png" },
  { name: "主殿 1F", bid: "main_hall", idx: 0, img: "plan08.png" },
  { name: "主殿 2F", bid: "main_hall", idx: 1, img: "plan09.png" },
  { name: "主殿 3F", bid: "main_hall", idx: 2, img: "plan10.png" },
  { name: "東側殿 1F", bid: "east", idx: 0, img: "plan03.png" },
  { name: "東側殿 2F", bid: "east", idx: 1, img: "plan05.png" },
  { name: "西側殿 1F", bid: "west", idx: 0, img: "plan04.png" },
  { name: "西側殿 2F", bid: "west", idx: 1, img: "plan06.png" },
  { name: "地宮", bid: "basement", idx: 0, img: "plan07.png" }
];

window.renderFloorTabs = function(activeBid, activeIdx) {
  const container = document.getElementById('floor-tabs');
  if (!container) return;
  container.innerHTML = '';
  
  ALL_FLOORS.forEach(f => {
    const btn = document.createElement('button');
    btn.textContent = f.name;
    btn.style.padding = "6px 14px";
    btn.style.borderRadius = "20px";
    btn.style.border = "none";
    btn.style.cursor = "pointer";
    btn.style.fontWeight = "bold";
    btn.style.fontSize = "0.9rem";
    btn.style.transition = "all 0.2s";
    
    let isActive = false;
    if (activeBid === f.bid && activeIdx === f.idx) isActive = true;
    if (activeBid === 'main_hall' && activeIdx === -1 && f.bid === 'basement') isActive = true;
    
    if (isActive) {
      btn.style.background = "#10b981"; // 綠色高亮
      btn.style.color = "white";
      btn.style.boxShadow = "0 0 10px rgba(16, 185, 129, 0.5)";
    } else {
      btn.style.background = "rgba(255,255,255,0.1)";
      btn.style.color = "#cbd5e1";
    }
    
    btn.onmouseover = () => { if(!isActive) btn.style.background = "rgba(255,255,255,0.2)"; };
    btn.onmouseout = () => { if(!isActive) btn.style.background = "rgba(255,255,255,0.1)"; };
    
    btn.onclick = (e) => {
      e.stopPropagation();
      window.exitTS(); // 切換樓層時關閉任何進行中的導引
      document.getElementById('floor-tabs').style.display = 'none'; // 選取後自動收起選單
      window.show2DPlan(f.img, f.name, "", f.bid, f.idx, true); // 保持為全局選單模式
    };
    
    container.appendChild(btn);
  });
};

// 🚀 模式一：由 3D 聯動開啟平面圖
window.show2DPlan = function(url, floorName, buildingName, bid, idx, isGlobalMenu = false) {
  const page2D = document.getElementById('page-2d');
  const planImg = document.getElementById('plan-img-2d');
  
  // 💡 控制是否顯示樓層切換按鈕 (只在點擊全局「切換平面圖」時顯示)
  const tabsWrapper = document.getElementById('floor-tabs-wrapper');
  if (tabsWrapper) {
    tabsWrapper.style.display = isGlobalMenu ? 'flex' : 'none';
  }
  
  if (page2D) {
    page2D.style.display = 'flex';
    page2D.style.opacity = '1';
  }

  if (planImg) {
    // 💡 核心修正：將 3D 使用的 ref 檔名自動映射到 2D 專用的 plan 檔名
    let displayUrl = url;
    if (url.includes('floor_plan_ref')) {
      const numMatch = url.match(/\d+/);
      const num = numMatch ? numMatch[0] : '';
      if (num === '03' || num === '05') displayUrl = 'plan03.png'; // 東側殿
      else if (num === '04' || num === '06') displayUrl = 'plan04.png'; // 西側殿
      else if (num === '07') displayUrl = 'plan07.png'; // 地宮
      else if (num === '08') displayUrl = 'plan08.png'; // 主殿 1F
      else if (num === '09') displayUrl = 'plan09.png'; // 主殿 2F
      else if (num === '10') displayUrl = 'plan10.png'; // 主殿 3F
      else if (url.includes('ref02')) displayUrl = 'plan02.png'; // 圓樓 2F
      else if (url.includes('ref')) displayUrl = 'plan.png'; // 圓樓 1F
    }
    
    planImg.src = 'assets/' + displayUrl;
    
    // 🚀 關鍵修正：如果是地宮圖 (plan07.png)，強制將 ID 修正為 basement_0
    let finalBid = bid;
    let finalIdx = idx;
    if (displayUrl === 'plan07.png') {
      finalBid = 'basement';
      finalIdx = 0;
    }
    
    renderFloorMarkers(finalBid, finalIdx);
    if(window.renderFloorTabs) window.renderFloorTabs(finalBid, finalIdx);
  }
};

// === ⚡ 故障排除導引邏輯系統 ===
const TS_TASKS = {
  "room-report": [
    { 
      type: "choice",
      text: "❓ <b>請勾選目前遇到的故障項目 (可多選)：</b>",
      options: [
        { id: "power", label: "🔌 電源完全不通" },
        { id: "light", label: "💡 電燈不亮" },
        { id: "ac", label: "❄️ 冷氣不能開" },
        { id: "fan", label: "🌀 電扇不能開" },
        { id: "network", label: "🌐 網路不能連接" }
      ]
    }
  ],
  "classroom-1f": [
    { 
      type: "choice",
      text: "❓ <b>請勾選目前遇到的故障項目 (可多選)：</b>",
      options: [
        { id: "power", label: "🔌 電源完全不通" },
        { id: "light", label: "💡 電燈不亮" },
        { id: "ac", label: "❄️ 冷氣不能開" },
        { id: "fan", label: "🌀 電扇不能開" },
        { id: "speaker", label: "🔊 藍芽音響沒反應" },
        { id: "network", label: "🌐 網路不能連接" }
      ]
    }
  ],
  "dist-box": [
    { text: "🚪 <b>步驟 1: 開啟外牆維修門</b><br>此門採隱藏式設計（與牆面一體），無需鑰匙。請尋找門邊緣的隱藏溝槽即可手動拉開。", anim: { folder: 'opena', prefix: 'opena', count: 3 } },
    { text: "🔓 <b>步驟 2: 開啟配電箱門</b><br>解除配電箱安全鎖，並緩慢拉開箱門。", anim: { folder: 'openb', prefix: 'openb', count: 5 } },
    { text: "🔍 <b>步驟 3: 尋找總開關</b><br>請對照下方結構圖，並在箱內尋找標示「{ID}」的電源總開關。", anim: { folder: 'dr1c', prefix: 'dr1c_', count: 2, manual: true } },
    { text: "🔄 <b>步驟 4: 開關復歸</b><br>確認接線無誤後，將開關扳回 ON 位置。", anim: { folder: 'switch', prefix: 'switch', count: 4 } },
    { text: "🔒 <b>步驟 5: 關閉配電箱門</b><br>維修完成，請確實將內層箱門關閉並上鎖。", anim: { folder: 'closeb', prefix: 'closeb', count: 4 } },
    { text: "🚪 <b>步驟 6: 關閉外牆門</b><br>請將建築外牆維修門關閉並確認鎖緊。", anim: { folder: 'opena', prefix: 'opena', count: 3, reverse: true } }
  ]
};

let curTSId = null;
let curTSStep = 0;
let curTSTasks = [];
let tsAnimInterval = null;

function getDistBoxFolder(id) {
  // ⚡ 智慧名稱轉換邏輯：將 "配電箱 D1-C" 轉換為 "dr1c"
  let name = id.replace('⚡', '').replace('配電箱', '').trim();
  
  // 處理標準編號 (D1-C -> dr1c, A1 -> dra1)
  let code = name.replace('-', '').toLowerCase();
  let targetFolder = 'dr' + code;

  // 🧪 測試期備援：目前只有 dr1c 完工，其餘暫時導向 dr1c 供 Demo 使用
  const readyFolders = ['dr1c']; 
  if (!readyFolders.includes(targetFolder)) {
    console.warn(`🚧 資料夾 ${targetFolder} 尚未就緒，暫時使用 dr1c 作為展示範本`);
    return 'dr1c';
  }
  
  return targetFolder;
}

window.startTS = function(id) {
  // 🚀 關鍵邏輯：點擊目標標籤自動接續流程
  const currentTask = (curTSTasks && curTSTasks.length > 0) ? curTSTasks[curTSStep] : null;
  if (currentTask) {
    if (currentTask.targetDist) {
      const targetDistId = getDistBoxForRoom(curTSId);
      if (id.includes(targetDistId)) {
        console.log("🎯 點擊目標配電箱標籤，自動進入操作流程");
        window.nextTS();
        return;
      }
    } else if (currentTask.targetDistBack) {
      if (id.trim() === curTSId.trim()) {
        console.log("🎯 點擊原房間標籤，自動進入回報流程");
        window.nextTS();
        return;
      }
    }
  }

  curTSId = id;
  curTSStep = 0;
  
  if (id.includes('配電箱')) {
    // 🎨 動態注入：根據 ID 換掉步驟 3 的圖片資料夾
    const folder = getDistBoxFolder(id);
    curTSTasks = TS_TASKS["dist-box"].map((t, i) => {
      if (i === 2) { // 步驟 3 是 index 2
        return { 
          ...t, 
          anim: { ...t.anim, folder: folder, prefix: folder + '_' } 
        };
      }
      return t;
    });
  } else if (id.includes('1F') || id.startsWith('1')) {
    curTSTasks = TS_TASKS["classroom-1f"];
  } else {
    curTSTasks = TS_TASKS["room-report"];
  }
  
  const panel = document.getElementById('ts-panel');
  const overlay = document.getElementById('ts-overlay');
  if (panel) {
    document.getElementById('ts-title').textContent = "維護導引 - " + id;
    panel.style.display = 'flex';
    if (overlay) overlay.style.display = 'block';
  }
  
  console.log(`⚡ 啟動導引: ${id}`);
  
  // 🎯 2D 標籤視覺高亮
  const markers = document.querySelectorAll('.room-marker');
  markers.forEach(m => {
    if (m.textContent.trim() === id.trim()) m.classList.add('marker-highlight');
    else m.classList.remove('marker-highlight');
  });
  
  updateTSUI();
};

function updateTSUI() {
  const content = document.getElementById('ts-content');
  const stepNum = document.getElementById('ts-step-num');
  const btnPrev = document.getElementById('ts-btn-prev');
  const btnNext = document.getElementById('ts-btn-next');
  
  if (!content || !stepNum || !btnNext || !btnPrev) return;

  const currentTask = curTSTasks[curTSStep];
  stepNum.textContent = `${curTSStep + 1}/${curTSTasks.length}`;
  
  // 💡 自動動態注入房間 ID
  let displayText = currentTask.text.replace('{ID}', curTSId);
  
  const panel = document.getElementById('ts-panel');
  const navBar = document.getElementById('ts-nav-bar');
  const navText = document.getElementById('ts-nav-text');
  const overlay = document.getElementById('ts-overlay');

  // 🗳️ 處理勾選清單 UI
  if (currentTask.type === 'choice') {
    panel.style.display = 'flex';
    if (navBar) navBar.style.display = 'none';
    if (overlay) overlay.style.display = 'block';
    
    let html = `<div class="ts-choice-container">`;
    currentTask.options.forEach(opt => {
      html += `
        <label class="ts-choice-item">
          <input type="checkbox" name="ts-issue" value="${opt.id}">
          <span>${opt.label}</span>
        </label>
      `;
    });
    html += `</div>`;
    content.innerHTML = displayText + html;
  } else if (currentTask.targetDist || currentTask.targetDistBack) {
    // 🚀 路線指引模式：收起大面板，顯示懸浮導航條以利看地圖
    panel.style.display = 'none';
    if (overlay) overlay.style.display = 'none'; 
    if (navBar) {
      navBar.style.display = 'flex';
      const distId = getDistBoxForRoom(curTSId);
      if (distId) {
        displayText = displayText.replace('{DIST_ID}', distId);
        
        let targetId = currentTask.targetDist ? distId : curTSId;
        let startId = currentTask.targetDist ? curTSId : distId;
        
        // 💡 智慧避讓系統：偵測終點位置，自動將導航條放至另一端
        let destY = 50;
        for (const key in FLOOR_MARKERS) {
          const t = FLOOR_MARKERS[key].find(m => String(m.id).trim() === targetId);
          if (t) { destY = t.y; break; }
        }
        
        if (destY < 50) {
          // 終點在上半部 -> 導航條躲到下面
          navBar.style.top = 'auto';
          navBar.style.bottom = '10vh';
        } else {
          // 終點在下半部 -> 導航條躲到上面
          navBar.style.bottom = 'auto';
          navBar.style.top = '10vh';
        }
        
        setTimeout(() => { if (window.drawUltimateArcPath) window.drawUltimateArcPath(startId, targetId); }, 100);
      }
      navText.innerHTML = displayText;
    }
  } else {
    // 💡 一般步驟模式
    panel.style.display = 'flex';
    if (overlay) overlay.style.display = 'block';
    if (navBar) navBar.style.display = 'none';
    
    clearGuidePath();
    content.innerHTML = displayText;
  }
  
  // 🎬 處理動畫播放
  stopTSAnim();
  if (currentTask.anim) {
    playTSAnim(
      currentTask.anim.folder, 
      currentTask.anim.prefix, 
      currentTask.anim.count, 
      currentTask.anim.reverse || false,
      currentTask.anim.manual || false,
      currentTask.anim.labels || null
    );
  }

  btnPrev.style.opacity = (curTSStep === 0) ? '0.3' : '1';
  btnPrev.style.pointerEvents = (curTSStep === 0) ? 'none' : 'auto';
  
  btnNext.textContent = (curTSStep === curTSTasks.length - 1) ? '完成並離開' : '下一步';
}

function playTSAnim(folder, prefix, count, reverse = false, manual = false, labels = null) {
  const media = document.getElementById('ts-media');
  if (!media) return;
  
  // 🕒 步驟 1: 顯示局部 Loading 畫面，防止黑屏
  media.style.display = 'flex';
  media.innerHTML = `
    <div class="ts-loader-container" style="display:flex; flex-direction:column; align-items:center; gap:15px;">
      <div class="ts-spinner" style="width:40px; height:40px; border:3px solid rgba(255,255,255,0.1); border-top-color:#10b981; border-radius:50%; animation:ts-spin 1s linear infinite;"></div>
      <div style="color:#94a3b8; font-size:0.85rem;">圖片載入中...</div>
    </div>
    <style>@keyframes ts-spin { to { transform: rotate(360deg); } }</style>
  `;
  
  // 📦 步驟 2: 背景預載所有幀
  const frames = [];
  for (let i = 1; i <= count; i++) {
    frames.push(`assets/${folder}/${prefix}0${i}.png`);
  }

  const preloadPromises = frames.map(src => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve; // 就算失敗也繼續，防止卡死
      img.src = src;
    });
  });

  Promise.all(preloadPromises).then(() => {
    // 🎬 步驟 3: 載入完成，切換 UI
    if (manual) {
      let curFrame = 1;
      const updateManualUI = () => {
        media.innerHTML = `
          <div class="ts-manual-container" style="height:100%; width:100%; position:relative; display:flex; justify-content:center; align-items:center;">
            <img id="ts-anim-img" src="assets/${folder}/${prefix}0${curFrame}.png" style="width:100%; height:100%; object-fit:contain; border-radius:12px; background:#111;">
            <div class="ts-manual-selector" style="position:absolute; bottom:20px; left:50%; transform:translateX(-50%); display:flex; gap:15px; z-index:10;">
              ${Array.from({length: count}, (_, i) => {
                const f = i + 1;
                const btnLabel = (labels && labels[i]) ? labels[i] : `分頁 ${f}`;
                return `<button class="manual-btn ${curFrame === f ? 'active' : ''}" 
                          style="box-shadow:0 4px 20px rgba(0,0,0,0.6); backdrop-filter:blur(10px); background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.3);" 
                          onclick="window.setTSFrame(${f})">${btnLabel}</button>`;
              }).join('')}
            </div>
          </div>
        `;
      };
      window.setTSFrame = (f) => {
        curFrame = f;
        updateManualUI();
      };
      updateManualUI();
      return;
    }

    let frame = reverse ? count : 1;
    media.innerHTML = `<img id="ts-anim-img" src="assets/${folder}/${prefix}0${frame}.png" style="width:100%; height:100%; object-fit:contain; border-radius:12px; background:#111;">`;
    
    clearInterval(tsAnimInterval);
    tsAnimInterval = setInterval(() => {
      if (reverse) {
        frame = frame > 1 ? frame - 1 : count;
      } else {
        frame = (frame % count) + 1;
      }
      const img = document.getElementById('ts-anim-img');
      if (img) img.src = `assets/${folder}/${prefix}0${frame}.png`;
    }, 1000);
  });
}

function stopTSAnim() {
  clearInterval(tsAnimInterval);
  const media = document.getElementById('ts-media');
  if (media) {
    media.style.display = 'none';
    media.innerHTML = '';
  }
}

window.nextTS = function() {
  const currentTask = curTSTasks[curTSStep];
  
  // 💡 處理問題勾選邏輯
  if (currentTask.type === 'choice') {
    const selected = Array.from(document.querySelectorAll('input[name="ts-issue"]:checked')).map(i => i.value);
    if (selected.length === 0) {
      alert("請至少勾選一個遇到的問題！");
      return;
    }
    generateDynamicTasks(selected);
  }

  if (curTSStep < curTSTasks.length - 1) {
    curTSStep++;
    updateTSUI();
  } else {
    exitTS();
  }
};

function generateDynamicTasks(selected) {
  const newTasks = [];
  let step = 2;

  // 1. 房間內總電源開關檢查 (大部分問題的第一步)
  if (selected.some(s => ["power", "light", "ac", "fan", "speaker"].includes(s))) {
    newTasks.push({ 
      text: `🚪 <b>步驟 ${step++}: 房間內總電源確認</b><br>請先確認房間內的【總開關箱】或壁面【總電源開關】是否已切換至 ON。`,
      anim: { folder: 'switch', prefix: 'allswitch', count: 2, manual: true }
    });
  }

  // 2. 配電箱歸復與內部流程 (如果室內檢查後仍無反應)
  if (selected.some(s => ["power", "light", "ac", "fan"].includes(s))) {
    newTasks.push({ 
      text: `🚀 <b>步驟 ${step++}: 前往走廊配電箱歸復</b><br>若室內開關正常但仍無反應，請依循發光軌跡前往「{DIST_ID}」檢查區域斷路器。`, 
      targetDist: true 
    });
    
    // 🔗 無縫銜接配電箱的 6 個操作步驟
    const distTasks = TS_TASKS["dist-box"].map(t => ({
      ...t, 
      text: t.text.replace(/步驟 \d+:/, `步驟 ${step++}:`)
    }));
    // 💡 確保操作者知道要按下一步來觸發返回邏輯
    distTasks[distTasks.length - 1].text += `<br><br><span style="color:#fbbf24; font-size:0.95rem;">💡 操作完畢後，請點擊「下一步」循原路返回教室確認。</span>`;
    newTasks.push(...distTasks);
    
    // 🚶 走回房間確認
    newTasks.push({ 
      text: `🚶 <b>步驟 ${step++}: 走回原處確認</b><br>配電箱已復歸完成，請循原路返回「{ID}」，確認設備是否已恢復供電。`,
      targetDistBack: true 
    });
  }

  // 3. 網路單獨步驟
  if (selected.includes("network")) {
    newTasks.push({ text: `🌐 <b>步驟 ${step++}: 網路資訊座檢查</b><br>請檢查牆面網路孔接線，確認資訊座燈號是否有閃爍。` });
  }

  // 4. 音響單獨步驟
  if (selected.includes("speaker")) {
    newTasks.push({ text: `🔊 <b>步驟 ${step++}: 藍芽音響配對檢查</b><br>確認音響電源燈是否亮起，並長按配對鍵嘗試重新進行藍芽連線。` });
  }

  // 5. 結尾
  newTasks.push({ text: `📝 <b>最後步驟: 故障記錄提交</b><br>請確認設備是否已成功恢復。若仍無法解決問題，請拍照並詳細描述故障現象後點擊提交回報。` });

  // 替換任務清單（保留第一步，後面接動態生成的）
  curTSTasks = [curTSTasks[0], ...newTasks];
}

window.prevTS = function() {
  if (curTSStep > 0) {
    curTSStep--;
    updateTSUI();
  }
};

window.exitTS = function() {
  clearGuidePath(); // 🌟 退出時清除路線
  const panel = document.getElementById('ts-panel');
  const overlay = document.getElementById('ts-overlay');
  const navBar = document.getElementById('ts-nav-bar');
  if (panel) panel.style.display = 'none';
  if (overlay) overlay.style.display = 'none';
  if (navBar) navBar.style.display = 'none';
  
  const markers = document.querySelectorAll('.room-marker');
  markers.forEach(m => m.classList.remove('marker-highlight'));
  
  if (curTSStep === curTSTasks.length - 1 && curTSId) {
    // 💡 只有在最後一步完成時才彈出提示
    alert(`✅ ${curTSId} 維修導引已完成 V13.57。全體門窗已鎖緊，系統狀態正常。`);
    curTSId = null;
  }
};

// === 🚀 路線指引核心 Helper 函式 ===

function getDistBoxForRoom(roomId) {
  let room = null;
  let floorKey = "";
  for (const key in FLOOR_MARKERS) {
    const found = FLOOR_MARKERS[key].find(m => m.id === roomId);
    if (found) { room = found; floorKey = key; break; }
  }
  if (!room) return null;

  const distBoxes = FLOOR_MARKERS[floorKey].filter(m => m.id.includes('配電箱'));
  if (distBoxes.length === 0) return null;

  let nearest = distBoxes[0];
  let minDist = Infinity;
  distBoxes.forEach(db => {
    const d = Math.sqrt(Math.pow(db.x - room.x, 2) + Math.pow(db.y - room.y, 2));
    if (d < minDist) { minDist = d; nearest = db; }
  });
  return nearest.id;
}

window.drawUltimateArcPath = function(fromId, toId) {
  const container = document.querySelector('.plan-container-2d');
  const svg = document.getElementById('path-svg');
  if (!container || !svg) return;

  svg.style.zIndex = "100000"; 
  svg.style.display = "block";

  let fId = String(fromId || "").trim();
  let tId = String(toId || "").trim();
  
  let rx1, ry1, rx2, ry2, floorKey = "";
  
  // 🚀 V13.90 終極物理座標重寫與 UI 標識
  const debugHeader = document.querySelector('.logo-group h1 span');
  if (debugHeader) {
    debugHeader.style.background = "#fd7e14"; // 恢復橘色
    debugHeader.innerText = "V13.90 - 直覺導航優化版";
  }

  const COORD_OVERRIDE = {
    "115": { x: 30.5, y: 52.5 },
    "116": { x: 32.5, y: 57.5 },
    "105": { x: 72.0, y: 52.5 },
    "106": { x: 72.0, y: 47.5 }
  };

  for (const key in FLOOR_MARKERS) {
    const f = FLOOR_MARKERS[key].find(m => String(m.id).trim() === fId);
    if (f && rx1 === undefined) { 
      rx1 = COORD_OVERRIDE[fId] ? COORD_OVERRIDE[fId].x : f.x; 
      ry1 = COORD_OVERRIDE[fId] ? COORD_OVERRIDE[fId].y : f.y; 
      floorKey = key; 
    }
    const t = FLOOR_MARKERS[key].find(m => String(m.id).trim() === tId);
    if (t && rx2 === undefined) { 
      rx2 = COORD_OVERRIDE[tId] ? COORD_OVERRIDE[tId].x : t.x; 
      ry2 = COORD_OVERRIDE[tId] ? COORD_OVERRIDE[tId].y : t.y; 
    }
  }

  if (rx1 === undefined || rx2 === undefined) {
    const markers = document.querySelectorAll('.room-marker');
    markers.forEach(el => {
      const txt = el.textContent.trim();
      if (txt === fId && rx1 === undefined) {
        const r = el.getBoundingClientRect(); const c = container.getBoundingClientRect();
        rx1 = ((r.left + r.width/2 - c.left) / c.width) * 100;
        ry1 = ((r.top + r.height/2 - c.top) / c.height) * 100;
      }
      if (txt === tId && rx2 === undefined) {
        const r = el.getBoundingClientRect(); const c = container.getBoundingClientRect();
        rx2 = ((r.left + r.width/2 - c.left) / c.width) * 100;
        ry2 = ((r.top + r.height/2 - c.top) / c.height) * 100;
      }
    });
  }

  if (rx1 === undefined || isNaN(rx1)) return;

  let pathD = "";
  let startMarker = "";
  
  // 🎯 V13.91 智慧路徑分支：只有圓樓使用圓弧引導，其他建築使用直線導航
  const isRound = floorKey.startsWith('round'); 

  if (isRound) { 
    const C = { x: 51.3, y: 49.4 }; 
    const RX_CORRIDOR = 16.5; 
    const RY_CORRIDOR = 15.5; 
    
    // 🚀 核心改進：徑向出門邏輯
    // 計算起始點與終點的角度，強制 p1 與 p2 落在與起點/終點相同的放射線上
    const dx1 = rx1 - C.x; const dy1 = (ry1 - C.y) * (RX_CORRIDOR / RY_CORRIDOR);
    const dx2 = rx2 - C.x; const dy2 = (ry2 - C.y) * (RX_CORRIDOR / RY_CORRIDOR);
    const a1 = Math.atan2(dy1, dx1); const a2 = Math.atan2(dy2, dx2);
    
    // 這些是走廊上的對應點
    const p1 = { x: C.x + RX_CORRIDOR * Math.cos(a1), y: C.y + RY_CORRIDOR * Math.sin(a1) };
    const p2 = { x: C.x + RX_CORRIDOR * Math.cos(a2), y: C.y + RY_CORRIDOR * Math.sin(a2) };
    
    let angleDiff = a2 - a1;
    while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

    const steps = 100;
    let arcPoints = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps; const ang = a1 + angleDiff * t;
      arcPoints.push(`${C.x + RX_CORRIDOR * Math.cos(ang)} ${C.y + RY_CORRIDOR * Math.sin(ang)}`);
    }
    
    // 💡 組合路徑：從起點 -> 徑向走到走廊 -> 圓弧繞行 -> 徑向走到終點
    pathD = `M ${rx1} ${ry1} L ${p1.x} ${p1.y} L ${arcPoints.join(' L ')} L ${p2.x} ${p2.y} L ${rx2} ${ry2}`;
    
    startMarker = `<circle cx="${rx1}" cy="${ry1}" r="1.8" fill="#ffae00">
      <animate attributeName="r" values="1.8;3;1.8" dur="1.2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="1;0.4;1" dur="1.2s" repeatCount="indefinite" />
    </circle>`;
  } else {
    // 🏢 方形建築：簡潔的直線導航
    pathD = `M ${rx1} ${ry1} L ${rx2} ${ry2}`;
    startMarker = `<circle cx="${rx1}" cy="${ry1}" r="1.8" fill="#ffae00">
      <animate attributeName="r" values="1.8;3;1.8" dur="1.2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="1;0.4;1" dur="1.2s" repeatCount="indefinite" />
    </circle>`;
  }

  svg.innerHTML = `
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#ffae00" />
      </marker>
    </defs>
    ${startMarker}
    <path d="${pathD}" stroke="rgba(255, 174, 0, 0.3)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none" vector-effect="non-scaling-stroke" />
    <path d="${pathD}" stroke="#ffae00" stroke-width="4" stroke-dasharray="8, 5" fill="none" stroke-linejoin="round" marker-end="url(#arrowhead)" vector-effect="non-scaling-stroke">
      <animate attributeName="stroke-dashoffset" from="40" to="0" dur="1s" repeatCount="indefinite" />
    </path>
  `;

  document.querySelectorAll('.room-marker').forEach(m => {
    const txt = m.textContent.trim();
    if (txt === fId || txt === tId || (fId.includes('配電箱') && txt.includes(fId)) || (tId.includes('配電箱') && txt.includes(tId))) {
      m.classList.add('marker-highlight');
    } else {
      m.classList.remove('marker-highlight');
    }
  });
};

// 🖱️ 導航條拖拽功能
window.startDragNav = function(e) {
  const bar = document.getElementById('ts-nav-bar');
  const shiftX = e.clientX - bar.getBoundingClientRect().left;
  const shiftY = e.clientY - bar.getBoundingClientRect().top;

  function moveAt(pageX, pageY) {
    bar.style.left = pageX - shiftX + bar.offsetWidth/2 + 'px';
    bar.style.top = pageY - shiftY + 'px';
    bar.style.bottom = 'auto'; // 💡 拖曳時強制清除 bottom 鎖定
  }

  function onMouseMove(e) { moveAt(e.pageX, e.pageY); }
  document.addEventListener('mousemove', onMouseMove);
  document.onmouseup = function() {
    document.removeEventListener('mousemove', onMouseMove);
    document.onmouseup = null;
  };
};

function clearGuidePath() {
  const svg = document.getElementById('path-svg');
  if (svg) svg.innerHTML = '';
  document.querySelectorAll('.room-marker').forEach(m => m.classList.remove('marker-highlight'));
}

// 🥚 彩蛋：管理員模式 (連按標題 5 下)
let adminClickCount = 0;
let adminClickTimer = null;

window.handleAdminEasterEgg = function() {
  adminClickCount++;
  
  if (adminClickCount >= 5) {
    const btn = document.getElementById('admin-gui-btn');
    if (btn) {
      if (btn.style.display === 'none') {
        btn.style.display = 'flex';
        console.log("🔓 管理員模式已開啟！(顯示參數調校)");
      } else {
        btn.style.display = 'none';
        console.log("🔒 管理員模式已關閉！(隱藏參數調校)");
      }
    }
    adminClickCount = 0;
  }
  
  clearTimeout(adminClickTimer);
  adminClickTimer = setTimeout(() => {
    adminClickCount = 0;
  }, 1000); // 1秒內沒有連按就重置
}

// 🚀 模式二：退出平面圖回 3D
window.exitFloorView = function() {
  exitTS(); // 🌟 退出視圖時確保關閉導引面板
  const page2D = document.getElementById('page-2d');
  if (page2D) {
    page2D.style.opacity = '0';
    if (window.resetCameraFrom2D) window.resetCameraFrom2D();
    setTimeout(() => { page2D.style.display = 'none'; }, 500);
  }
};

function renderFloorMarkers(bid, idx) {
  // 🚀 終極攔截：防止 3D 傳回錯誤的 ID (將地宮誤認為大殿)
  const planImg = document.getElementById('plan-img-2d');
  let effectiveBid = bid;
  let effectiveIdx = idx;
  
  if (planImg && planImg.src.includes('plan07.png')) {
    effectiveBid = 'basement';
    effectiveIdx = 0;
    console.log("🛠️ ID 路由自動修正: main_hall_0 -> basement_0");
  }

  const container = document.getElementById('plan-markers-2d');
  const bContainer = document.getElementById('basement-markers');
  
  // ⚡ 強制清空所有可能的容器，防止舊標籤殘留
  if (container) container.innerHTML = '';
  if (bContainer) bContainer.innerHTML = '';

  const targetContainer = (effectiveBid === 'basement' && bContainer) ? bContainer : container;
  if (!targetContainer) return;
  
  const key = `${effectiveBid}_${effectiveIdx}`;
  const markers = FLOOR_MARKERS[key] || [];

  // 🚀 新增功能：雙擊空白處新增標籤
  targetContainer.ondblclick = (e) => {
    if (e.target !== targetContainer && e.target.tagName !== 'IMG') return;
    e.preventDefault(); e.stopPropagation();
    
    const rect = targetContainer.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const name = prompt('請輸入新標籤名稱：', '⚡ 新配電箱');
    if (name) {
      const newMarker = { id: name, x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(2)) };
      markers.push(newMarker);
      renderFloorMarkers(effectiveBid, effectiveIdx);
      console.log(`✨ [新增標籤] ${name} (${key})`, markers);
    }
  };

  markers.forEach(m => {
    const div = document.createElement('div');
    div.className = 'room-marker';
    if (m.id.includes('配電箱')) div.className += ' dist-box';
    div.style.left = m.x + '%';
    div.style.top = m.y + '%';
    div.innerHTML = m.id;
    div.dataset.id = m.id; // 🌟 新增 data-id 方便精準匹配
    div.onclick = (e) => {
      if (div.dataset.dragging === 'true') return;
      e.stopPropagation();

      // 🚀 更名功能：按住 Shift 鍵點擊即可更名
      if (e.shiftKey) {
        const newName = prompt('請輸入新名稱：', m.id);
        if (newName !== null && newName !== '') {
          m.id = newName;
          div.innerHTML = newName;
          if (newName.includes('配電箱')) div.classList.add('dist-box');
          else div.classList.remove('dist-box');
          
          console.log(`📝 [名稱已更新] ${m.id}`);
          console.log('✅ 請複製下方完整陣列交給 AI 更新：');
          console.log(JSON.stringify(markers, null, 2));
        }
        return;
      }

      console.log('📍 點擊設備：' + m.id);
      startTS(m.id);
    };

    // ... (保持其餘拖曳邏輯不變)

    // 🚀 2D 點位調校器功能：按住 Alt 鍵即可拖曳標籤
    let isDragging = false;
    div.onmousedown = (e) => {
      if (!e.altKey) return; // 💡 按住 Alt 鍵才啟動調校模式
      isDragging = true;
      div.dataset.dragging = 'true';
      e.preventDefault();
      
      const onMouseMove = (me) => {
        if (!isDragging) return;
        const rect = container.getBoundingClientRect();
        let newX = ((me.clientX - rect.left) / rect.width) * 100;
        let newY = ((me.clientY - rect.top) / rect.height) * 100;
        div.style.left = newX + '%';
        div.style.top = newY + '%';
        
        // 💡 如果是圓樓，計算角度供參考
        const cx = 51.3, cy = 48.5;
        const dx = newX - cx, dy = cy - newY;
        const angle = Math.atan2(dx, dy) * 180 / Math.PI;
        const finalAngle = angle < 0 ? angle + 360 : angle;
        
        console.log(`📍 [調校中] ${m.id} -> x: ${newX.toFixed(2)}, y: ${newY.toFixed(2)}, angle: ${finalAngle.toFixed(1)}`);
      };
      
      const onMouseUp = () => {
        isDragging = false;
        setTimeout(() => div.dataset.dragging = 'false', 100);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        console.log(`✅ [調校完成] 請複製此數值給 AI: { id: '${m.id}', angle: ${div.dataset.lastAngle || '...'} }`);
      };
      
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    };

    container.appendChild(div);
  });
}

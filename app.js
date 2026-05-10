/**
 * 🚀 app.js - 2D 平面圖控制與 3D 聯動邏輯 (V13.30 黃金備份版)
 * 📍 完全復原自 app.js.old 的精確點位與逆時針邏輯
 */

// 📍 各樓層設備點位資料庫
const FLOOR_MARKERS = {
  // === 圓樓 (D棟) 1F - 均勻散佈全圓 (101-117) ===
  "round_0": [
    { id: '109', x: 66.60, y: 19.26 }, { id: '108', x: 70.25, y: 26.22 }, { id: '107', x: 72.66, y: 34.62 }, { id: '106', x: 73.63, y: 44.61 },
    { id: '105', x: 74.09, y: 53.59 }, { id: '103', x: 71.94, y: 63.73 }, { id: '102', x: 69.08, y: 73.15 }, { id: '101', x: 59.70, y: 84.30 },
    { id: '117', x: 42.58, y: 84.30 }, { id: '116', x: 30.40, y: 64.75 }, { id: '115', x: 28.32, y: 55.19 }, { id: '113', x: 28.65, y: 44.32 },
    { id: '112', x: 29.95, y: 35.05 }, { id: '111', x: 32.68, y: 26.65 }, { id: '110', x: 36.13, y: 19.41 },
    { id: '⚡ 配電箱 D1-A', x: 60.81, y: 12.75 }, { id: '⚡ 配電箱 D1-B', x: 59.90, y: 76.04 },
    { id: '⚡ 配電箱 D1-C', x: 39.84, y: 76.19 }, { id: '⚡ 配電箱 D1-D', x: 42.38, y: 12.89 }
  ],

  // === 圓樓 (D棟) 2F - 完美的 201-238 逆時針排列 ===
  "round_1": (function() {
    const cx = 51.3, cy = 48.5, rx = 24.1, ry = 41.2;
    const rooms = [
      { id: '201', angle: 138 }, { id: '202', angle: 132 }, { id: '203', angle: 126 },
      { id: '205', angle: 120 }, { id: '206', angle: 114 }, { id: '207', angle: 108 },
      { id: '208', angle: 102 }, { id: '209', angle: 96 }, { id: '210', angle: 90 },
      { id: '211', angle: 84 }, { id: '212', angle: 77.5 }, { id: '213', angle: 72 },
      { id: '215', angle: 65.5 }, { id: '216', angle: 59 }, { id: '217', angle: 52 },
      { id: '218', angle: 46 }, { id: '219', x: 66.80, y: 17.38 }, { id: '220', angle: 320 },
      { id: '221', angle: 313 }, { id: '222', angle: 307 }, { id: '223', angle: 301 },
      { id: '225', angle: 295 }, { id: '226', angle: 289 }, { id: '227', angle: 283 },
      { id: '228', angle: 276 }, { id: '229', angle: 270 }, { id: '230', angle: 265 },
      { id: '231', angle: 258 }, { id: '232', angle: 252 }, { id: '233', angle: 246 },
      { id: '235', angle: 240 }, { id: '236', angle: 235 }, { id: '237', angle: 229 },
      { id: '238', angle: 223 }, { id: '200聯誼室', x: 59.31, y: 87.20 }, { id: '239貴賓室', x: 42.97, y: 88.50 },
      { id: '⚡ 配電箱 D2-A', x: 62.96, y: 13.18 }, { id: '⚡ 配電箱 D2-B', x: 61.46, y: 81.26 },
      { id: '⚡ 配電箱 D2-C', x: 40.82, y: 82.27 }, { id: '⚡ 配電箱 D2-D', x: 40.10, y: 12.31 }
    ];
    return rooms.map(m => {
      if (m.x !== undefined) return m;
      const angle = m.angle * Math.PI / 180;
      return { id: m.id, x: cx + rx * Math.sin(angle), y: cy - ry * Math.cos(angle) };
    });
  })(),

  // === 主殿 (A棟) ===
  "main_hall_0": [ { id: "1F大廳", x: 50, y: 50 }, { id: "⚡ 配電箱 A1", x: 32.80, y: 12.02 } ],
  "main_hall_1": [ { id: "母堂", x: 50, y: 50 }, { id: "⚡ 配電箱 A2", x: 32.62, y: 13.16 } ],
  "main_hall_2": [ { id: "穹頂", x: 49.67, y: 48.39 }, { id: "⚡ 配電箱 A3", x: 32.81, y: 13.45 } ],
  "main_hall_3": [ { id: "頂樓機房", x: 50, y: 30 }, { id: "⚡ 配電箱 A4", x: 51, y: 11 } ],

  // === 地宮 (B1) ===
  "basement_0": [ 
    { id: "宴會廳", x: 50.33, y: 17.98 }, 
    { id: "⚡ 宴會廳配電箱", x: 37.90, y: 9.85 },
    { id: "⚡ 廚房配電箱", x: 37.80, y: 20.13 },
    { id: "⚡ 地下室配電箱", x: 32.68, y: 80.85 }
  ],

  // === 東西側殿 (B, C棟) ===
  "east_0": [ { id: "B1教室", x: 50, y: 65 }, { id: "⚡ 配電箱 B1", x: 41.87, y: 17.82 } ],
  "east_1": [ { id: "B2教室", x: 50, y: 65 }, { id: "⚡ 配電箱 B2", x: 40.82, y: 17.53 } ],
  "west_0": [ { id: "C1教室", x: 50, y: 65 }, { id: "⚡ 配電箱 C1", x: 58.07, y: 17.38 } ],
  "west_1": [ { id: "C2教室", x: 50, y: 65 }, { id: "⚡ 配電箱 C2", x: 57.66, y: 17.53 } ]
};

// 🚀 模式一：由 3D 聯動開啟平面圖
window.show2DPlan = function(url, floorName, buildingName, bid, idx) {
  const page2D = document.getElementById('page-2d');
  const planImg = document.getElementById('plan-img-2d');
  
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
  }
};

// 🚀 模式二：退出平面圖回 3D
window.exitFloorView = function() {
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

      alert('📍 空間：' + m.id + '\n目前狀態：連線中\n故障排除模擬已就緒。');
    };

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

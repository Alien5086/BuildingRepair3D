/**
 * 🚀 app.js - 2D 平面圖控制與 3D 聯動邏輯 (點位與對稱運鏡版)
 */

// 📍 各樓層設備點位資料庫 (根據 app.js.old 原始手工數據恢復)
const FLOOR_MARKERS = {
  "round_0": (function() {
    const cx = 51.300000000000004, cy = 45.900000000000006, rx = 21.1, ry = 40.6;

    const rooms = [
      { id: '101', angle: 157 },
      { id: '102', angle: 128 },
      { id: '103', angle: 114 },
      { id: '105', angle: 101 },
      { id: '106', angle: 88 },
      { id: '107', angle: 76 },
      { id: '108', angle: 63 },
      { id: '109', angle: 47 },
      { id: '110', angle: 312 },
      { id: '111', angle: 297 },
      { id: '112', angle: 283 },
      { id: '113', angle: 271 },
      { id: '115', angle: 259 },
      { id: '116', angle: 246 },
      { id: '117', angle: 205 }
    ];

    return rooms.map(m => {
      const angle = m.angle * Math.PI / 180;
      return { id: m.id, x: cx + rx * Math.sin(angle), y: cy - ry * Math.cos(angle) };
    });
  })(),
  "round_1": (function() {
    const cx = 51.300000000000004, cy = 48.5, rx = 24.1, ry = 41.2;

    const rooms = [
      { id: '201', angle: 138 },
      { id: '202', angle: 132 },
      { id: '203', angle: 126 },
      { id: '205', angle: 120 },
      { id: '206', angle: 114 },
      { id: '207', angle: 108 },
      { id: '208', angle: 102 },
      { id: '209', angle: 96 },
      { id: '210', angle: 90 },
      { id: '211', angle: 84 },
      { id: '212', angle: 77.5 },
      { id: '213', angle: 72 },
      { id: '215', angle: 65.5 },
      { id: '216', angle: 59 },
      { id: '217', angle: 52 },
      { id: '218', angle: 46 },
      { id: '219', angle: 41 },
      { id: '220', angle: 320 },
      { id: '221', angle: 313 },
      { id: '222', angle: 307 },
      { id: '223', angle: 301 },
      { id: '225', angle: 295 },
      { id: '226', angle: 289 },
      { id: '227', angle: 283 },
      { id: '228', angle: 276 },
      { id: '229', angle: 270 },
      { id: '230', angle: 265 },
      { id: '231', angle: 258 },
      { id: '232', angle: 252 },
      { id: '233', angle: 246 },
      { id: '235', angle: 240 },
      { id: '236', angle: 235 },
      { id: '237', angle: 229 },
      { id: '238', angle: 223 },
      { id: '200聯誼室', angle: 160 },
      { id: '239貴賓室', angle: 200 }
    ];

    return rooms.map(m => {
      const angle = m.angle * Math.PI / 180;
      return { id: m.id, x: cx + rx * Math.sin(angle), y: cy - ry * Math.cos(angle) };
    });
  })(),
  "main_0": [{ id: "機房", x: 50, y: 50 }],
  "main_3": [
    { id: "頂樓機房", x: 50, y: 30 }, { id: "水箱間", x: 50, y: 70 }
  ],
  "east_1": [{ id: "B1-1", x: 40, y: 40 }, { id: "B1-2", x: 60, y: 60 }],
  "west_1": [{ id: "C1-1", x: 40, y: 40 }, { id: "C1-2", x: 60, y: 60 }]
};

// 🚀 模式一：專注模式 (由 3D 俯衝觸發)
window.show2DPlan = function(url, floorName, buildingName, bid, idx) {
  const page2D = document.getElementById('page-2d');
  const sceneContainer = document.getElementById('scene-container');
  const planImg = document.getElementById('plan-img-2d');

  if (page2D) {
    page2D.style.display = 'flex';
    page2D.style.opacity = '1';
  }

  if (planImg) {
    planImg.src = 'assets/' + url;
    // 🚀 渲染該樓層專屬點位
    renderFloorMarkers(bid, idx);
  }

  // 隱藏 3D 場景
  // if (sceneContainer) sceneContainer.style.opacity = '0';
};

// 🚀 模式二：退出平面圖回 3D
window.exitFloorView = function() {
  const page2D = document.getElementById('page-2d');
  const sceneContainer = document.getElementById('scene-container');

  if (page2D) {
    page2D.style.opacity = '0';
    // 🚀 即時恢復 3D 場景顯示
    // if (sceneContainer) sceneContainer.style.opacity = '1';
    if (window.resetCameraFrom2D) window.resetCameraFrom2D();

    setTimeout(() => {
      page2D.style.display = 'none';
    }, 500);
  }
};

// 🚀 渲染設備點位
function renderFloorMarkers(bid, idx) {
  const container = document.getElementById('plan-markers-2d');
  if (!container) return;
  container.innerHTML = '';
  
  const key = `${bid}_${idx}`;
  const markers = FLOOR_MARKERS[key] || [];
  
  markers.forEach(m => {
    const div = document.createElement('div');
    div.className = 'room-marker';
    div.style.left = m.x + '%';
    div.style.top = m.y + '%';
    div.innerHTML = m.id;
    div.onclick = (e) => {
      e.stopPropagation();
      alert('點擊了空間：' + m.id + '\n目前可進行故障排除模擬。');
    };
    container.appendChild(div);
  });
}

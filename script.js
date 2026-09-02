// ===== 取得元素 =====
const imageWrapper = document.getElementById('imageWrapper');
const mainImage = document.getElementById('mainImage');
const textArea = document.getElementById('textArea');
const hint = document.getElementById('hint');
const bgLayer = document.getElementById('bgLayer');

// ===== 設定第二張圖片 =====
const SECOND_IMAGE = 'image2.png';

// ===== 設定背景圖案 =====
const BG_ICON = 'bg-icon.png';

// ===== 狀態鎖 =====
let isClicked = false;

// ===== 檢查兩個矩形是否重疊 =====
function isOverlapping(x1, y1, w1, h1, x2, y2, w2, h2) {
    return !(x1 + w1 < x2 || x2 + w2 < x1 || y1 + h1 < y2 || y2 + h2 < y1);
}

// ===== 檢查新圖標是否與現有圖標重疊 =====
function hasOverlap(newX, newY, newSize, existingIcons) {
    const padding = 12;
    for (let icon of existingIcons) {
        const size = icon.size;
        if (isOverlapping(
            newX, newY, newSize, newSize,
            icon.x, icon.y, size, size
        )) {
            return true;
        }
        if (isOverlapping(
            newX - padding, newY - padding, newSize + padding * 2, newSize + padding * 2,
            icon.x, icon.y, size, size
        )) {
            return true;
        }
    }
    return false;
}

// ===== 隨機散佈背景圖案（網格均勻 + 隨機偏移） =====
function scatterBgIcons() {
    const iconCount = 30;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const icons = [];

    bgLayer.innerHTML = '';

    // 計算網格：讓圖標平均分佈
    const cols = Math.ceil(Math.sqrt(iconCount * (windowWidth / windowHeight)));
    const rows = Math.ceil(iconCount / cols);

    const cellWidth = (windowWidth - 40) / cols;
    const cellHeight = (windowHeight - 40) / rows;

    // 每個格子內隨機偏移的最大幅度（保留隨機感）
    const offsetRatio = 0.35; // 35% 偏移，數值越大越隨機

    let placed = 0;
    let attempts = 0;
    const maxAttempts = 2000;

    // 打亂順序，讓分佈更自然
    const gridPositions = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            gridPositions.push({ row: r, col: c });
        }
    }
    // 隨機打亂
    for (let i = gridPositions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gridPositions[i], gridPositions[j]] = [gridPositions[j], gridPositions[i]];
    }

    for (let pos of gridPositions) {
        if (placed >= iconCount || attempts >= maxAttempts) break;

        const { row, col } = pos;

        // 基礎位置（格子中心）
        const baseX = 20 + col * cellWidth + cellWidth / 2;
        const baseY = 20 + row * cellHeight + cellHeight / 2;

        // 隨機大小（30px ~ 70px）
        const size = 30 + Math.random() * 40;

        // 在格子內隨機偏移（保留隨機感，但不會跑太遠）
        const offsetX = (Math.random() - 0.5) * cellWidth * offsetRatio * 2;
        const offsetY = (Math.random() - 0.5) * cellHeight * offsetRatio * 2;

        let x = baseX + offsetX - size / 2;
        let y = baseY + offsetY - size / 2;

        // 確保不超出邊界
        x = Math.max(5, Math.min(x, windowWidth - size - 5));
        y = Math.max(5, Math.min(y, windowHeight - size - 5));

        // 檢查是否與現有圖標重疊
        if (!hasOverlap(x, y, size, icons)) {
            // 旋轉 -60度 ~ 60度
            const rotation = (Math.random() - 0.5) * 120;

            // 透明度 0.08 ~ 0.2
            const opacity = 0.08 + Math.random() * 0.12;

            const icon = document.createElement('img');
            icon.src = BG_ICON;
            icon.className = 'bg-icon';

            icon.style.position = 'absolute';
            icon.style.left = x + 'px';
            icon.style.top = y + 'px';
            icon.style.width = size + 'px';
            icon.style.height = size + 'px';
            icon.style.objectFit = 'contain';
            icon.style.transform = `rotate(${rotation}deg)`;
            icon.style.opacity = opacity;
            icon.style.pointerEvents = 'none';
            icon.style.userSelect = 'none';
            icon.style.webkitUserDrag = 'none';

            bgLayer.appendChild(icon);
            icons.push({ x, y, size });
            placed++;
        } else {
            attempts++;
        }
    }
}

// ===== 計算在一起天數 =====
function calculateDays() {
    const startDate = new Date(2025, 8, 13); // 2025年9月13日（月份從0開始，8=9月）
    const today = new Date();

    // 將時間設為凌晨 00:00:00，確保只比較日期
    startDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = today - startDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    document.getElementById('dayCount').textContent = diffDays >= 0 ? diffDays : 0;
}

// ===== 點擊事件 =====
imageWrapper.addEventListener('click', function() {
    if (isClicked) return;
    isClicked = true;

    mainImage.src = SECOND_IMAGE;
    hint.classList.add('hidden');

    setTimeout(() => {
        textArea.classList.add('visible');
        document.getElementById('dateCounter').classList.add('visible');
        setTimeout(() => {
            document.getElementById('downloadSection').classList.add('visible');
        }, 500);
    }, 300);
});

// ===== 圖片載入錯誤提醒 =====
mainImage.addEventListener('error', function() {
    console.warn('圖片載入失敗，請確認檔名是否正確：', mainImage.src);
});

// ===== 視窗大小改變時重新散佈 =====
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        scatterBgIcons();
    }, 500);
});

// ===== 頁面載入後執行 =====
window.addEventListener('load', function() {
    scatterBgIcons();
    calculateDays();
});

// ===== 下載為圖片 =====
document.getElementById('downloadBtn').addEventListener('click', function() {
    const btn = this;
    const originalText = btn.textContent;
    btn.textContent = '⏳ 生成中...';
    btn.disabled = true;

    // 取得要下載的內容（排除下載按鈕區塊）
    const downloadSection = document.getElementById('downloadSection');
    const bgLayer = document.getElementById('bgLayer');
    const container = document.querySelector('.container');

    // 暫時隱藏下載按鈕區塊
    downloadSection.style.display = 'none';

    // 將背景圖層移到 container 內部（下載完成後復原）
    const containerParent = container.parentNode;
    const bgLayerParent = bgLayer.parentNode;
    containerParent.insertBefore(bgLayer, container);
    container.insertBefore(bgLayer, container.firstChild);

    html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#faf6f0',
        logging: false,
        width: container.scrollWidth,
        height: container.scrollHeight,
        windowWidth: container.scrollWidth,
        windowHeight: container.scrollHeight,
    }).then(canvas => {
        // 恢復顯示下載按鈕區塊
        downloadSection.style.display = '';

        // 將背景圖層移回原來位置
        document.body.insertBefore(bgLayer, document.body.firstChild);

        const link = document.createElement('a');
        link.download = '給傻豬的生日禮物兌換券.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        btn.textContent = originalText;
        btn.disabled = false;
    }).catch(err => {
        // 發生錯誤時也要恢復顯示
        downloadSection.style.display = '';

        // 將背景圖層移回原來位置
        document.body.insertBefore(bgLayer, document.body.firstChild);

        console.error('下載失敗:', err);
        alert('下載失敗，cap圖保存或者問我');
        btn.textContent = originalText;
        btn.disabled = false;
    });
});

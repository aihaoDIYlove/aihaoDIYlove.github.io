// 星星闪烁效果
function initStarsEffect() {
    const starsContainer = document.getElementById('stars-container');
    if (!starsContainer) return;

    // 星星配置
    const starCount = 64; // 星星数量
    const minSize = 1; // 最小尺寸（像素）
    const maxSize = 4; // 最大尺寸（像素）
    const minDuration = 1.6; // 最小闪烁周期（秒）
    const maxDuration = 4; // 最大闪烁周期（秒）

    // 生成随机星星
    for (let i = 0; i < starCount; i++) {
        createStar(starsContainer, minSize, maxSize, minDuration, maxDuration);
    }
}

function createStar(container, minSize, maxSize, minDuration, maxDuration) {
    const star = document.createElement('div');
    star.className = 'star';

    // 随机位置（避免边缘）
    const left = Math.random() * 90 + 5; // 5% - 95%
    const top = Math.random() * 90 + 5; // 5% - 95%

    // 随机大小
    const size = Math.random() * (maxSize - minSize) + minSize;

    // 随机闪烁周期
    const duration = Math.random() * (maxDuration - minDuration) + minDuration;

    // 随机延迟开始时间
    const delay = Math.random() * duration;

    // 创建SVG星星 - 防止国产浏览器强制替换星星颜色
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.style.display = 'block';

    // 创建星星形状
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M50,0 L61,35 L98,35 L68,57 L79,91 L50,70 L21,91 L32,57 L2,35 L39,35 Z');
    path.setAttribute('fill', '#FFFFFF');
    path.setAttribute('stroke', 'none');
    path.style.fill = '#FFFFFF';

    svg.appendChild(path);
    star.appendChild(svg);

    // 应用样式
    star.style.left = left + '%';
    star.style.top = top + '%';
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.setProperty('--duration', duration + 's');
    star.style.animationDelay = delay + 's';

    container.appendChild(star);
}

// 导出函数到全局作用域
window.initStarsEffect = initStarsEffect;
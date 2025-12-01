 /* ========================================
   工具函数 - 性能优化
   ======================================== */

// 防抖函数 - 优化频繁触发的事件
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 检查是否支持 requestIdleCallback
const requestIdleCallback = window.requestIdleCallback ||
    function(cb, options) {
        const start = Date.now();
        return setTimeout(() => {
            cb({
                didTimeout: options && options.timeout,
                timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
            });
        }, 1);
    };

/* ========================================
   歌词显示初始化功能
   ======================================== */
// 存储已加载的歌词内容
const lyricsCache = new Map();
let isLyricsSystemInitialized = false;
let pendingLyricsPath = null;

// 异步初始化歌词显示功能
async function initLyricsDisplay() {
    if (isLyricsSystemInitialized) return;

    console.log('初始化歌词显示功能');

    // 创建歌词显示实例
    window.lyricsDisplay = new LyricsDisplay();

    // 初始时隐藏歌词容器
    window.lyricsDisplay.setVisible(false);

    isLyricsSystemInitialized = true;

    // 默认加载测试歌词，如果后续正常加载，测试歌词会被替换
    console.log('加载默认测试歌词');
    window.lyricsDisplay.loadLyrics('./lyrics/test.lrc');

    // 如果有待处理的歌词路径，现在加载
    if (pendingLyricsPath) {
        window.lyricsDisplay.loadLyrics(pendingLyricsPath);
        pendingLyricsPath = null;
    }

    // 延迟启动预加载，避免阻塞页面渲染
    requestIdleCallback(() => {
        lazyPreloadLyrics();
    }, { timeout: 2000 });

    console.log('歌词显示功能初始化完成');
}

// 懒加载歌词文件
async function loadLyricFile(song, retryCount = 0) {
    if (!song.lrcPath || lyricsCache.has(song.lrcPath)) return;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(song.lrcPath, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const lrcContent = await response.text();
        if (lrcContent.trim()) {
            lyricsCache.set(song.lrcPath, lrcContent);
            console.log(`歌词加载成功: ${song.name}`);
        }
    } catch (error) {
        console.warn(`歌词加载失败: ${song.name}`, error.message);

        if (retryCount < 2) {
            setTimeout(() => loadLyricFile(song, retryCount + 1), 1000 * (retryCount + 1));
        }
    }
}

// 懒预加载所有歌词
function lazyPreloadLyrics() {
    if (!musicConfig?.playlist) return;

    console.log('启动歌词懒预加载（预加载所有歌词）...');
    const playlist = musicConfig.playlist;

    playlist.forEach((song, index) => {

        const delay = Math.min(index * 200, 2000);
        
        setTimeout(() => {
            if (song.lrcPath) {
                console.log(`预加载歌词 (${index + 1}/${playlist.length}):`, song.lrcPath);
                loadLyricFile(song);
            }
        }, delay);
    });
}

/* ========================================
   LRC歌词解析和显示
   ======================================== */
// LRC歌词解析器类
class LRCParser {
    constructor() {
        this.lyrics = [];
        this.currentIndex = -1;
    }

    // 解析LRC歌词文件内容
    parse(lrcContent) {
        this.lyrics = [];
        const lines = lrcContent.split('\n');

        lines.forEach(line => {
            const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2})\](.*)/);
            if (match) {
                const minutes = parseInt(match[1]);
                const seconds = parseInt(match[2]);
                const milliseconds = parseInt(match[3]) * 10; // 转换为毫秒
                const time = minutes * 60 + seconds + milliseconds / 1000;
                const text = match[4].trim();

                if (text) { // 只添加非空歌词
                    this.lyrics.push({
                        time: time,
                        text: text
                    });
                }
            }
        });

        // 按时间排序
        this.lyrics.sort((a, b) => a.time - b.time);
        console.log('歌词解析完成，共', this.lyrics.length, '行');
    }

    // 根据当前播放时间获取当前歌词索引
    getCurrentLyricIndex(currentTime) {
        for (let i = this.lyrics.length - 1; i >= 0; i--) {
            if (currentTime >= this.lyrics[i].time) {
                return i;
            }
        }
        return -1;
    }

    // 获取当前歌词
    getCurrentLyric(currentTime) {
        const index = this.getCurrentLyricIndex(currentTime);
        return index >= 0 ? this.lyrics[index] : null;
    }

    // 获取下一句歌词
    getNextLyric(currentTime) {
        const currentIndex = this.getCurrentLyricIndex(currentTime);
        const nextIndex = currentIndex + 1;
        return nextIndex < this.lyrics.length ? this.lyrics[nextIndex] : null;
    }
}

// 歌词显示类
class LyricsDisplay {
    constructor() {
        this.mobileContainer = document.querySelector('#mobile-lyrics-container');
        this.mobileContent = document.querySelector('#mobile-lyrics-content');

        this.parser = new LRCParser();
        this.currentIndex = -1;
        this.isVisible = false;
        this.currentLyricsPath = null;
        this.isMobile = window.innerWidth <= 540;

        // 缓存歌词元素，避免频繁DOM查询
        this.mobileLyricElements = [];
        this.lastMobileIndex = -1;
        this.animationFrame = null;
        this.isAnimating = false;

        // 性能优化：批量DOM更新
        this.pendingUpdate = false;
        this.updateThrottled = this.throttle(this.updateCurrentLyric.bind(this), 50);

        // 响应式适配
        this.handleResize = debounce(() => {
            this.isMobile = window.innerWidth <= 540;
        }, 250);
        window.addEventListener('resize', this.handleResize);
    }

    // 加载歌词文件
    async loadLyrics(lrcUrl) {
        if (this.currentLyricsPath === lrcUrl) return;

        this.currentLyricsPath = lrcUrl;

        try {
            console.log('开始加载歌词文件:', lrcUrl);

            // 检查缓存中是否有歌词内容
            if (lyricsCache.has(lrcUrl)) {
                console.log('使用缓存的歌词内容');
                this.processLyricsContent(lyricsCache.get(lrcUrl), 'cache');
                return;
            }

            // 如果歌词系统未初始化，将任务加入队列
            if (!isLyricsSystemInitialized) {
                pendingLyricsPath = lrcUrl;
                return;
            }

            // 异步加载歌词
            this.loadLyricsFromNetwork(lrcUrl);

        } catch (error) {
            console.error('歌词加载失败:', error);

            if (this.currentLyricsPath !== './lyrics/test.lrc') {
                console.log('歌词加载失败，保留当前歌词');
            }
        }
    }

    // 异步网络加载歌词
    async loadLyricsFromNetwork(lrcUrl) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            const response = await fetch(lrcUrl, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const lrcContent = await response.text();
            if (!lrcContent.trim()) {
                throw new Error('歌词内容为空');
            }

            // 缓存歌词内容
            lyricsCache.set(lrcUrl, lrcContent);

            this.processLyricsContent(lrcContent, 'network');
        } catch (error) {
            console.error('网络歌词加载失败:', error);

            if (this.currentLyricsPath !== './lyrics/test.lrc') {
                console.log('歌词加载失败，保留当前歌词');
            }
        }
    }

    // 处理歌词内容
    processLyricsContent(lrcContent, source) {
        this.parser.parse(lrcContent);
        this.renderLyrics();
        console.log(`歌词加载成功（从${source === 'cache' ? '缓存' : '网络'}）`);
    }

    // 渲染歌词到页面
    renderLyrics() {
        // 统一使用移动端歌词容器，显示三行
        if (this.mobileContent) {
            this.mobileContent.innerHTML = '';
            this.mobileLyricElements = []; // 重置缓存数组

            // 创建三行歌词显示
            for (let i = 0; i < 3; i++) {
                const lyricLine = document.createElement('div');
                lyricLine.className = 'mobile-lyric-line';
                lyricLine.textContent = '';
                lyricLine.dataset.position = i;
                this.mobileContent.appendChild(lyricLine);

                // 缓存元素引用
                this.mobileLyricElements[i] = lyricLine;
            }
        }
    }

    // 更新当前歌词高亮
    updateCurrentLyric(currentTime) {
        const newIndex = this.parser.getCurrentLyricIndex(currentTime);

        if (newIndex !== this.currentIndex) {
            this.currentIndex = newIndex;
            this.updateMobileLyrics(newIndex);
        }
    }

    // 节流函数
    throttle(func, wait) {
        let timeout;
        let lastTime = 0;
        return function(...args) {
            const now = Date.now();
            const remaining = wait - (now - lastTime);

            if (remaining <= 0 || remaining > wait) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                lastTime = now;
                return func.apply(this, args);
            } else if (!timeout) {
                timeout = setTimeout(() => {
                    lastTime = Date.now();
                    timeout = null;
                    return func.apply(this, args);
                }, remaining);
            }
        };
    }

    // 歌词显示
    updateMobileLyrics(newIndex) {
        if (!this.mobileContent || this.parser.lyrics.length === 0) return;
        if (newIndex === this.lastMobileIndex || this.isAnimating) return;

        this.lastMobileIndex = newIndex;
        const lines = this.mobileLyricElements;
        const newLyrics = this.getThreeLyrics(newIndex);
        this.animateLyricTransition(lines, newLyrics, newIndex);
    }

    // 获取单个歌词行文本
    getLyricText(index) {
        return (index >= 0 && index < this.parser.lyrics.length)
            ? this.parser.lyrics[index].text
            : '';
    }

    // 获取三行歌词内容
    getThreeLyrics(newIndex) {
        if (newIndex >= 0) {
            return [
                { text: this.getLyricText(newIndex - 1), type: 'prev' },
                { text: this.getLyricText(newIndex), type: 'current' },
                { text: this.getLyricText(newIndex + 1), type: 'next' }
            ];
        }

        // 如果还没开始，显示前三句
        return Array.from({ length: 3 }, (_, i) => ({
            text: this.getLyricText(i),
            type: i === 0 ? 'current' : 'next'
        }));
    }

    // 歌词动画的各个阶段
    animateLyricPhaseOut(lines) {
        lines.forEach(line => {
            line.style.transform = 'translateY(-20px)';
            line.style.opacity = '0';
        });
    }

    updateLyricContent(lines, newLyrics) {
        lines.forEach(line => line.classList.remove('mobile-current', 'mobile-next'));

        newLyrics.forEach((lyric, index) => {
            if (!lines[index]) return;

            lines[index].textContent = lyric.text;

            if (lyric.type === 'current') {
                lines[index].classList.add('mobile-current');
                this.currentMobileLine = lines[index];
            } else if (lyric.type === 'next') {
                lines[index].classList.add('mobile-next');
                this.nextMobileLine = lines[index];
            }
        });
    }

    animateLyricPhaseIn(lines) {
        lines.forEach(line => {
            line.style.transform = 'translateY(0)';
            line.style.opacity = '';
        });
    }

    resetAnimationState(lines) {
        lines.forEach(line => {
            line.classList.remove('lyric-transitioning');
            line.style.transform = '';
            line.style.opacity = '';
        });
        this.isAnimating = false;
    }

    // 优化的动画过渡歌词切换
    animateLyricTransition(lines, newLyrics, newIndex) {
        if (this.isAnimating) return;

        this.isAnimating = true;
        lines.forEach(line => line.classList.add('lyric-transitioning'));

        // 取消之前的动画帧
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        this.animationFrame = requestAnimationFrame(() => {
            this.animateLyricPhaseOut(lines);

            setTimeout(() => {
                this.updateLyricContent(lines, newLyrics);

                this.animationFrame = requestAnimationFrame(() => {
                    this.animateLyricPhaseIn(lines);
                    setTimeout(() => this.resetAnimationState(lines), 400);
                });
            }, 200);
        });
    }

    // 清理资源
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        window.removeEventListener('resize', this.handleResize);
        this.clearLyrics();
    }

    // 流畅滚动到指定歌词行的中心位置
    smoothScrollToCenter(targetElement) {
        if (!targetElement || !this.mobileContent) return;

        const container = this.mobileContent;
        const containerHeight = container.clientHeight;
        const containerScrollTop = container.scrollTop;

        // 计算目标元素相对于容器的位置
        const targetOffsetTop = targetElement.offsetTop;
        const targetHeight = targetElement.offsetHeight;

        // 计算需要滚动到的位置（让目标元素居中）
        const targetScrollTop = targetOffsetTop - (containerHeight / 2) + (targetHeight / 2);

        // 使用自定义的平滑滚动动画
        this.animateScroll(container, containerScrollTop, targetScrollTop, 800);
    }

    // 自定义滚动动画函数
    animateScroll(element, startPos, endPos, duration) {
        const startTime = performance.now();
        const distance = endPos - startPos;

        const easeInOutCubic = (t) => {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        };

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeInOutCubic(progress);

            element.scrollTop = startPos + distance * easedProgress;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    // 显示错误信息
    showError(message) {
        if (this.mobileContent) {
            this.mobileContent.innerHTML = `<div class="mobile-lyric-line">${message}</div>`;
        }
    }

    // 清空歌词显示
    clearLyrics() {
        if (this.mobileContent) {
            this.mobileContent.innerHTML = '';
            this.mobileLyricElements = [];
        }
        this.currentIndex = -1;
        this.lastMobileIndex = -1;
        this.parser.lyrics = [];
    }

    // 显示/隐藏歌词容器
    setVisible(visible) {
        this.isVisible = visible;
        console.log('设置歌词可见性:', visible);

        // 歌词容器
        if (this.mobileContainer) {
            this.mobileContainer.style.display = visible ? 'block' : 'none';
            console.log('歌词容器状态已更新，display:', this.mobileContainer.style.display);
        } else {
            console.warn('歌词容器未找到');
        }
    }
}

// 全局歌词显示实例
window.lyricsDisplay = null;

/* ========================================
   音乐播放器初始化和配置
   ======================================== */
// 全局变量存储音乐配置
let musicConfig = null;
let currentLyricPath = null;

// 获取默认音乐配置
function getDefaultMusicConfig() {
    return {
        playlist: [{
            name: '无尽幸福',
            artist: '凌晨一点的莱茵猫',
            url: 'https://music.163.com/song/media/outer/url?id=2699754024.mp3',
            cover: 'image/play.png',
            lrcPath: './lyrics/无尽幸福-歌词.lrc'
        }],
        settings: {
            autoplay: false,
            loop: 'all',
            order: 'random',
            volume: 0.2,
            theme: 'rgba(255, 255, 255, 0.0)',
            mini: false,
            listFolded: false,
            listMaxHeight: 90
        }
    };
}

// 加载音乐配置文件
async function loadMusicConfig() {
    try {
        const response = await fetch('./data/music-config.json');
        if (!response.ok) throw new Error('无法加载音乐配置文件');

        musicConfig = await response.json();
        console.log('音乐配置加载成功:', musicConfig);
        return musicConfig;
    } catch (error) {
        console.error('加载音乐配置失败:', error);
        return getDefaultMusicConfig();
    }
}

// 转换歌曲配置格式
function convertAudioList(playlist, defaultCover) {
    return playlist.map(song => ({
        name: song.name,
        artist: song.artist,
        url: song.url,
        cover: song.cover === 'default' ? defaultCover : song.cover,
        lrc: song.lrcPath
    }));
}

// 设置播放器事件监听 - 优化性能
function setupPlayerEvents(config) {
    window.aplayer.on('loadstart', () => console.log('开始加载音频'));
    window.aplayer.on('canplay', () => {
        console.log('音频可以播放');
        // 音频可播放时预加载当前歌曲歌词
        const currentIndex = window.aplayer.list?.index;
        if (currentIndex !== undefined) {
            loadLyricFile(config.playlist[currentIndex]);
        }
    });
    window.aplayer.on('error', (error) => console.error('播放器错误:', error));

    // 节流歌词更新，避免频繁DOM操作
    window.aplayer.on('timeupdate', () => {
        if (!window.lyricsDisplay?.isVisible) return;
        window.lyricsDisplay.updateThrottled(window.aplayer.audio.currentTime);
    });

    window.aplayer.on('listswitch', (index) => {
        console.log('切换到歌曲:', index.index);
        updateLyricsForSong(config, index.index);
        autoFoldPlaylist();

    });
}

// 更新歌曲歌词
function updateLyricsForSong(config, songIndex) {
    if (!config.playlist[songIndex]) return;

    currentLyricPath = config.playlist[songIndex].lrcPath;
    console.log('更新歌词路径为:', currentLyricPath);

    if (window.lyricsDisplay) {
        // 立即清除当前歌词显示
        window.lyricsDisplay.clearLyrics();

        // 异步加载新歌词
        requestAnimationFrame(() => {
            window.lyricsDisplay.loadLyrics(currentLyricPath);
        });
    }
}

// 自动折叠播放列表
function autoFoldPlaylist() {
    setTimeout(() => {
        if (window.aplayer?.list) {
            const listElement = document.querySelector('.aplayer-list');
            if (listElement && !listElement.classList.contains('aplayer-list-hide')) {
                console.log('自动折叠播放列表');
                window.aplayer.list.toggle();
            }
        }
    }, 100);
}

// 检查初始化条件
function checkInitConditions() {
    if (typeof APlayer === 'undefined') {
        console.error('APlayer库未加载');
        return false;
    }

    const container = document.getElementById('aplayer');
    if (!container) {
        console.error('未找到播放器容器');
        return false;
    }

    console.log('APlayer库和容器都已准备就绪');
    return true;
}

// 创建APlayer实例
function createAPlayer(config, container) {
    const audioList = convertAudioList(config.playlist, config.defaultCover);

    window.aplayer = new APlayer({
        container,
        mini: config.settings.mini,
        autoplay: config.settings.autoplay,
        theme: config.settings.theme,
        loop: config.settings.loop,
        order: config.settings.order,
        preload: config.settings.preload || 'none',
        volume: config.settings.volume,
        mutex: true,
        listFolded: config.settings.listFolded,
        listMaxHeight: config.settings.listMaxHeight,
        audio: audioList
    });

    // 确保 aplayer-withlist 类正确添加
    ensureAplayerWithlistClass();

    container.offsetHeight; // 强制触发重绘
    console.log('APlayer初始化成功！');
}

// 确保 aplayer-withlist 类正确添加
function ensureAplayerWithlistClass() {
    if (window.aplayer && window.aplayer.list && window.aplayer.list.audios) {
        const audioCount = window.aplayer.list.audios.length;
        const container = window.aplayer.container;

        if (audioCount > 1 && !container.classList.contains('aplayer-withlist')) {
            container.classList.add('aplayer-withlist');
            console.log('手动添加 aplayer-withlist 类，歌曲数量:', audioCount);
        } else if (audioCount <= 1 && container.classList.contains('aplayer-withlist')) {
            container.classList.remove('aplayer-withlist');
            console.log('移除 aplayer-withlist 类，歌曲数量:', audioCount);
        }
    }
}

// 校正初始歌词路径
function correctInitialLyricPath(config) {
    // 使用 requestIdleCallback 在浏览器空闲时执行
    requestIdleCallback(() => {
        if (window.aplayer?.list?.index !== undefined && config.playlist[window.aplayer.list.index]) {
            const actualIndex = window.aplayer.list.index;
            console.log('播放器实际当前歌曲索引:', actualIndex);

            currentLyricPath = config.playlist[actualIndex].lrcPath;
            console.log('更新为实际歌曲的歌词路径:', currentLyricPath);

            // 异步加载歌词
            if (window.lyricsDisplay && currentLyricPath) {
                window.lyricsDisplay.loadLyrics(currentLyricPath);
            }
        }
    }, { timeout: 1000 });
}

// 异步初始化播放器主逻辑
async function initializePlayerCore(config) {
    if (!checkInitConditions()) return;

    try {
        const container = document.getElementById('aplayer');

        // 使用 requestAnimationFrame 确保不阻塞页面渲染
        requestAnimationFrame(() => {
            createAPlayer(config, container);

            // 延迟初始化歌词系统，等待DOM稳定
            setTimeout(() => {
                initLyricsDisplay();
                setupPlayerEvents(config);
                correctInitialLyricPath(config);
            }, 100);
        });
    } catch (error) {
        console.error('APlayer初始化失败:', error);
    }
}

// 初始化音乐播放器
async function initMusicPlayer() {
    console.log('开始异步初始化音乐播放器');

    try {
        // 异步加载配置，不阻塞主线程
        const configPromise = loadMusicConfig();

        // 等待APlayer库加载完成
        await waitForAPlayer();

        // 获取配置并初始化
        const config = await configPromise;

        // 使用微任务延迟初始化，避免阻塞
        Promise.resolve().then(() => {
            initializePlayerCore(config);
        });

    } catch (error) {
        console.error('音乐播放器初始化失败:', error);
        // 降级处理：使用默认配置
        const defaultConfig = getDefaultMusicConfig();
        initializePlayerCore(defaultConfig);
    }
}

// 等待APlayer库加载完成
function waitForAPlayer() {
    return new Promise((resolve) => {
        if (typeof APlayer !== 'undefined') {
            resolve();
            return;
        }

        const checkInterval = setInterval(() => {
            if (typeof APlayer !== 'undefined') {
                clearInterval(checkInterval);
                resolve();
            }
        }, 100);

        // 超时保护
        setTimeout(() => {
            clearInterval(checkInterval);
            console.warn('APlayer库加载超时');
            resolve(); // 继续执行，由后续逻辑处理错误
        }, 5000);
    });
}

/* ========================================
   打字机动画效果类
   ======================================== */
// 打字机动画效果
class TypewriterAnimation {
    constructor(element) {
        this.element = element;
        // 打字机文本数组 - 可修改这里的文本内容
        this.texts = ['.icu', 'I see You'];
        this.currentTextIndex = 0;
        this.currentCharIndex = 0;
        this.isDeleting = false;
        this.isWaiting = false;
        // 动画速度配置 - 可调整这些数值改变动画效果
        this.typeSpeed = 200; // 打字速度（毫秒）- 数值越小打字越快
        this.deleteSpeed = 100; // 删除速度（毫秒）- 数值越小删除越快
        this.waitTime = 2000; // 等待时间（毫秒）- 打字完成后的停留时间
        this.deleteWaitTime = 2000; // 删除前等待时间（毫秒）
    }

    // 打字机核心动画方法
    type() {
        const currentText = this.texts[this.currentTextIndex];
        
        if (this.isWaiting) {
            return;
        }

        if (!this.isDeleting) {
            // 打字阶段 - 逐字符显示文本
            if (this.currentCharIndex < currentText.length) {
                this.element.textContent = currentText.substring(0, this.currentCharIndex + 1);
                this.currentCharIndex++;
                setTimeout(() => this.type(), this.typeSpeed);
            } else {
                // 打字完成，等待一段时间后开始删除
                this.isWaiting = true;
                setTimeout(() => {
                    this.isWaiting = false;
                    this.isDeleting = true;
                    this.type();
                }, this.deleteWaitTime);
            }
        } else {
            // 删除阶段 - 逐字符删除文本
            if (this.currentCharIndex > 0) {
                this.element.textContent = currentText.substring(0, this.currentCharIndex - 1);
                this.currentCharIndex--;
                setTimeout(() => this.type(), this.deleteSpeed);
            } else {
                // 删除完成，切换到下一个文本
                this.isDeleting = false;
                this.currentTextIndex = (this.currentTextIndex + 1) % this.texts.length;
                
                // 如果回到第一个文本，等待更长时间
                const nextWaitTime = this.currentTextIndex === 0 ? this.waitTime : 500;
                
                this.isWaiting = true;
                setTimeout(() => {
                    this.isWaiting = false;
                    this.type();
                }, nextWaitTime);
            }
        }
    }

    // 启动打字机动画
    start() {
        // 延迟开始动画 - 1000毫秒后开始
        setTimeout(() => {
            this.type();
        }, 1000);
    }
}

/* ========================================
   歌词显示初始化功能
   ======================================== */
// 初始化歌词显示功能
function initLyricsDisplay() {
    console.log('初始化歌词显示功能');
    console.log('当前歌词路径:', currentLyricPath);
    
    // 创建歌词显示实例
    lyricsDisplay = new LyricsDisplay();
    
    // 只有在有明确歌词路径时才加载歌词
    if (currentLyricPath) {
        lyricsDisplay.loadLyrics(currentLyricPath);
    } else {
        console.log('等待歌词路径设置...');
    }
    
    // 初始时隐藏歌词容器
    lyricsDisplay.setVisible(false);
    
    console.log('歌词显示功能初始化完成');
}

/* ========================================
   社交媒体链接配置
   ======================================== */
// 社交媒体链接配置 - 可修改这些链接为您自己的社交媒体账号
const socialLinks = {
    github: 'https://github.com/aihaoDIYlove', // GitHub链接
    bilibili: 'https://space.bilibili.com/62784664', // Bilibili链接
    zhihu: 'https://www.zhihu.com/people/ai-hao-diylove' // 知乎链接
};

/* ========================================
   页面初始化和事件监听
   ======================================== */
// 页面加载完成后执行的初始化函数
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，开始初始化');
    
    // 初始化打字机动画效果
    const typewriterElement = document.querySelector('#typewriter-text');
    if (typewriterElement) {
        const typewriter = new TypewriterAnimation(typewriterElement);
        typewriter.start();
    }

    // 配置社交媒体链接 - 自动设置链接地址和安全属性
    const githubLink = document.querySelector('#github-link');
    if (githubLink) {
        githubLink.href = socialLinks.github;
        githubLink.target = '_blank'; // 新窗口打开
        githubLink.rel = 'noopener noreferrer'; // 安全属性
    }

    const bilibiliLink = document.querySelector('#bilibili-link');
    if (bilibiliLink) {
        bilibiliLink.href = socialLinks.bilibili;
        bilibiliLink.target = '_blank'; // 新窗口打开
        bilibiliLink.rel = 'noopener noreferrer'; // 安全属性
    }

    const zhihuLink = document.querySelector('#zhihu-link');
    if (zhihuLink) {
        zhihuLink.href = socialLinks.zhihu;
        zhihuLink.target = '_blank'; // 新窗口打开
        zhihuLink.rel = 'noopener noreferrer'; // 安全属性
    }

    // 初始化文章列表
    initArticleList();
    
    // 页面加载动画效果 - 淡入效果
    document.body.style.opacity = '0'; // 初始透明
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.7s ease-in-out'; // 0.7秒淡入过渡
        document.body.style.opacity = '1'; // 完全不透明
    }, 100); // 延迟100毫秒开始动画

    // 初始化音乐播放器
    initMusicPlayer();
});

/* ========================================
   LRC歌词解析器和显示功能
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

// 歌词显示管理器
class LyricsDisplay {
    constructor() {
        // 只使用移动端歌词容器，统一桌面端和移动端
        this.mobileContainer = document.querySelector('.mobile-lyrics-container');
        this.mobileContent = document.querySelector('.mobile-lyrics-content');
        this.parser = new LRCParser();
        this.currentIndex = -1;
        this.isVisible = false;
        this.isMobile = window.innerWidth <= 768;
        
        // 缓存移动端歌词元素，避免频繁DOM查询
        this.mobileLyricElements = [];
        this.currentMobileLine = null;
        this.nextMobileLine = null;
        this.lastMobileIndex = -1; // 添加索引缓存，避免重复更新
        this.isAnimating = false; // 动画状态锁
    }

    // 加载歌词文件
    async loadLyrics(lrcUrl) {
        try {
            console.log('开始加载歌词文件:', lrcUrl);
            const response = await fetch(lrcUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const lrcContent = await response.text();
            this.parser.parse(lrcContent);
            this.renderLyrics();
            console.log('歌词加载成功');
        } catch (error) {
            console.error('歌词加载失败:', error);
            this.showError('歌词加载失败');
        }
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
            
            // 统一使用移动端歌词更新逻辑
            this.updateMobileLyrics(newIndex);
        }
    }
    
    // 更新移动端歌词显示（现在用于所有设备）
    updateMobileLyrics(newIndex) {
        if (!this.mobileContent || this.parser.lyrics.length === 0) return;
        
        // 防止重复更新和动画冲突
        if (newIndex === this.lastMobileIndex || this.isAnimating) return;
        this.lastMobileIndex = newIndex;
        
        // 获取三行歌词元素
        const lines = this.mobileLyricElements;
        
        // 准备新的歌词内容
        const newLyrics = this.getThreeLyrics(newIndex);
        
        // 使用滚动动画更新歌词
        this.animateLyricTransition(lines, newLyrics, newIndex);
    }
    
    // 获取三行歌词内容（上一句、当前句、下一句）
    getThreeLyrics(newIndex) {
        const lyrics = [];
        
        if (newIndex >= 0) {
            const prevIndex = newIndex - 1;
            const nextIndex = newIndex + 1;
            
            // 上一句歌词
            lyrics[0] = {
                text: (prevIndex >= 0 && prevIndex < this.parser.lyrics.length) 
                    ? this.parser.lyrics[prevIndex].text : '',
                type: 'prev'
            };
            
            // 当前歌词
            lyrics[1] = {
                text: (newIndex < this.parser.lyrics.length) 
                    ? this.parser.lyrics[newIndex].text : '',
                type: 'current'
            };
            
            // 下一句歌词
            lyrics[2] = {
                text: (nextIndex < this.parser.lyrics.length) 
                    ? this.parser.lyrics[nextIndex].text : '',
                type: 'next'
            };
        } else {
            // 如果还没开始，显示前三句
            for (let i = 0; i < 3; i++) {
                lyrics[i] = {
                    text: (i < this.parser.lyrics.length) ? this.parser.lyrics[i].text : '',
                    type: i === 0 ? 'current' : 'next'
                };
            }
        }
        
        return lyrics;
    }
    
    // 动画过渡歌词切换
    animateLyricTransition(lines, newLyrics, newIndex) {
        // 检查是否已经在动画中，避免重复触发
        if (this.isAnimating) {
            return;
        }
        this.isAnimating = true;
        
        // 添加过渡动画类
        lines.forEach(line => {
            line.classList.add('lyric-transitioning');
        });
        
        // 使用 requestAnimationFrame 确保动画流畅
        requestAnimationFrame(() => {
            // 第一阶段：向上滑出
            lines.forEach(line => {
                line.style.transform = 'translateY(-20px)';
                line.style.opacity = '0';
            });
            
            // 第二阶段：更新内容并滑入
            setTimeout(() => {
                // 清除所有样式类
                lines.forEach(line => {
                    line.classList.remove('mobile-current', 'mobile-next');
                });
                
                // 更新内容和样式
                newLyrics.forEach((lyric, index) => {
                    if (lines[index]) {
                        lines[index].textContent = lyric.text;
                        
                        // 添加对应的样式类
                        if (lyric.type === 'current') {
                            lines[index].classList.add('mobile-current');
                            this.currentMobileLine = lines[index];
                        } else if (lyric.type === 'next') {
                            lines[index].classList.add('mobile-next');
                            this.nextMobileLine = lines[index];
                        }
                    }
                });
                
                // 第三阶段：从下方滑入
                requestAnimationFrame(() => {
                    lines.forEach(line => {
                        line.style.transform = 'translateY(0)';
                        line.style.opacity = '';
                    });
                    
                    // 清理过渡状态
                    setTimeout(() => {
                        lines.forEach(line => {
                            line.classList.remove('lyric-transitioning');
                            line.style.transform = '';
                            line.style.opacity = '';
                        });
                        // 动画完成，重置标志
                        this.isAnimating = false;
                    }, 400); // 与CSS过渡时间匹配
                });
            }, 200); // 滑出动画时间
        });
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

    // 显示/隐藏歌词容器
    setVisible(visible) {
        this.isVisible = visible;
        // 端歌词容器
        if (this.mobileContainer) {
            this.mobileContainer.style.display = visible ? 'block' : 'none';
        }
    }
}

// 全局歌词显示实例
let lyricsDisplay = null;

/* ========================================
   音乐播放器初始化和配置
   ======================================== */
// 全局变量存储音乐配置
let musicConfig = null;
let currentLyricPath = null;

// 加载音乐配置文件
async function loadMusicConfig() {
    try {
        const response = await fetch('./data/music-config.json');
        if (!response.ok) {
            throw new Error('无法加载音乐配置文件');
        }
        musicConfig = await response.json();
        console.log('音乐配置加载成功:', musicConfig);
        return musicConfig;
    } catch (error) {
        console.error('加载音乐配置失败:', error);
        // 返回默认配置
        return {
            playlist: [{
                name: '长岛',
                artist: '花粥',
                url: 'https://music.163.com/song/media/outer/url?id=419373910.mp3',
                cover: 'https://www.gequhai.com/static/img/logo.png',
                lrcPath: './lyrics/长岛-花粥-歌词.lrc'
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
}

// 初始化音乐播放器 - 支持配置文件和随机播放
async function initMusicPlayer() {
    console.log('开始初始化音乐播放器');
    
    // 先加载音乐配置
    const config = await loadMusicConfig();
    
    // 延迟初始化确保DOM完全加载 - 500毫秒延迟
    setTimeout(() => {
        console.log('检查APlayer库和容器');
        
        // 检查APlayer库是否已加载
        if (typeof APlayer === 'undefined') {
            console.error('APlayer库未加载');
            return;
        }
        
        // 检查播放器容器是否存在
        const container = document.getElementById('aplayer');
        if (!container) {
            console.error('未找到播放器容器');
            return;
        }
        
        console.log('APlayer库和容器都已准备就绪');
        
        try {
            // 强制显示容器，确保Chrome能正确渲染
            container.style.display = 'block';
            container.style.visibility = 'visible';
            container.style.opacity = '1';
            container.style.position = 'fixed';
            container.style.zIndex = '1000';
            container.style.bottom = '10px';
            container.style.left = '10px';
            
            // 强制重绘触发
            container.offsetHeight;
            
            // 添加调试信息
            console.log('容器样式已设置:', {
                display: container.style.display,
                visibility: container.style.visibility,
                opacity: container.style.opacity,
                position: container.style.position
            });

            // 转换配置文件格式为APlayer需要的格式
            const audioList = config.playlist.map(song => ({
                name: song.name,
                artist: song.artist,
                url: song.url,
                cover: song.cover === 'default' ? config.defaultCover : song.cover,
                lrc: song.lrcPath // APlayer会自动加载LRC文件
            }));

            // 设置当前歌词路径（用于第一首歌）
            if (config.playlist.length > 0) {
                currentLyricPath = config.playlist[0].lrcPath;
                console.log('设置初始歌词路径:', currentLyricPath);
            }

            window.aplayer = new APlayer({
                container: container, // 播放器容器
                mini: config.settings.mini, // 是否为迷你模式
                autoplay: config.settings.autoplay, // 自动播放设置
                theme: config.settings.theme, // 主题颜色
                loop: config.settings.loop, // 循环模式 - 'all'全部循环, 'one'单曲循环, 'none'不循环
                order: config.settings.order, // 播放顺序 - 'list'列表顺序, 'random'随机播放
                preload: config.settings.preload || 'none', // 预加载 - 'auto'自动, 'metadata'仅元数据, 'none'不预加载
                volume: config.settings.volume, // 默认音量
                mutex: true, // 互斥播放 - true表示只允许一个播放器播放
                listFolded: config.settings.listFolded, // 播放列表是否折叠
                listMaxHeight: config.settings.listMaxHeight, // 播放列表最大高度（像素）
                // 音频文件配置 - 从配置文件加载
                audio: audioList
            });
            
            // 强制触发重绘
            container.offsetHeight;
            
            console.log('APlayer初始化成功！');
            
            // 初始化歌词显示功能 - 在播放器初始化后
            initLyricsDisplay();
            
            // 等待播放器完全初始化后，获取实际的当前歌曲索引
            setTimeout(() => {
                if (window.aplayer && window.aplayer.list && window.aplayer.list.index !== undefined) {
                    const actualIndex = window.aplayer.list.index;
                    console.log('播放器实际当前歌曲索引:', actualIndex);
                    if (config.playlist[actualIndex]) {
                        currentLyricPath = config.playlist[actualIndex].lrcPath;
                        console.log('更新为实际歌曲的歌词路径:', currentLyricPath);
                        // 重新加载正确的歌词
                        if (lyricsDisplay) {
                            lyricsDisplay.loadLyrics(currentLyricPath);
                        }
                    }
                }
            }, 100);
            
            // 播放器事件监听 - 用于调试和状态跟踪
            window.aplayer.on('loadstart', () => {
                console.log('开始加载音频');
            });
            
            window.aplayer.on('canplay', () => {
                console.log('音频可以播放');
            });
            
            window.aplayer.on('error', (error) => {
                console.error('播放器错误:', error);
            });

            // 添加播放时间更新监听，用于歌词同步
            window.aplayer.on('timeupdate', () => {
                if (lyricsDisplay && lyricsDisplay.isVisible) {
                    lyricsDisplay.updateCurrentLyric(window.aplayer.audio.currentTime);
                }
            });

            // 添加歌曲切换监听，更新歌词显示
            window.aplayer.on('listswitch', (index) => {
                console.log('切换到歌曲:', index.index);
                // 更新当前歌词路径
                if (config.playlist[index.index]) {
                    currentLyricPath = config.playlist[index.index].lrcPath;
                    console.log('更新歌词路径为:', currentLyricPath);
                    // 重新加载歌词
                    if (lyricsDisplay) {
                        lyricsDisplay.loadLyrics(currentLyricPath);
                    }
                }
                
                // 自动折叠播放列表
                setTimeout(() => {
                    if (window.aplayer && window.aplayer.list) {
                        // 检查播放列表是否展开，如果展开则折叠
                        const listElement = document.querySelector('.aplayer-list');
                        if (listElement && !listElement.classList.contains('aplayer-list-hide')) {
                            console.log('自动折叠播放列表');
                            window.aplayer.list.toggle();
                        }
                    }
                }, 100); // 延迟100ms确保歌曲切换完成
            });
            
            // 设置页面滚动监听，控制播放器显示和播放状态
            setupScrollListener();
            
        } catch (error) {
            console.error('APlayer初始化失败:', error);
        }
    }, 500); // 延迟500ms确保所有资源加载完成
}

/* ========================================
   页面滚动监听和播放器控制
   ======================================== */
// 设置滚动监听 - 使用Intersection Observer API监听页面滚动
function setupScrollListener() {
    // 创建交叉观察器 - 监听元素是否进入视口
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // 检查是否为第一页元素（文章列表页面）
            if (entry.target.id === 'page-1') {
                const page1 = entry.target;
                
                // 当第一页进入视口时（用户在第一页）
                if (entry.isIntersecting) {
                    console.log('用户在第一页');
                    // 添加visible类来显示文章列表
                    page1.classList.add('visible');
                } else {
                    // 当第一页离开视口时（用户离开第一页）
                    console.log('已离开第一页');
                    // 移除visible类来隐藏文章列表
                    page1.classList.remove('visible');
                    
                    // 自动收起文章列表 
                    const articleListContainer = document.querySelector('.article-list-container');
                    if (articleListContainer && articleListContainer.classList.contains('expanded')) {
                        const collapseBtn = document.querySelector('.mobile-collapse-btn');
                        if (collapseBtn) {
                            collapseBtn.click();
                        }
                    }
                }
            }
            
            // 检查是否为第二页元素（音乐播放器页面）
            if (entry.target.id === 'page-2') {
                const page2 = entry.target;
                
                // 当第二页进入视口时（用户滚动到第二页）
                if (entry.isIntersecting) {
                    console.log('用户滚动到第二页');
                    // 添加visible类来显示播放器 - 配合CSS控制显示/隐藏
                    page2.classList.add('visible');
                    
                    // 显示歌词容器
                    if (lyricsDisplay) {
                        lyricsDisplay.setVisible(true);
                    }
                    
                    // 如果播放器已初始化，尝试播放音乐
                    if (window.aplayer) {
                        // 尝试播放（可能会被浏览器的自动播放策略阻止）
                        const playPromise = window.aplayer.play();
                        // 检查播放Promise是否存在且有catch方法（避免TypeError）
                        if (playPromise && typeof playPromise.catch === 'function') {
                            playPromise.catch(e => {
                                console.log('自动播放被阻止，需用户交互');
                            });
                        }
                    }
                } else {
                    // 当第二页离开视口时（用户离开第二页）
                    console.log('用户离开第二页');
                    // 移除visible类来隐藏播放器
                    page2.classList.remove('visible');
                    
                    // 隐藏歌词容器
                    if (lyricsDisplay) {
                        lyricsDisplay.setVisible(false);
                    }
                    
                    // 如果播放器已初始化，暂停播放
                    if (window.aplayer) {
                        window.aplayer.pause(); // 暂停播放
                    }
                }
            }
        });
    }, {
        // 观察器配置
        threshold: 0.8, // 当80%的元素进入视口时触发
    });

    // 开始观察第一页和第二页元素
    const page1 = document.getElementById('page-1');
    const page2 = document.getElementById('page-2');
    
    if (page1) {
        observer.observe(page1); // 开始监听第一页的滚动状态
        // 页面加载时默认显示第一页
        page1.classList.add('visible');
    }
    
    if (page2) {
        observer.observe(page2); // 开始监听第二页的滚动状态
    }
}


// 文章数据存储
let articlesData = [];

// 初始化文章列表
async function initArticleList() {
    try {
        // 从blog-posts.json加载文章数据
        const response = await fetch('/data/blog-posts.json');
        articlesData = await response.json();
        
        // 渲染文章列表
        renderArticleList(articlesData);
        
        // 初始化搜索功能
        initArticleSearch();
        
        console.log('文章列表初始化完成');
    } catch (error) {
        console.error('加载文章数据失败:', error);
        // 显示错误信息
        const articleList = document.querySelector('.article-list');
        if (articleList) {
            articleList.innerHTML = '<div class="article-item">加载文章失败，请稍后重试</div>';
        }
    }
}

// 渲染文章列表
function renderArticleList(articles) {
    const articleList = document.querySelector('.article-list');
    if (!articleList) return;
    
    if (articles.length === 0) {
        articleList.innerHTML = '<div class="article-item">暂无文章</div>';
        return;
    }
    
    const articlesHTML = articles.map(article => `
        <div class="article-item" data-article-id="${article.id}">
            <h3>${escapeHtml(article.title)}</h3>
            <p>${escapeHtml(article.excerpt)}</p>
            <span class="article-date">${escapeHtml(article.date)}</span>
        </div>
    `).join('');
    
    articleList.innerHTML = articlesHTML;
    
    // 添加点击事件监听器
    addArticleClickListeners();
}

// 添加文章点击事件监听器
function addArticleClickListeners() {
    const articleItems = document.querySelectorAll('.article-item[data-article-id]');
    
    articleItems.forEach(item => {
        item.addEventListener('click', () => {
            const articleId = item.getAttribute('data-article-id');
            openArticle(articleId);
        });
    });
}

// 打开文章页面
function openArticle(articleId) {
    // 跳转到article.html页面，并传递文章ID
    window.location.href = `article.html?id=${articleId}`;
}

// 初始化搜索功能
function initArticleSearch() {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;
    
    // 防抖搜索
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = e.target.value.trim().toLowerCase();
            filterArticles(query);
        }, 300);
    });
}

// 过滤文章
function filterArticles(query) {
    if (!query) {
        renderArticleList(articlesData);
        return;
    }
    
    const filteredArticles = articlesData.filter(article => 
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.tags.some(tag => tag.toLowerCase().includes(query))
    );
    
    renderArticleList(filteredArticles);
}

// HTML转义函数
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

/* ========================================
   移动端文章列表控制功能
   ======================================== */

// 初始化移动端文章列表控制
function initMobileArticleListControl() {
    const expandBtn = document.querySelector('.mobile-expand-btn');
    const collapseBtn = document.querySelector('.mobile-collapse-btn');
    const articleListContainer = document.querySelector('.article-list-container');
    
    if (!expandBtn || !collapseBtn || !articleListContainer) {
        return; // 如果元素不存在则退出
    }
    
    // 展开按钮点击事件 - 增强Chrome移动端兼容性
    expandBtn.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        console.log('展开按钮被点击');
        console.log('当前文章列表状态:', articleListContainer.classList.contains('expanded'));
        
        // 强制触发重排以确保Chrome正确渲染
        articleListContainer.offsetHeight;
        
        // 添加expanded类
        articleListContainer.classList.add('expanded');
        
        // 验证类是否添加成功
        console.log('添加expanded类后:', articleListContainer.classList.contains('expanded'));
        
        // 强制重绘
        articleListContainer.style.transform = 'translateX(0)';
        articleListContainer.style.opacity = '1';
        
        // 添加一个小延迟确保动画效果
        setTimeout(() => {
            expandBtn.style.opacity = '0';
            expandBtn.style.pointerEvents = 'none';
            expandBtn.style.visibility = 'hidden';
        }, 100);
    });
    
    // 添加触摸事件支持（Chrome移动端）
    expandBtn.addEventListener('touchstart', function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        console.log('展开按钮触摸开始');
        
        // 强制触发重排
        articleListContainer.offsetHeight;
        
        // 添加expanded类
        articleListContainer.classList.add('expanded');
        
        // 强制重绘
        articleListContainer.style.transform = 'translateX(0)';
        articleListContainer.style.opacity = '1';
        
        setTimeout(() => {
            expandBtn.style.opacity = '0';
            expandBtn.style.pointerEvents = 'none';
            expandBtn.style.visibility = 'hidden';
        }, 100);
    }, { passive: false });
    
    // 收起按钮点击事件
    collapseBtn.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        console.log('收起按钮被点击');
        
        articleListContainer.classList.remove('expanded');
        // 恢复展开按钮的显示
        setTimeout(() => {
            expandBtn.style.opacity = '1';
            expandBtn.style.pointerEvents = 'auto';
            expandBtn.style.visibility = 'visible';
        }, 300); // 等待收起动画完成
    });
    
    // 添加触摸事件支持
    collapseBtn.addEventListener('touchstart', function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        console.log('收起按钮触摸开始');
        
        articleListContainer.classList.remove('expanded');
        
        setTimeout(() => {
            expandBtn.style.opacity = '1';
            expandBtn.style.pointerEvents = 'auto';
            expandBtn.style.visibility = 'visible';
        }, 300);
    });
    
    // 点击文章列表外部区域收起（仅在移动端）
    document.addEventListener('click', function(event) {
        // 检查是否为移动端
        if (window.innerWidth <= 768) {
            const isClickInsideList = articleListContainer.contains(event.target);
            const isClickOnExpandBtn = expandBtn.contains(event.target);
            const isClickOnCollapseBtn = collapseBtn.contains(event.target);
            
            // 如果点击在列表外部且不是按钮，则收起列表
            if (!isClickInsideList && !isClickOnExpandBtn && !isClickOnCollapseBtn) {
                if (articleListContainer.classList.contains('expanded')) {
                    collapseBtn.click(); // 触发收起逻辑
                }
            }
        }
    });
    
    // 监听窗口大小变化，处理桌面端/移动端切换
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            // 桌面端：移除展开状态，恢复展开按钮
            articleListContainer.classList.remove('expanded');
            expandBtn.style.opacity = '1';
            expandBtn.style.pointerEvents = 'auto';
            expandBtn.style.visibility = 'visible';
        }
    });
}

// 在页面加载完成后初始化移动端控制
document.addEventListener('DOMContentLoaded', function() {
    // 立即标记页面状态，避免按钮闪现
    document.body.classList.add('page-1-active');
    
    // 立即初始化移动端控制，避免闪现问题
    initMobileArticleListControl();
    
    // 确保第一页立即获得visible类
    const page1 = document.getElementById('page-1');
    if (page1) {
        page1.classList.add('visible');
    }
    
    // 初始化星星闪烁效果
    initStarsEffect();
});

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
    
    // 应用样式
    star.style.left = left + '%';
    star.style.top = top + '%';
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.setProperty('--duration', duration + 's');
    star.style.animationDelay = delay + 's';
    
    container.appendChild(star);
}
/* ========================================
   页面主功能和滚动控制
   ======================================== */

// 异步模块加载检查函数
function initModuleWhenAvailable(modulePath, moduleName, initCallback) {
    // 检查模块是否已加载
    const checkModule = () => {
        try {
            const parts = modulePath.split('.');
            let obj = window;
            
            // 逐级检查对象路径
            for (const part of parts) {
                if (!obj[part]) {
                    return false; // 模块未加载
                }
                obj = obj[part];
            }
            
            // 模块已加载，执行初始化
            console.log(`${moduleName}已加载，开始初始化`);
            initCallback();
            return true;
        } catch (error) {
            console.error(`检查${moduleName}时出错:`, error);
            return false;
        }
    };
    
    // 立即检查一次
    if (checkModule()) {
        return;
    }
    
    // 设置定期检查，最多检查10秒
    let checkCount = 0;
    const maxChecks = 20; // 20次 × 500ms = 10秒
    
    const intervalId = setInterval(() => {
        checkCount++;
        
        if (checkModule()) {
            clearInterval(intervalId);
            return;
        }
        
        // 超时处理
        if (checkCount >= maxChecks) {
            clearInterval(intervalId);
            console.warn(`${moduleName}加载超时，可能存在问题`);
        }
    }, 500);
}

//页面加载完成后执行的初始化函数
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，开始初始化');

    // 初始化悬浮框功能（包含打字机效果、社交链接等）
    if (typeof window.initFloatingBoxFeatures === 'function') {
        window.initFloatingBoxFeatures();
    } else {
        console.warn('浮动框功能模块未加载');
    }

    // 页面加载动画效果 - 淡入效果
    document.body.style.opacity = '0'; // 初始透明
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.7s ease-in-out'; // 0.7秒淡入过渡
        document.body.style.opacity = '1'; // 完全不透明
    }, 100); // 延迟100毫秒开始动画

    // 初始化音乐播放器 - 异步加载检查
    initModuleWhenAvailable('window.initMusicPlayer', '音乐播放器模块', () => {
        window.initMusicPlayer();
    });

    // 初始化星星效果 - 异步加载检查
    initModuleWhenAvailable('window.initStarsEffect', '星星效果模块', () => {
        window.initStarsEffect();
    });

    // 设置页面滚动监听
    setupScrollListener();

    console.log('页面主功能初始化完成');
});

function setupScrollListener() {
    // 页面处理器函数
    const handlePage1Intersect = (page, isIntersecting) => {
        if (isIntersecting) {
            console.log('用户在第一页');
            activatePage1(page);
        } else {
            console.log('已离开第一页');
            deactivatePage1(page);
        }
    };

    const handlePage2Intersect = (page, isIntersecting) => {
        if (isIntersecting) {
            console.log('用户滚动到第二页');
            activatePage2(page);
        } else {
            console.log('用户离开第二页');
            deactivatePage2(page);
        }
    };

    // 激活页面1
    function activatePage1(page) {
        page.classList.add('visible');
        document.body.classList.add('page-1-active');
        document.body.classList.remove('page-2-active');
    }

    // 停用页面1
    function deactivatePage1(page) {
        page.classList.remove('visible');
        document.body.classList.remove('page-1-active');
        collapseArticleList();
    }

    // 激活页面2
    function activatePage2(page) {
        page.classList.add('visible');
        document.body.classList.add('page-2-active');
        document.body.classList.remove('page-1-active');

        showLyrics();
        safePlayMusic();
    }

    // 停用页面2
    function deactivatePage2(page) {
        page.classList.remove('visible');
        document.body.classList.remove('page-2-active');

        hideLyrics();
        safePauseMusic();
    }

    // 自动收起文章列表
    function collapseArticleList() {
        const articleListContainer = document.querySelector('.article-list-container');
        if (articleListContainer?.classList.contains('expanded')) {
            const collapseBtn = document.querySelector('.mobile-collapse-btn');
            collapseBtn?.click();
        }
    }

    // 显示歌词
    function showLyrics() {
        if (window.lyricsDisplay) {
            window.lyricsDisplay.setVisible(true);
        }
    }

    // 隐藏歌词
    function hideLyrics() {
        if (window.lyricsDisplay) {
            window.lyricsDisplay.setVisible(false);
        }
    }

    // 创建交叉观察器
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            switch (entry.target.id) {
                case 'page-1':
                    handlePage1Intersect(entry.target, entry.isIntersecting);
                    break;
                case 'page-2':
                    handlePage2Intersect(entry.target, entry.isIntersecting);
                    break;
            }
        });
    }, {
        threshold: 0.8 // 当80%的元素进入视口时触发
    });

    // 开始观察页面元素
    const page1 = document.getElementById('page-1');
    const page2 = document.getElementById('page-2');

    page1 && observer.observe(page1);
    page2 && observer.observe(page2);

    console.log('页面滚动监听器设置完成');
}

//检查播放器状态和可用性
function isPlayerReady() {
    return window.aplayer &&
           typeof window.aplayer.play === 'function' &&
           typeof window.aplayer.pause === 'function' &&
           window.aplayer.audio;
}

//播放音乐
function safePlayMusic() {
    if (isPlayerReady()) {
        const playPromise = window.aplayer.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(e => {
                console.log('自动播放被阻止，需用户交互');
            });
        }
        return true;
    }
    return false;
}

// 暂停音乐
function safePauseMusic() {
    if (isPlayerReady()) {
        window.aplayer.pause();
        return true;
    }
    return false;
}
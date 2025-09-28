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
   社交媒体链接配置
   ======================================== */
// 社交媒体链接配置 - 可修改这些链接为您自己的社交媒体账号
const socialLinks = {
    github: 'https://github.com/aihaoDIYlove', // GitHub链接 - 请替换为您的GitHub链接
    bilibili: 'https://space.bilibili.com/62784664', // Bilibili链接 - 请替换为您的Bilibili链接
    zhihu: 'https://www.zhihu.com/people/ai-hao-diylove' // 知乎链接 - 请替换为您的知乎链接
};

/* ========================================
   页面初始化和事件监听
   ======================================== */
// 页面加载完成后执行的初始化函数
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 页面加载完成，开始初始化');
    
    // 初始化打字机动画效果
    const typewriterElement = document.querySelector('#typewriter-text');
    if (typewriterElement) {
        const typewriter = new TypewriterAnimation(typewriterElement);
        typewriter.start();
    }

    // 配置社交媒体链接 - 自动设置链接地址和安全属性
    const githubLink = document.querySelector('.social-link.github');
    if (githubLink) {
        githubLink.href = socialLinks.github;
        githubLink.target = '_blank'; // 新窗口打开
        githubLink.rel = 'noopener noreferrer'; // 安全属性
    }

    const bilibiliLink = document.querySelector('.social-link.bilibili');
    if (bilibiliLink) {
        bilibiliLink.href = socialLinks.bilibili;
        bilibiliLink.target = '_blank'; // 新窗口打开
        bilibiliLink.rel = 'noopener noreferrer'; // 安全属性
    }

    const zhihuLink = document.querySelector('.social-link.zhihu');
    if (zhihuLink) {
        zhihuLink.href = socialLinks.zhihu;
        zhihuLink.target = '_blank'; // 新窗口打开
        zhihuLink.rel = 'noopener noreferrer'; // 安全属性
    }

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
   音乐播放器初始化和配置
   ======================================== */
// 初始化音乐播放器 - 修复版本，确保播放器正常工作
function initMusicPlayer() {
    console.log('🎵 开始初始化音乐播放器');
    
    // 延迟初始化确保DOM完全加载 - 1000毫秒延迟
    setTimeout(() => {
        console.log('🔍 检查APlayer库和容器');
        
        // 检查APlayer库是否已加载
        if (typeof APlayer === 'undefined') {
            console.error('❌ APlayer库未加载');
            return;
        }
        
        // 检查播放器容器是否存在
        const container = document.getElementById('aplayer');
        if (!container) {
            console.error('❌ 未找到播放器容器');
            return;
        }
        
        console.log('✅ APlayer库和容器都已准备就绪');
        
        try {
            // 创建APlayer实例 - 音乐播放器配置
            window.aplayer = new APlayer({
                container: container, // 播放器容器
                mini: false, // 是否为迷你模式 - false为完整模式
                autoplay: true, // 是否自动播放 - false需要用户交互
                theme: '#ffffff', // 主题颜色 - 浅蓝色，可修改为其他颜色
                loop: 'one', // 循环模式 - 'all'全部循环, 'one'单曲循环, 'none'不循环
                order: 'list', // 播放顺序 - 'list'列表顺序, 'random'随机播放
                preload: 'auto', // 预加载 - 'auto'自动, 'metadata'仅元数据, 'none'不预加载
                volume: 0.05, // 默认音量 - 0.0到1.0之间，0.1为10%音量
                mutex: true, // 互斥播放 - true表示只允许一个播放器播放
                listFolded: false, // 播放列表是否折叠 - false为展开状态
                listMaxHeight: 90, // 播放列表最大高度（像素）- 可调整列表显示高度
                // 音频文件配置 - 可添加更多歌曲到这个数组
                audio: [{
                    name: '长岛', // 歌曲名称 - 可修改
                    artist: '花粥', // 艺术家名称 - 可修改
                    url: 'https://music.163.com/song/media/outer/url?id=419373910.mp3', // 音频文件URL - 可替换为其他音频链接
                    cover: 'https://www.gequhai.com/static/img/logo.png', // 封面图片URL - 可替换为其他图片链接
                    // 歌词配置 - LRC格式，可修改或添加实际歌词
                    lrc: '[00:00.00] 作词 : 花粥\n[00:01.00] 作曲 : 花粥\n[00:02.00] 编曲 : 花粥\n[00:03.00] 制作人 : 花粥\n[00:04.00] 吉他 : 花粥\n[00:05.00] 和声 : 花粥\n[00:06.00] 录音 : 花粥\n[00:07.00] 混音 : 花粥\n[00:08.00] 母带 : 花粥'
                }]
            });
            
            console.log('🎉 APlayer初始化成功！');
            
            // 播放器事件监听 - 用于调试和状态跟踪
            window.aplayer.on('loadstart', () => {
                console.log('🎵 开始加载音频');
            });
            
            window.aplayer.on('canplay', () => {
                console.log('✅ 音频可以播放');
            });
            
            window.aplayer.on('error', (error) => {
                console.error('❌ 播放器错误:', error);
            });
            
            // 设置页面滚动监听，控制播放器显示和播放状态
            setupScrollListener();
            
        } catch (error) {
            console.error('❌ APlayer初始化失败:', error);
        }
    }, 1000); // 延迟1秒确保所有资源加载完成
}

/* ========================================
   页面滚动监听和播放器控制
   ======================================== */
// 设置滚动监听 - 使用Intersection Observer API监听页面滚动
function setupScrollListener() {
    // 创建交叉观察器 - 监听元素是否进入视口
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // 检查是否为第二页元素
            if (entry.target.id === 'page-2') {
                const page2 = entry.target;
                
                // 当第二页进入视口时（用户滚动到第二页）
                if (entry.isIntersecting) {
                    console.log('📍 用户滚动到第二页');
                    // 添加visible类来显示播放器 - 配合CSS控制显示/隐藏
                    page2.classList.add('visible');
                    
                    // 如果播放器已初始化，尝试播放音乐
                    if (window.aplayer) {
                        // 尝试播放（可能会被浏览器的自动播放策略阻止）
                        const playPromise = window.aplayer.play();
                        // 检查播放Promise是否存在且有catch方法（避免TypeError）
                        if (playPromise && typeof playPromise.catch === 'function') {
                            playPromise.catch(e => {
                                console.log('🔇 自动播放被浏览器阻止，需要用户交互');
                            });
                        }
                    }
                } else {
                    // 当第二页离开视口时（用户离开第二页）
                    console.log('📍 用户离开第二页');
                    // 移除visible类来隐藏播放器
                    page2.classList.remove('visible');
                    
                    // 如果播放器已初始化，暂停播放
                    if (window.aplayer) {
                        window.aplayer.pause(); // 暂停播放
                    }
                }
            }
        });
    }, {
        // 观察器配置
        threshold: 0.7, // 当70%的元素进入视口时触发 - 可调整这个值改变触发时机
    });

    // 开始观察第二页元素
    const page2 = document.getElementById('page-2');
    if (page2) {
        observer.observe(page2); // 开始监听第二页的滚动状态
    }
}
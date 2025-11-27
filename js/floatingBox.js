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

// 社交媒体链接配置 - 可修改这些链接为您自己的社交媒体账号
const socialLinks = {
    github: 'https://github.com/aihaoDIYlove', // GitHub链接
    bilibili: 'https://space.bilibili.com/62784664', // Bilibili链接
    mbti: 'https://mbti.dreamripples.icu/' // mbti选择器链接
};

// 打字机效果和社交链接初始化
function initFloatingBoxFeatures() {
    console.log('初始化浮动框功能');

    // 初始化打字机动画效果
    const typewriterElement = document.querySelector('#typewriter-text');
    if (typewriterElement) {
        const typewriter = new TypewriterAnimation(typewriterElement);
        typewriter.start();
    }

    // 配置社交媒体链接
    const githubLink = document.querySelector('#github-link');
    if (githubLink) {
        githubLink.href = socialLinks.github;
        githubLink.target = '_blank';
        githubLink.rel = 'noopener noreferrer';
    }

    const bilibiliLink = document.querySelector('#bilibili-link');
    if (bilibiliLink) {
        bilibiliLink.href = socialLinks.bilibili;
        bilibiliLink.target = '_blank';
        bilibiliLink.rel = 'noopener noreferrer';
    }

    const mbtiLink = document.querySelector('#mbti-link');
    if (mbtiLink) {
        mbtiLink.href = socialLinks.mbti;
        mbtiLink.target = '_blank';
        mbtiLink.rel = 'noopener noreferrer';
    }

    // 初始化文章列表
    initArticleList();

    // 初始化移动端文章列表控制
    initMobileArticleListControl();

    console.log('浮动框功能初始化完成');
}

/* ========================================
   文章列表功能
   ======================================== */
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
function initMobileArticleListControl() {
    const expandBtn = document.querySelector('.mobile-expand-btn');
    const collapseBtn = document.querySelector('.mobile-collapse-btn');
    const articleListContainer = document.querySelector('.article-list-container');

    if (!expandBtn || !collapseBtn || !articleListContainer) {
        return; // 如果元素不存在则退出
    }

    // 展开按钮动画相关
    function handleExpand() {
        console.log('展开按钮被触发');

        // 添加expanded类
        articleListContainer.classList.add('expanded');

        // 强制重绘
        articleListContainer.style.transform = 'translateX(0)';
        articleListContainer.style.opacity = '1';

        // 使用CSS类控制展开按钮缩入动画
        expandBtn.classList.add('hiding');

        // 使用CSS类控制收起按钮伸出动画
        collapseBtn.classList.add('showing');
    }

    // 展开按钮点击事件
    expandBtn.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        handleExpand();
    });

    // 添加触摸事件支持
    expandBtn.addEventListener('touchstart', function(event) {
        event.preventDefault();
        event.stopPropagation();
        console.log('展开按钮 touchstart 事件触发');
        handleExpand();
    }, { passive: false });

    // 添加 touchend 事件作为补充
    expandBtn.addEventListener('touchend', function(event) {
        event.preventDefault();
        event.stopPropagation();
        console.log('展开按钮 touchend 事件触发');
    }, { passive: false });

    // 收起按钮点击事件
    collapseBtn.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();

        console.log('收起按钮被点击');

        articleListContainer.classList.remove('expanded');

        // 使用CSS类控制收起按钮缩回动画
        collapseBtn.classList.remove('showing');

        // 使用CSS类控制展开按钮伸出动画
        expandBtn.classList.remove('hiding');
    });

    // 添加触摸事件支持
    collapseBtn.addEventListener('touchstart', function(event) {
        event.preventDefault();
        event.stopPropagation();

        console.log('收起按钮触摸开始');

        articleListContainer.classList.remove('expanded');

        // 使用CSS类控制收起按钮缩回动画
        collapseBtn.classList.remove('showing');

        // 使用CSS类控制展开按钮伸出动画
        expandBtn.classList.remove('hiding');
    });

    // 点击文章列表外部区域收起（仅在移动端）
    document.addEventListener('click', function(event) {
        // 检查是否为移动端
        if (window.innerWidth <= 540) {
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
        if (window.innerWidth > 540) {
            // 桌面端：移除展开状态，恢复按钮状态
            articleListContainer.classList.remove('expanded');
            expandBtn.classList.remove('hiding');
            collapseBtn.classList.remove('showing');
        }
    });
}
// 打字机动画效果
class TypewriterAnimation {
    constructor(element) {
        this.element = element;
        this.texts = ['.icu', 'I see You'];
        this.currentTextIndex = 0;
        this.currentCharIndex = 0;
        this.isDeleting = false;
        this.isWaiting = false;
        this.typeSpeed = 200; // 打字速度
        this.deleteSpeed = 100; // 删除速度
        this.waitTime = 2000; // 等待时间
        this.deleteWaitTime = 2000; // 删除前等待时间
    }

    type() {
        const currentText = this.texts[this.currentTextIndex];
        
        if (this.isWaiting) {
            return;
        }

        if (!this.isDeleting) {
            // 打字阶段
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
            // 删除阶段
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

    start() {
        // 延迟开始动画
        setTimeout(() => {
            this.type();
        }, 1000);
    }
}

// 社交媒体链接配置
const socialLinks = {
    github: 'https://github.com/aihaoDIYlove', // 请替换为您的GitHub链接
    bilibili: 'https://space.bilibili.com/62784664', // 请替换为您的Bilibili链接
    zhihu: 'https://www.zhihu.com/people/ai-hao-diylove' // 请替换为您的知乎链接
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化打字机动画
    const typewriterElement = document.getElementById('typewriter-text');
    if (typewriterElement) {
        const typewriter = new TypewriterAnimation(typewriterElement);
        typewriter.start();
    }

    // 设置社交媒体链接
    const githubLink = document.getElementById('github-link');
    const bilibiliLink = document.getElementById('bilibili-link');
    const zhihuLink = document.getElementById('zhihu-link');

    if (githubLink) {
        githubLink.href = socialLinks.github;
        githubLink.target = '_blank';
        githubLink.rel = 'noopener noreferrer';
    }

    if (bilibiliLink) {
        bilibiliLink.href = socialLinks.bilibili;
        bilibiliLink.target = '_blank';
        bilibiliLink.rel = 'noopener noreferrer';
    }

    if (zhihuLink) {
        zhihuLink.href = socialLinks.zhihu;
        zhihuLink.target = '_blank';
        zhihuLink.rel = 'noopener noreferrer';
    }

    // 添加页面加载动画
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-in-out';
        document.body.style.opacity = '1';
    }, 100);
});
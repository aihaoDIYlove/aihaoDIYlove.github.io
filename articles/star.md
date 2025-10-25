# 创建网页星星闪烁效果教程

本文将教你如何使用HTML、CSS和JavaScript创建一个简单美丽的星星闪烁效果，这种效果非常适合用于网站的背景点缀

## 效果预览

- 请使用PC端访问我的博客，然后下滑，抵达音乐页即可查看效果
- 博客链接：[dreamripples.icu](https://dreamripples.icu/)

## 代码实现

### HTML结构

```html
<div class="stars-container desktop-only" id="stars-container"></div>
```

- `stars-container`：星星的容器，使用绝对定位覆盖在页面上方

### CSS样式

```css
/* 星星闪烁效果 */
.stars-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 50%; /* 只覆盖上半部分 */
    pointer-events: none;
    z-index: 2; /* 调整z-index，确保在背景之上 */
}
```

**CSS说明：**
- `position: absolute`：让星星容器脱离文档流，覆盖在其他内容上方
- `height: 50%`：星星只覆盖页面的上半部分，当然，你可以根据你的背景图来调整，确保星星呆在天空部分
- `pointer-events: none`：确保星星不会干扰用户的点击操作
- `z-index: 2`：控制层级，确保星星显示在背景之上但不会遮挡主要内容，可根据需求调整

### JavaScript功能

```javascript
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
}
```

**JavaScript说明：**
- `starCount`：控制星星的数量，可以根据需要调整
- 随机位置：确保星星不会出现在太靠近边缘的位置
- 随机大小：星星尺寸在1-4像素之间变化
- 随机闪烁周期：每个星星的闪烁速度都不同，创造更自然的效果

## 使用方法

1. 将HTML代码添加到你的网页中
2. 将CSS样式添加到你的样式表中
3. 在页面加载完成后调用 `initStarsEffect()` 函数


## 自定义选项

你可以通过修改配置参数来自定义效果：

- **星星数量**：调整 `starCount` 值
- **星星大小**：修改 `minSize` 和 `maxSize`
- **闪烁速度**：调整 `minDuration` 和 `maxDuration`
- **覆盖区域**：修改CSS中的 `height` 属性

### 结尾

- 如果有不明白的地方可以访问我的Github博客页仓库，里面可以查看博客的所有代码
- Github仓库：[aihaoDIYlove.github.io](https://github.com/aihaoDIYlove/aihaoDIYlove.github.io)

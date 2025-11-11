# dreamripples.icu 个人博客网站

## 文件结构

```text
public\
├── articles\                       # 博客文章目录
│   └── *.json                      # 博客文章文件
├── data\                           # 数据文件目录
│   └── blog-posts.json             # 博客文章索引
│   └── music-config.json           # 音乐配置文件
├── lyrics\                         # 歌词文件目录 音乐歌词文件 (LRC格式)
│   └── *.lrc                       # 文章对应的歌词文件
├── libs\                           # 静态资源库
│   └── *.min.js                    # 静态资源文件
│   └── *.min.css                   # 静态资源文件
├── image\                          # 图片资源目录
│   └── *.png                       # 图片资源文件
│   └── *.webp                      # 图片资源文件
│   └── favicon.ico                 # 网站图标
├── CNAME                           # GitHub Pages 自定义域名配置文件
├── LICENSE                         # 项目许可证文件
├── README.md                       # 项目说明文档
├── article.html                    # 文章详情页面文件
├── index.html                      # 主页面文件
├── script.js                       # 主要JavaScript功能文件
└── styles.css                      # 主要样式文件
```

## 博客功能

- **文章展示**：支持Markdown格式的博客文章
- **文章搜索**：实时搜索文章标题和内容
- **文章列表**：左下角常驻文章导航列表；移动端可收起/展开

## 页面功能

- **首页**：博客文章列表

- **音乐页**：播放器、歌词动画、星星闪烁动画
  
## 顶部悬浮区域

- **打字机动画**

- **社交网站导航**

### 页面加载优化

由于外部js和css文件的引入，导致页面加载不太稳定，我将外部资源文件托管在了`libs\`目录下。
分别是:

- **APIayer.min.css**: APIayer 样式文件
- **APIayer.min.js**：APIayer 脚本文件
- **marked.min.js**：Markdown渲染库
- **github-dark.min.css**：代码高亮样式
- **highlight.min.js**：代码高亮库
- **katex.min.css**：数学公式渲染样式
- **katex.min.js**：数学公式渲染库
- **auto-render.min.js**：自动渲染数学公式库

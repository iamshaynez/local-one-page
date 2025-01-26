// 创建一个自执行函数来加载分析代码
(async function loadAnalytics() {
    try {
        const response = await fetch('/include.html');
        const html = await response.text();
        
        // 创建一个临时容器
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // 获取所有脚本标签
        const scripts = temp.getElementsByTagName('script');
        
        // 逐个处理脚本
        Array.from(scripts).forEach(script => {
            const newScript = document.createElement('script');
            
            // 复制脚本的所有属性
            Array.from(script.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
            });
            
            // 复制脚本内容
            if (script.innerHTML) {
                newScript.innerHTML = script.innerHTML;
            }
            
            // 将新脚本添加到文档头部
            document.head.appendChild(newScript);
        });
    } catch (error) {
        console.error('Failed to load analytics:', error);
    }
})();


// ==用户脚本==
const FloatingAd = (function() {
    // 广告配置（可自由修改）
    const adConfigs = [
        {
            side: 'left',
            link: 'https://poawooptugroo.com/4/8852855',
            imgUrl: 'https://cdn.sa.net/2025/01/26/h1iAwKlFbQskICp.png',
            width: 160
        },
        {
            side: 'right', 
            link: 'https://poawooptugroo.com/4/8852858',
            imgUrl: 'https://cdn.sa.net/2025/01/26/edbUAq28CXwLyag.png',
            width: 180
        }
    ];

    // 创建广告元素
    function createAdElement(config) {
        const wrapper = document.createElement('div');
        wrapper.className = `float-ad ${config.side}-side`;
        
        // 广告链接
        const link = document.createElement('a');
        link.href = config.link;
        link.target = '_blank';
        
        // 广告图片
        const img = new Image();
        img.src = config.imgUrl;
        img.style.width = `${config.width}px`;
        img.alt = '广告推荐';
        
        // 关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.className = 'ad-close';
        closeBtn.innerHTML = '×';
        closeBtn.onclick = () => wrapper.remove(); // 直接移除DOM元素

        // 组合元素
        link.appendChild(img);
        wrapper.appendChild(link);
        wrapper.appendChild(closeBtn);
        return wrapper;
    }

    // 初始化样式
    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .float-ad {
                position: fixed;
                top: 50%;
                transform: translateY(-50%);
                z-index: 10000;
                background: #fff;
                border-radius: 6px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                padding: 12px;
                transition: opacity 0.2s;
            }
            .left-side { left: 20px; }
            .right-side { right: 20px; }
            .ad-close {
                position: absolute;
                top: -10px;
                right: -10px;
                width: 26px;
                height: 26px;
                background: #fff;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                font-size: 22px;
                line-height: 1;
                color: #666;
                transition: all 0.2s;
            }
            .ad-close:hover {
                background: #f0f0f0;
                transform: scale(1.1);
            }
            .float-ad img {
                display: block;
                border-radius: 4px;
            }
        `;
        document.head.appendChild(style);
    }

    // 主初始化方法
    function init() {
        injectStyles();
        adConfigs.forEach(config => {
            const ad = createAdElement(config);
            document.body.appendChild(ad);
        });
    }

    return { init };
})();

// 页面加载后初始化
window.addEventListener('load', () => {
    FloatingAd.init();
});
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
// 创建一个自执行函数来加载分析代码
(async function loadAnalytics() {
    try {
        // 检查当前域名是否匹配
        console.log('Current hostname:', window.location.hostname);
        if (window.location.hostname !== 'www.localhosts.vip') {
            console.log('Hostname does not match. Skipping analytics.');
            return;
        }
        
        // 获取当前路径
        const currentPath = window.location.pathname;
        console.log('Current path:', currentPath);
        
        console.log('Hostname match production. Loading scripts.');
        const response = await fetch('/include.html');
        const html = await response.text();
        
        // 创建一个临时容器
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // 获取所有脚本标签
        const scripts = Array.from(temp.getElementsByTagName('script'));
        
        // 根据路径判断加载多少个脚本
        const shouldLoadLimited = currentPath.startsWith('/games'); // 判断是否是 /games 路径
        const maxScripts = shouldLoadLimited ? 2 : scripts.length;
        const scriptsToLoad = scripts.slice(0, maxScripts); // 截取要加载的脚本
        
        // 逐个处理脚本
        let scriptCount = 0;
        scriptsToLoad.forEach(script => {
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
            scriptCount++;
        });
        
        // Print the total number of scripts loaded
        console.log(`Total scripts loaded: ${scriptCount}`);
        console.log(`Loading ${shouldLoadLimited ? 'limited' : 'all'} scripts based on path.`);
    } catch (error) {
        console.error('Failed to load analytics:', error);
    }
})();

// 查找现有的 favicon link 标签
let favicon = document.querySelector('link[rel="shortcut icon"]');

// 如果不存在，则创建新的
if (!favicon) {
    favicon = document.createElement('link');
    favicon.rel = 'shortcut icon';
    document.head.appendChild(favicon);
}

// 设置或更新 favicon 的 href
favicon.href = '/static/favicon.jpg';
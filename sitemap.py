import os
from datetime import datetime
import xml.etree.ElementTree as ET
from xml.dom import minidom

def generate_sitemap(website_root, base_url):
    """
    生成网站的 sitemap.xml
    
    参数:
        website_root: 网站根目录的本地路径
        base_url: 网站的基础URL，例如 'https://example.com'
    """
    
    # 移除 base_url 末尾的斜杠
    base_url = base_url.rstrip('/')
    
    # 创建根元素
    urlset = ET.Element('urlset')
    urlset.set('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
    
    # 递归遍历目录
    for root, dirs, files in os.walk(website_root):
        for file in files:
            if file.endswith('.html'):
                # 获取文件的完整路径
                file_path = os.path.join(root, file)
                
                # 获取相对于网站根目录的路径
                rel_path = os.path.relpath(file_path, website_root)
                
                # 将 Windows 路径分隔符转换为 URL 路径分隔符
                rel_path = rel_path.replace('\\', '/')
                
                # 如果是 index.html，去掉文件名
                if rel_path.endswith('index.html'):
                    rel_path = rel_path[:-10]
                
                # 构建完整的 URL
                if rel_path:
                    url = f'{base_url}/{rel_path}'
                else:
                    url = base_url
                
                # 获取文件的最后修改时间
                last_mod = datetime.fromtimestamp(os.path.getmtime(file_path))
                last_mod = last_mod.strftime('%Y-%m-%d')
                
                # 创建 URL 元素
                url_element = ET.SubElement(urlset, 'url')
                
                # 添加 loc 元素
                loc = ET.SubElement(url_element, 'loc')
                loc.text = url
                
                # 添加 lastmod 元素
                lastmod = ET.SubElement(url_element, 'lastmod')
                lastmod.text = last_mod
                
                # 添加 changefreq 元素（可选）
                changefreq = ET.SubElement(url_element, 'changefreq')
                changefreq.text = 'monthly'
                
                # 添加 priority 元素（可选）
                priority = ET.SubElement(url_element, 'priority')
                priority.text = '0.8'
    
    # 生成格式化的 XML
    xmlstr = minidom.parseString(ET.tostring(urlset)).toprettyxml(indent='    ')
    
    # 写入文件
    with open(os.path.join(website_root, 'sitemap.xml'), 'w', encoding='utf-8') as f:
        f.write(xmlstr)

# 使用示例
if __name__ == '__main__':
    website_root = './public'  # 替换为你的网站根目录
    base_url = 'https://www.localhosts.vip'  # 替换为你的网站 URL
    
    generate_sitemap(website_root, base_url)
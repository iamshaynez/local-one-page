import os
import json
from bs4 import BeautifulSoup
from typing import Dict, List

# 定义要排除的文件名列表
EXCLUDE_FILES = [
    'index.html',      
    'include.html',      
    'include-backup.html', 
    'about.html',
    'template.html'    
]

def should_process_file(filename: str) -> bool:
    """
    检查文件是否应该被处理
    """
    return filename.endswith('.html') and filename not in EXCLUDE_FILES

def scan_html_files(root_dir: str) -> List[Dict[str, str]]:
    pages = []
    
    # 遍历所有文件和目录
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # 只处理符合条件的 html 文件
        for filename in [f for f in filenames if should_process_file(f)]:
            full_path = os.path.join(dirpath, filename)
            relative_path = os.path.relpath(full_path, root_dir)
            
            # 获取类别（第一级目录名）
            path_parts = relative_path.split(os.sep)
            category = path_parts[0] if len(path_parts) > 1 else ''
            
            try:
                with open(full_path, 'r', encoding='utf-8') as f:
                    soup = BeautifulSoup(f.read(), 'html.parser')
                    
                    # 获取标题
                    title = ''
                    title_tag = soup.title
                    if title_tag:
                        title = title_tag.string.strip()
                    
                    # 获取描述
                    desc = ''
                    desc_tag = soup.find('meta', attrs={'name': 'description'})
                    if desc_tag:
                        desc = desc_tag.get('content', '').strip()
                    
                    # 构建 URL（使用正斜杠，即使在 Windows 上）
                    url = '/' + relative_path.replace('\\', '/')
                    
                    pages.append({
                        'title': title,
                        'desc': desc,
                        'category': category,
                        'url': url
                    })
                    
            except Exception as e:
                print(f"Error processing {full_path}: {str(e)}")
    
    return pages

def main():
    # 设置根目录路径（假设为 public）
    root_dir = 'public'
    
    # 确保根目录存在
    if not os.path.exists(root_dir):
        print(f"Directory {root_dir} does not exist!")
        return
    
    # 扫描所有 HTML 文件
    pages = scan_html_files(root_dir)
    
    # 将结果写入 JSON 文件
    output_file = 'public/pages.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(pages, f, ensure_ascii=False, indent=2)
    
    print(f"Processed {len(pages)} pages and saved to {output_file}")

if __name__ == '__main__':
    main()
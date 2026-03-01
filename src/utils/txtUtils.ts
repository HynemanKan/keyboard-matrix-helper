/**
 * 将文本复制到剪贴板
 * @param s 要复制的文本内容
 * @returns Promise<boolean> 复制成功返回 true，失败返回 false
 */
export async function saveToClipboard(s: string): Promise<boolean> {
    // 边界值检查
    if (!s || typeof s !== 'string') {
        console.warn('saveToClipboard: 要复制的内容必须是非空字符串');
        return false;
    }

    try {
        // 优先使用现代浏览器的 Clipboard API（异步、安全）
        await navigator.clipboard.writeText(s);
        return true;
    } catch (err) {
        console.warn('Clipboard API 不可用，降级使用传统方法:', err);

        // 降级方案：创建临时 textarea 元素实现复制
        const textarea = document.createElement('textarea');
        textarea.value = s;
        // 隐藏元素，避免影响页面布局
        textarea.style.position = 'fixed';
        textarea.style.top = '-9999px';
        textarea.style.left = '-9999px';

        document.body.appendChild(textarea);
        textarea.select();

        try {
            const success = document.execCommand('copy');
            if (success) {
                return true;
            } else {
                console.error('saveToClipboard: 传统复制方法执行失败');
                return false;
            }
        } catch (execErr) {
            console.error('saveToClipboard: 复制失败', execErr);
            return false;
        } finally {
            // 清理临时元素
            document.body.removeChild(textarea);
        }
    }
}

/**
 * 将文本内容保存为文件并触发下载
 * @param content 文件内容（文本）
 * @param fileName 下载的文件名（建议包含扩展名，如 "data.txt"）
 * @returns boolean 下载触发成功返回 true，失败返回 false
 */
export function saveToDownloadFile(content: string, fileName: string): boolean {
    // 边界值检查
    if (!content || typeof content !== 'string') {
        console.warn('saveToDownloadFile: 文件内容必须是非空字符串');
        return false;
    }
    if (!fileName || typeof fileName !== 'string') {
        console.warn('saveToDownloadFile: 文件名不能为空');
        return false;
    }

    try {
        // 创建 Blob 对象（存储文本内容）
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        // 创建下载链接
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = fileName; // 设置下载文件名
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click(); // 触发点击下载

        // 清理资源
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return true;
    } catch (err) {
        console.error('saveToDownloadFile: 下载文件失败', err);
        return false;
    }
}

/**
 * 触发用户选择文件并读取文本内容
 * @param accept 指定可选择的文件类型（默认所有文本文件），例如 ".txt,.json" 或 "text/*"
 * @returns Promise<string> 成功返回文件内容字符串，失败/取消选择则抛出错误
 */
export function readFromFile(accept: string = 'text/*'): Promise<string> {
    return new Promise((resolve, reject) => {
        // 创建隐藏的文件选择input元素
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = accept; // 限制文件类型
        input.style.display = 'none';

        // 监听文件选择事件
        input.addEventListener('change', async (e) => {
            const target = e.target as HTMLInputElement;
            const file = target.files?.[0];

            if (!file) {
                reject(new Error('未选择任何文件'));
                document.body.removeChild(input);
                return;
            }

            try {
                // 使用FileReader读取文件内容为字符串
                const reader = new FileReader();
                reader.onload = (event) => {
                    const content = event.target?.result as string;
                    resolve(content);
                    document.body.removeChild(input); // 清理元素
                };
                reader.onerror = (error) => {
                    //@ts-ignore
                    reject(new Error(`读取文件失败: ${error.message}`));
                    document.body.removeChild(input);
                };
                // 以UTF-8编码读取文本文件
                reader.readAsText(file, 'UTF-8');
            } catch (err) {
                reject(new Error(`处理文件时出错: ${(err as Error).message}`));
                document.body.removeChild(input);
            }
        });

        // 监听取消选择（点击取消按钮）的情况
        input.addEventListener('cancel', () => {
            reject(new Error('用户取消了文件选择'));
            document.body.removeChild(input);
        });

        // 添加到页面并触发点击
        document.body.appendChild(input);
        input.click();
    });
}

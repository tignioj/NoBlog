/**
 * Markdown 解析器
 * 支持列表如下
 *      1. 标题
 *      2. li
 *      3. 图像
 *      4.
 * @param mdText
 */
window.onload = function () {
    var md = "./posts/1.md";
    // var md = "./posts/post.md";
    var str = getFileString(md);
    var html = markdownParse(str);
    document.getElementById("app").innerHTML = html;
}


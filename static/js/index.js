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
    let md = "./posts/1.md";
    // let md = "./posts/poem.md";
    // let md = "./posts/blocktest.md";
    // var md = "./posts/2.md";
    // var md = "./posts/3.md";
    // var md = "./posts/post.md";
    loadFileString(md, loadDoc);
    loadIndicator()
};

function loadDoc(str) {
    let markedHtml = markdownParse(str);
    document.getElementById("content").innerHTML = markedHtml.html;
}

function loadIndicator() {
}


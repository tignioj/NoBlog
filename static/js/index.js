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
    // let md = "./posts/empty.md";
    // let md = "./posts/poem.md";
    // let md = "./posts/blocktest.md";
    // var md = "./posts/2.md";
    // var md = "./posts/3.md";
    // var md = "./posts/post.md";
    loadFileString(md, loadDoc);
};

function loadDoc(str) {
    let markedHtml = markdownParse(str);
    document.getElementById("content").innerHTML = markedHtml;
    loadIndicator()
}


/**
 * 存储每个级别递增到的序号
 * @type {Map<any, any>}
 */
loadIndicator.levelMap = new Map();

function loadIndicator() {
    function getPrefix(level) {
        let prefix = "";
        let m = loadIndicator.levelMap;
        for (let i = 1; i < level; i++) {
            let preCount = m.get(i);
            //因为上一级别的递增了，所以我们要减去1, 如果上一级没有存数，则设置为1
            preCount = preCount === undefined ? 1 : preCount - 1;
            prefix += preCount + ".";
        }
        return prefix;
    }

    let indicator = document.getElementById("indicator");

    let indicatorWraperEle = document.createElement("div");

    let catalogEle = document.createElement("div");
    catalogEle.classList.add("md-indicator-bar");
    let toggleBtn = document.createElement("span");
    toggleBtn.classList.add("md-indicator-btn");
    toggleBtn.innerText = "+";
    toggleBtn.addEventListener('click', function () {
        toggleCatalog(this, this.parentElement.nextSibling);
    });
    // toggleBtn.onclick =  toggleCatalog;
    catalogEle.appendChild(toggleBtn);

    let headers = document.getElementsByClassName("header");

    // indicator.appendChild(catalogEle);
    document.getElementById("app").appendChild(catalogEle);

    if (headers.length === 0) {
        indicator.style.visibility = "visibility: hidden";
        return;
    } else {
        indicator.style.cssText += "visibility: visible;";
    }

    for (let i = 0; i < headers.length; i++) {
        let header = headers[i];
        let headerName = header.tagName;
        let headerLevel = headerName.replace("H", "");
        let level = parseInt(headerLevel);


        //拿到当前缩进级别的序号
        let levelCount = loadIndicator.levelMap.get(level);
        //如果发现为未定义，则需要从1开始计算
        if (levelCount === undefined) {
            levelCount = 1;
            loadIndicator.levelMap.set(level, levelCount);
        }

        let style = getPrefix(level) + levelCount + " ";


        //当前level递增
        loadIndicator.levelMap.set(level, levelCount + 1);

        /*避免污染后面的*/
        for (let i = level + 1; i < loadIndicator.levelMap.size; i++) {
            loadIndicator.levelMap.set(i, 1);
        }

        let aEle = document.createElement("p");
        aEle.style.cssText = "margin-left:" + (level * 20) + "px;";
        aEle.classList.add("md-indicator-line");
        aEle.addEventListener('click', function () {
            jumpTo(header);
        });
        aEle.innerText = style + header.innerText;
        indicatorWraperEle.appendChild(aEle);
        // let br = document.createElement("br");
        // indicatorWraperEle.appendChild(br);
    }
    indicator.appendChild(indicatorWraperEle);
}

function jumpTo(element) {
    // var scrollvalue = document.getElementById("custom").offsetTop;
    //TODO 不兼容IE
    let scrollvalue = element.offsetTop;
    window.scrollTo({
        top: scrollvalue,
        behavior: "smooth"
    });
}

//TODO 手机刚进入时默认目录隐藏

/*目录折叠*/
function toggleCatalog(button) {
    let indicator = document.getElementById("indicator");
    button.style.transform = "-webkit-transform 500ms ease-in-out";
    if (button.innerText === "+") {
        button.innerText = "-";
        button.style.transform = "rotate(180deg)";
    } else {
        button.innerText = "+";
        button.style.transform = "rotate(0deg)";
        button.style.transform = "translateX(0)";
    }
    let display = indicator.style.display;
    indicator.style.display = display === ("" || "none") ? "block" : "none";
}


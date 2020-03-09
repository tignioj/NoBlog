//TODO
// 1. 指示器指向当前浏览的位置
// 2. 目录只显示H1, 其余的当浏览到该位置时再显示


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
 * 存储每个级别递增到的序号, 比如
 * level1 目前是1
 * level2 目前是3
 * 那么存储的结构就是
 * {
 *     1: 1,
 *     2, 3
 * }
 * @type {Map<string, int>}
 */
loadIndicator.levelMap = new Map();


/**
 * 加载目录
 */
function loadIndicator() {
    /**
     * 获取标题前缀，比如 1., 1.1, 1.1.1, 2.1, 2.1.1等
     * @param level 当前缩进级别, 根据4个空格为一个缩进判断
     * @returns {string}
     */
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

    //创建一个目录div
    let indicatorWraperEle = document.createElement("div");

    //创建一个目录导航条div
    let catalogEle = document.createElement("div");
    catalogEle.classList.add("md-indicator-bar");
    //给导航条添加toggle按钮，用于显示/隐藏目录
    let toggleBtn = document.createElement("span");
    toggleBtn.classList.add("md-indicator-btn");
    toggleBtn.innerText = "+";
    //点击按钮时，调用方法隐藏/显示按钮
    toggleBtn.addEventListener('click', function () {
        toggleCatalog(this, this.parentElement.nextSibling);
    });
    // toggleBtn.onclick =  toggleCatalog;
    catalogEle.appendChild(toggleBtn);

    let headers = document.getElementsByClassName("header");

    // indicator.appendChild(catalogEle);
    document.getElementById("app").appendChild(catalogEle);

    //如果么有任何一个header标签，就隐藏目录
    if (headers.length === 0) {
        indicator.style.visibility = "visibility: hidden";
        return;
    } else {
        indicator.style.cssText += "visibility: visible;";
    }

    //遍历每一个标题，存到目录div里面
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
        // aEle.style.cssText = "margin-left:" + (level * 20) + "px;";
        let spaces = "";
        for (let j = 0; j < level; j++) {
            spaces += "&nbsp;&nbsp;&nbsp;&nbsp;";
        }
        aEle.classList.add("md-indicator-line");
        aEle.addEventListener('click', function () {
            jumpTo(header);
        });
        aEle.innerHTML = spaces + style + header.innerText;


        indicatorWraperEle.appendChild(aEle);
        // let br = document.createElement("br");
        // indicatorWraperEle.appendChild(br);
    }
    indicator.appendChild(indicatorWraperEle);


}

/**
 * 存放每个header的高度
 * 用途: 页面滚动时查询该高度的元素
 * @type {Map<number, Node>}
 */
document.getElementById("back-to-top-btn").addEventListener("click", function () {
    scrolltotop();
});


/**
 * 获取当前可见区域内，距离屏幕顶部最近的元素
 * @param currentPageYOffset
 */
function getCurrentScrollElement(currentPageYOffset) {
    let headers = document.getElementsByClassName("header");
    let currentIndex = 0;
    for (let i = currentIndex; i < headers.length; i++) {
        let currentHeader = headers[currentIndex];
        let eleOffsetTop = currentHeader.offsetTop;
        if (currentPageYOffset + headers[0].offsetTop >= eleOffsetTop) {
            currentIndex++;
        }
    }
    getCurrentScrollElement.preElement = document.getElementsByClassName("md-indicator-line")[currentIndex-1];
    let headersInIndicator = document.getElementsByClassName("md-indicator-line");
    return headersInIndicator[currentIndex-1];
}

/**
 * 上一个获取到的元素
 * @type {Element}
 */
getCurrentScrollElement.preElement = document.getElementsByClassName("md-indicator-line")[0];


window.onscroll = function () {
    //当处于顶部时，隐藏“回到顶部”按钮
    if (window.pageYOffset > 50) {
        document.getElementById("back-to-top-btn").style.bottom = "20px";
    } else {
        document.getElementById("back-to-top-btn").style.bottom = "-90px";
    }

    // let percent = getReadingProcess();
    // document.getElementById("back-to-top-btn").style.backgroundSize = "100% " + percent * 100 + "%";
    /**
     * 思路：
     * 1. 获取window总高度 body.scrollHeight
     * 2. 获取网页滚动到的高度 body.pageYOffset
     * 3. 获取第一个元素滚动到的高度
     *  如何获取？
     *      再某个范围内
     * 4. 如果第一个超出了
     *
     */
    let pE = getCurrentScrollElement.preElement === undefined ? document.getElementsByClassName("md-indicator-line")[0] : getCurrentScrollElement.preElement;
    pE.style.backgroundColor = "transparent";
    let currentElement = getCurrentScrollElement(window.pageYOffset);
    // console.log(pE.innerText + "-->" + currentElement.innerText);
    currentElement.style.backgroundColor = "darkgrey";
};

/**
 * 获取阅读进度百分比，范围0-1
 * @returns {number}
 */
function getReadingProcess() {
    return getScrollTop() / (getScrollHeight() - getClientHeight());
}


function jumpTo(element) {
    // element.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
    element.scrollIntoView();
}


/*目录折叠*/
function toggleCatalog(button) {
    let indicator = document.getElementById("indicator");


    //当PC为""或"none"时成立
    //ele.style.XX 此方法获取的是内联样式表，因此初次获取时手机和电脑端都为"", 所以应该要获取外联样式表window.getComputedStyle(element,pseudoElement).XXX
    // let display = indicator.style.display;
    let display = window.getComputedStyle(indicator, null).display;
    if (display === "none") {
        indicator.style.display = "block";
    } else {
        indicator.style.display = "none";
    }
    // indicator.style.display = (display === ("" || "none")) ? "block" : "none";

    button.style.transform = "-webkit-transform 500ms ease-in-out";
    if (button.innerText === "+") {
        button.innerText = "-";
        button.style.transform = "rotate(180deg)";
    } else {
        button.innerText = "+";
        button.style.transform = "rotate(0deg)";
        button.style.transform = "translateX(0)";
    }
}


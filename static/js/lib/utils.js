/**
 * 这个例子返回了一个在指定值之间的随机数。这个值不小于 min（有可能等于），并且小于（不等于）max。
 * @param min
 * @param max
 * @returns {*}
 */
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * 这个例子返回了一个在指定值之间的随机整数。这个值不小于 min （如果 min 不是整数，则不小于 min 的向上取整数），且小于（不等于）max。
 * @param min
 * @param max
 * @returns {number}
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //不含最大值，含最小值
}

function ajaxLoadSuccess() {

}

function ajaxLoadError() {

}

/**
 * 获取文件的字符串
 * @returns {string}
 */
function loadFileString(url, success, err) {
    let xhr = getXMLHttp();
    xhr.open("GET", url);
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            success(xhr.responseText);
        }
    }
}



/**
 * 读取URL以定位文章
 * @param variable
 * @returns {string|boolean}
 */
function getQueryVariable(variable) {
    let query = window.location.search.substring(1);
    let vars = query.split("&");
    for (let i = 0; i < vars.length; i++) {
        let pair = vars[i].split("=");
        if (pair[0] === variable) {
            return pair[1];
        }
    }
    return false;
}

/**
 * 获取异步请求对象
 * @returns {XMLHttpRequest}
 */
function getXMLHttp() {
    let xmlhttp;
    xmlhttp = null;
    if (window.XMLHttpRequest) {// code for all new browsers
        xmlhttp = new XMLHttpRequest();
    } else if (window.ActiveXObject) {// code for IE5 and IE6
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    if (xmlhttp != null) {
        return xmlhttp;
    } else {
        alert("Your browser does not support XMLHTTP.");
    }
}


/**
 * 检测是否为IE
 * @returns {boolean}
 */
function isIE() { //ie?
    if (!!window.ActiveXObject || "ActiveXObject" in window)
        return true;
    else
        return false;
}


/**
 * 网页当前滚动的高度
 * @returns {number}
 */
function getScrollTop() {
    let scrollTop = 0;
    if (document.documentElement && document.documentElement.scrollTop) {
        scrollTop = document.documentElement.scrollTop;
    } else if (document.body) {
        scrollTop = document.body.scrollTop;
    }
    return scrollTop;
}

/**
 * 网页可见高度
 * @returns {number}
 */
function getClientHeight() {
    return document.documentElement.clientHeight;
}

//网页正文全文高： document.body.scrollHeight;
function getScrollHeight() {
    return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
}

//回到顶部
function scrolltotop() {
    // let currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
    let currentScroll = window.pageYOffset;
    if (currentScroll > 0) {
        window.requestAnimationFrame(scrolltotop);
        let intervalHeight = currentScroll - currentScroll / 2;

        /*在IE中可能会计算不到intervalHeight == 0的情况, 我们需要手动置为0*/
        if (intervalHeight <= 5) {
            intervalHeight = 0;
        }
        window.scrollTo(0, intervalHeight);
    }
}


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
/**
 * 获取文件的字符串
 * @returns {string}
 */
function getFileString(url) {

    var xhr = getXMLHttp();
    xhr.open("GET", url, false);
    xhr.send();
    return xhr.responseText
}

function getXMLHttp() {
    var xmlhttp;
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


/**
 * 解析标题
 * @param index
 * @param str
 * @returns {string|*}
 */
function parseHeader(str) {
// 开头到第一个#之间不能有除了#之外的内容
    var index = str.indexOf("#");
    if (index != 0 && str.substring(0, index).match(/[^#]/) == null) {
        return str;
    }

    //计算#的长度
    var sstr = str.substring(index);
    var len = 0;
    for (var i = 0; i < sstr.length; i++) {
        if (sstr.charAt(i) == '#') {
            len++;
        }
    }
    sstr = "<h" + len + ">" + sstr.substring(len) + "</h" + len + ">";

    return sstr;
}

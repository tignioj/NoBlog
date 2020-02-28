/**
 * 解析标题
 * @param str
 * @returns {string|*}
 */
function parseHeader(str) {
// 开头到第一个#之间不能有除了#之外的内容
    let index = str.indexOf("#");
    if (index != 0 && str.substring(0, index).match(/[^#]/) == null) {
        return str;
    }

    //计算#的长度
    let sstr = str.substring(index);
    let len = 0;
    for (let i = 0; i < sstr.length; i++) {
        if (sstr.charAt(i) === '#') {
            len++;
        }


    }
    sstr = "<h" + len + ">" + sstr.substring(len) + "</h" + len + ">";

    return sstr;
}

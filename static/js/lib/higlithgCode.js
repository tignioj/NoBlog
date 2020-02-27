/**
 * 高亮代码
 * 原理：封装css
 * @param rawCode 未高亮的代码
 * @param language 语言
 */
function higlightCode(rawCode, language) {
    if (language == null || language == "") {
        language = "default";
    }
    language = language.toLowerCase();


    switch (language) {
        case "java":
            // return parseJava(rawCode);
            return parseDefault(rawCode);
            break;
        case "default":
            return parseDefault(rawCode);
            break;
        default:
            return parseDefault(rawCode);

    }
}


/**
 * 获取随机颜色
 */
var colors = ["red", "blue", "green", "deeppink", "purple"]

function getRanDomColor() {
    return colors[getRandomInt(0, colors.length)];
}

function parseDefault(rawCode) {
    return "<span style='color: " + getRanDomColor() + ";font-weight: bold'>" + rawCode + "</span>";
}

function parseJava(rawCode) {
    var colors = ['red', 'blue', 'green', 'purple', 'deeppink']
    var index = 0;
    // rawCode = "<span style='color: " + colors[index++] + "'>" + rawCode;
    // rawCode = rawCode.replace(/\./g, "</span>.<span style='color: blue'>")
    var pat = /[\. ]/g
    var obj = pat.exec(rawCode);
    var nCode = "";
    var preIndex = 0;
    while (obj != null) {
        var leftStr = "<span style='color: " + colors[index++] + "'>" + rawCode.substring(preIndex, obj.index) + "</span>";
        preIndex = obj.index;
        nCode += leftStr;
        obj = pat.exec(rawCode);
    }

    // rawCode += "</span>";
    return (nCode == null || nCode.length === 0) ? rawCode : nCode;
    // var beginPoint = false;
    // for (var i = 0; i < rawCode.length; i++) {
    //     if (beginPoint)
    // }
}


//转义xml
var escapeTest = /[&<>"']/;
var escapeReplace = /[&<>"']/g;
var replacements = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
};

var escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/;
var escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g;

function escape(html, encode) {
    if (encode) {
        if (escapeTest.test(html)) {
            return html.replace(escapeReplace, function (ch) {
                return replacements[ch];
            });
        }
    } else {
        if (escapeTestNoEncode.test(html)) {
            return html.replace(escapeReplaceNoEncode, function (ch) {
                return replacements[ch];
            });
        }
    }
    return html;
}




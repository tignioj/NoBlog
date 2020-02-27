/**
 * markdown解析
 * @param str
 */
function markdownParse(str) {
    // document.write("<h1>hello</h1>")
    var arry = str.split("\n");
    var html = "";
    var multiLineArr = [];
    var multiLineBegin = false;
    var singleLine = "";

    for (var i = 0; i < arry.length; i++) {
        singleLine = arry[i];
        //当开启多行时，不因该再进入这里，因为结束也是```
        //     开头，防止结束的时候再次进入这里
        //TODO xml出现问题,因为它被HTML解析了...

        if (multiLineBegin === false && singleLine.match(/^```/g)) {
            multiLineBegin = true;
            multiLineArr.push(singleLine);
            continue;
        }
        if (multiLineArr.length > 0) {
            //如果mtarr里面有东西,说明开启了多行代码解析，此时判断是否结束多行
            if (singleLine.match(/```/g)) {
                multiLineBegin = false;
                multiLineArr.push(singleLine);
                html += parseCode(multiLineArr, true);
                multiLineArr = [];
            } else {
                //否则需要继续添加
                multiLineArr.push(singleLine);
                continue;
            }
        }

        //单行代码解析
        var reg = /`[^`]/g;
        if (singleLine.trim().match(reg) != null) {
            html += parseCode([singleLine], false);
            continue;
        }

        //非代码需要进行转义
        singleLine = escape(singleLine, false);
        html += replaceLine(singleLine);
    }
    return html;
}


function replaceLine(str) {
    var index = str.indexOf("#");
    if (index != -1) {
        return parseHeader(str);
    }

    index = str.indexOf("-");
    if (index != -1) {
        return "<li>" + str.substring(index + 1) + "</li>"
    }

    //图像
    // var teststr = "![abc](http://img.wszjl.com/images/background/jpg/22.jpg)";
    var reg = /!\[(.*)\]\((.*)\)/g
    var obj = reg.exec(str);
    if (obj != null) {
        var altText = obj[1];
        var url = obj[2];
        var imgEle = "<span>" + "<img style=\"width: 100%\" alt=\"" + altText + "\"src=" + url + "/>" + "</span>"
        return imgEle;
    }

    //链接
    //TODO 带标题的链接
    var lnReg = /\[(.*)\]\((.*)\)/g
    var lnObj = lnReg.exec(str);
    if (lnObj != null) {
        var lnText = lnObj[1];
        var url = lnObj[2];
        var lnEle = "<a  href=" + url + ">" + lnText + "</a>"
        return lnEle;
    }

    // 两个tab构成的block
    var blockReg = /\s{4,}/g;

    // return str;
    return "<p>" + str + "</p>"
}


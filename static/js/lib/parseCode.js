/**
 * 解析Mardown代码块
 * 注意：防止xml被解析！需要转义 > <
 */
function parseCode(arr, isMultiLine) {
    //解析前的代码数组
    var codeArr = arr;
    //解析后的html对象
    var codeEle;
    //代码类型
    var type;

    if (arr == null) {
        throw "传入的code数组不能为空！"
    }
    var codeArr = arr;


    var type = initType(arr[0]).trim();
    initCode(codeArr);

    /**
     * 获取代码类型
     * @param firstLine
     */
    function initType(arrElement) {
        if (arrElement == null || arrElement == "") {
            return "default";
        }
        if (isMultiLine) {
            var index = arrElement.indexOf("```");
            return arrElement.substring(index + 3);
        } else {
            var index = arrElement.indexOf("`");
            return arrElement.substring(index + 1);
        }
    }

    function getType() {
        return type;
    }


    /**
     * 初始化代码块
     */
    function initCode(codeArr) {
        //如果是单行代码
        if (!isMultiLine) {
            var singleCodeLine = codeArr[0];
            var testStr = singleCodeLine;

            var nstr = "";
            var codeStart = false;
            var codeArr = [];
            for (var i = 0; i < testStr.length; i++) {
                var c = testStr[i];
                //说明进入了代码块
                if (codeStart == false && c === "`") {
                    nstr += "<span style='border:1px solid black; border-radius: 4px; padding: 4px; background: aliceblue'>"
                    codeStart = true;
                    codeArr.push(c);
                    if (escapeTest.test(c)) {
                        c = replacements[c];
                    }
                    nstr += c;
                    continue;
                }
                //说明了进入了代码块
                if (codeArr.length > 0) {
                    //说明该结束了
                    if (c === "`") {
                        codeStart = false;
                        codeArr = [];
                        nstr += "</span>"
                        continue;
                    }
                    //转义
                    if (escapeTest.test(c)) {
                        c = replacements[c];
                    }
                    nstr += c;
                    continue;
                } else {
                    //转义
                    if (escapeTest.test(c)) {
                        c = replacements[c];
                    }
                    nstr += c;
                }
            }
            codeEle = nstr;

            var index = codeEle.indexOf("#");
            if (index != -1) {
                codeEle = parseHeader(codeEle);
            }
        } else {
            codeEle = "<div style='border: 1px solid black; border-radius: 4px; padding: 20px; overflow: auto'>";
            // this.codeEle = "<div style='border: 1px solid black; border-radius: 4px; padding: 20px; overflow: auto'>";
            //如果是多行代码去掉第一行和最后一行，因为它们都包含了```
            for (var i = 1; i < codeArr.length - 1; i++) {

                var singleCodeLine = codeArr[i];
                singleCodeLine = escape(singleCodeLine, false);
                //代码缩进把空格替换成 &nbsp;
                singleCodeLine = singleCodeLine.replace(/ /g, "&nbsp;")
                //代码高亮
                singleCodeLine = higlightCode(singleCodeLine, getType());

                var singleCodeLineEle = "<p>" + singleCodeLine + "</p>"
                codeEle += singleCodeLineEle;
            }
            codeEle += "</div>"
        }
    }
    /**
     * 获取生成后的html
     * @returns {*}
     */
    return codeEle
}

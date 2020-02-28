function MultiLineParser(arr, isMultiLine) {
    if (arr == null) {
        throw "传入的code数组不能为空！"
    }
    //解析前的代码数组
    this.codeArr = arr;
    //解析后的html对象
    this.codeEle = "";
    //代码类型
    this.type = initType(arr[0]).trim();

    /**
     * 获取代码类型
     * @param arrElement
     */
    function initType(arrElement) {
        if (arrElement == null || arrElement === "") {
            return "default";
        }
        if (isMultiLine) {
            let index = arrElement.indexOf("```");
            return arrElement.substring(index + 3);
        }
        return "default";
    }

    this.getType = function () {
        return this.type;
    }

    /**
     * 初始化代码块
     */
    this.initCode = function () {
        isMultiLine ? initMultiLineCode.call(this) : initSingleLine.call(this);

        function initMultiLineCode() {
            // this.codeEle = "<div class='code code-multi-frame' style='border: 1px solid black; border-radius: 4px; padding: 20px; overflow: auto'>";
            this.codeEle = "<div class='code code-multi-frame''>";
            this.codeEle += "<ol>"
            //如果是多行代码去掉第一行和最后一行，因为它们都包含了```
            for (let i = 1; i < this.codeArr.length - 1; i++) {
                let singleCodeLine = this.codeArr[i];
                singleCodeLine = escapeCode(singleCodeLine, false);
                //代码缩进把空格替换成 &nbsp;
                singleCodeLine = singleCodeLine.replace(/ /g, "&nbsp;")
                // singleCodeLine = singleCodeLine.replace(/ /g, "&nbsp;&nbsp;")
                //代码高亮
                singleCodeLine = higlightCode(singleCodeLine, this.getType());

                let singleCodeLineEle = "<li class='code-multi-frame-line'>" + singleCodeLine + "</li>"
                this.codeEle += singleCodeLineEle;
            }
            this.codeEle += "</ol>"
            this.codeEle += "</div>"
        }

        /**
         * 思路
         * 遍历一整行，发现`就用html标签替换，再次出现则使用对应的标签闭合
         */
        function initSingleLine() {
            let singleCodeLine = this.codeArr[0];
            let nstr = "";
            let codeStart = false;
            let tempArr = [];
            //遍历每一个字符
            for (let i = 0; i < singleCodeLine.length; i++) {
                let c = singleCodeLine[i];
                //说明进入了代码块
                if (codeStart === false && c === "`") {
                    nstr += "<span class='code code-single-frame'>"
                    codeStart = true;
                    tempArr.push(c);
                    if (escapeCode.escapeTest.test(c)) {
                        c = escapeCode.replacements[c];
                    }
                    continue;
                }
                //说明了进入了代码块
                if (tempArr.length > 0) {
                    //说明该结束了
                    if (c === "`") {
                        codeStart = false;
                        tempArr = [];
                        nstr += "</span>"
                        continue;
                    }
                    nstr += c;
                    continue;
                } else {
                    //转义
                    nstr += c;
                }
            }
            this.codeEle = nstr;
        }
    }

    this.initCode();

    this.getCodeEle = function () {
        return this.codeEle;
    }
}


function BlockParser(arr) {
    this.blockEle = "";
    this.blockEle += "<div class='block-frame' >"
    this.blockEle += "<ol>"
    //不需要第一行的空行
    //TODO 解决最后冗余的空行
    for (let i = 1; i < arr.length; i++) {
        let line = arr[i];
        //去掉缩进的四个空格，并进行转换
        line = line.substring(4).replace(/ /g, "&nbsp;");
        //转义特殊字符
        line = escapeCode(line, false);

        //高亮字符串
        line = line.replace(/&quot;(.*)&quot;/g, "<span style='color: darkgoldenrod'>\"$1\"</span>")
        line = line.replace(/&#39;(.*)&#39;/g, "<span style='color: darkgoldenrod'>\'$1\'</span>")
        //显示空行的li标签
        let lnELe = "";
        if (line.trim().length === 0) {
            lineEle = "<li class='block-line' style='visibility: hidden'>&nbsp</li>";
        } else {
            lineEle = "<li class='block-line'>" + line + "</li>";
        }
        this.blockEle += lineEle;
    }
    this.blockEle += "</ol>"
    this.blockEle += "</div>"
    this.getBlockEle = function () {
        return this.blockEle;
    }
}

function QuoteParser(arr) {
    this.quoteEle = "";
    this.quoteEle += "<div class='quote-frame'>"
    this.quoteEle += "<ol>"
    for (let i = 0; i < arr.length; i++) {
        let line = arr[i];
        //去掉缩进的四个空格，并进行转换
        // line = line.substring(4).replace(/ /g, "&nbsp;");
        //转义特殊字符
        // line = escapeCode(line, false);

        //高亮字符串
        // line = line.replace(/&quot;(.*)&quot;/g, "<span style='color: darkgoldenrod'>\"$1\"</span>")
        // line = line.replace(/&#39;(.*)&#39;/g, "<span style='color: darkgoldenrod'>\'$1\'</span>")

        let prefixRegex = /\s*[>]*/g;

        //把 > 保留，其它的先拿去解析
        let prefix = prefixRegex.exec(line)[0];
        let noQuoteLine = line.substring(prefix.length);

        prefix = prefix.replace(/>/g, "<span  class='quote-line-filler'></span>");
        noQuoteLine = parseLine(noQuoteLine);
        line = prefix + noQuoteLine;

        let lineEle = "<li class='quote-line'>" + line + "</li>"
        this.quoteEle += lineEle;
    }
    this.quoteEle += "</ol>"
    this.quoteEle += "</div>"
    this.getQuoteEle = function () {
        return this.quoteEle;
    }
}

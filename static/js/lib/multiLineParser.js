/**
 * 解析代码
 * @param arr
 * @constructor
 */
function CodeParser(arr) {
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
        let index = arrElement.indexOf("```");
        return index === -1 ? "default" : arrElement.substring(index + 3);
    }

    this.initMultiLineCode = function () {
        //pre标签可以保留空格
        this.codeEle = "<pre>";
        // this.codeEle += "<div class='code code-multi-frame'>";
        this.codeEle += "<div class='code code-multi-frame'>";
        this.codeEle += "<div class='md-code-bar'  >" +
            "<span onclick='toggleCode(this, this.parentElement.nextSibling)'  class='md-code-fold'>+</span>" +
            "</div>";
        this.codeEle += "<ol>";
        //如果是多行代码去掉第一行和最后一行，因为它们都包含了```
        for (let i = 1; i < this.codeArr.length - 1; i++) {
            let singleCodeLine = this.codeArr[i];

            //代码高亮
            singleCodeLine = highlightCode(singleCodeLine, this.type);

            let singleCodeLineEle = "<li class='code-multi-frame-line'>" + singleCodeLine + "</li>";
            this.codeEle += singleCodeLineEle;
        }
        this.codeEle += "</ol>";
        this.codeEle += "</div>";
        this.codeEle += "</pre>";
    };

    this.initMultiLineCode();

    this.getCodeEle = function () {
        return this.codeEle;
    }
}


/**
 * 解析  空格 + Tab 形成的block
 */
function BlockParser(arr) {
    this.blockEle = "";
    this.blockEle += "<div class='block-frame' >";
    this.blockEle += "<ol>";
    //不需要第一行的空行 所以let i = 1;
    //不处理最后一行, 所以arr.length-1
    for (let i = 1; i < arr.length - 1; i++) {
        let line = arr[i];
        //去掉缩进的四个空格，并进行转换
        line = line.substring(4).replace(/ /g, "&nbsp;");

        //转义特殊字符
        line = escapeCode(line, false);

        //高亮字符串
        line = line.replace(/&quot;(.*)&quot;/g, "<span style='color: darkgoldenrod'>\"$1\"</span>");
        line = line.replace(/&#39;(.*)&#39;/g, "<span style='color: darkgoldenrod'>\'$1\'</span>");
        // line = higlightCode(line, "default");


        let lineEle = "";
        //显示空行的li标签
        if (line.trim().length === 0) {
            lineEle = "<li class='block-line' style='visibility: hidden'>&nbsp</li>";
        } else {
            lineEle = "<li class='block-line'>" + line + "</li>";
        }
        this.blockEle += lineEle;
    }
    this.blockEle += "</ol>";
    this.blockEle += "</div>";
    // let lastLine = arr[arr.length - 1];
    //最后一行不处理
    // this.blockEle += parseLine(lastLine);

    this.getBlockEle = function () {
        return this.blockEle;
    }
}

/***
 * 解析引用框框 >
 */
function QuoteParser(arr) {
    this.quoteEle = "";
    this.quoteEle += "<div class='quote-frame'>";
    this.quoteEle += "<ol>";
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

        let lineEle = "<li class='quote-line'>" + line + "</li>" + "\n\n";
        this.quoteEle += lineEle;
    }
    this.quoteEle += "</ol>";
    this.quoteEle += "</div>";
    this.getQuoteEle = function () {
        return this.quoteEle;
    }
}

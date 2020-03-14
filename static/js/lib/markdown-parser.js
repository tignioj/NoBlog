/**
 * markdown解析
 * @param str
 */
function markdownParse(str) {
    // document.write("<h1>hello</h1>")
    //以换行符作为标准方式分割每一行存到数组中
    let arry = str.split("\n");
    let html = "";
    let singleLine = "";
    /**
     * 封装代码块
     * @param currentIndex
     * @param fullArray
     * @returns {*}
     */
    function wrapMultiCode(currentIndex, fullArray) {
        //如果判断到代码开始的标记，则传入判断结束的函数和解析所用函数给wrapMulti, wrapMulti负责收集, 第三个参数(parseFunction)用于解析
        if (/^\s*```/g.test(fullArray[currentIndex])) {
            return wrapMulti(currentIndex,
                function (currentIndex, currentLine) {
                    return (currentLine.match(/^\s*```/g));
                },
                function (arr) {
                    return parseMultiLineArr(arr, true);
                });
        }
        return currentIndex;
    }

    /**
     * 一个解析多行代码的接口
     * @param currentIndex 当前解析到的行数
     * @param isMultiEndDetectFunction 判断结束的方法，要求外界调用者传入
     * @param parseFunction 调用哪个解析的方法
     */
    function wrapMulti(currentIndex, isMultiEndDetectFunction, parseFunction) {
        //解析后的html
        let afterParsedIndex = currentIndex;

        //待解析的数组
        let preArr = [];

        //结尾的冗余行数量
        let emptyLineCountOfEnding = 0;

        /*把第一行存入，因为可能有一些必要的信息，比如```java中的java*/
        preArr.push(arry[currentIndex]);

        //进入多行解析的表直
        for (let i = currentIndex + 1; i < arry.length; i++) {

            //当前行
            let currentBlockLine = arry[i];

            //调用回调函数判断是否结束行
            let isEndLine = isMultiEndDetectFunction(i, currentBlockLine, arry);


            //判断是否为空行
            //如果是空行，说明是冗余行, 冗余行计数器自增；如果当前行是结束行且为空行，则不需要自增
            // if (currentBlockLine.trim().length === 0 && !isEndLine) {
            if (currentBlockLine.trim().length === 0) {
                emptyLineCountOfEnding++;
            } else {
                if (!isEndLine) {
                    emptyLineCountOfEnding = 0;
                }
            }

            //如果检测到结束了，就把数组送到相应的方法去解析
            if (isEndLine) {
                //去掉冗余的行
                for (let j = 0; j < emptyLineCountOfEnding; j++) {
                    preArr.pop();
                }
                preArr.push(currentBlockLine);
                html += parseFunction(preArr);
                afterParsedIndex = i + 1;
                break;
            }

            preArr.push(currentBlockLine);

        }
        return afterParsedIndex;
    }


    /**
     * 封装多行block
     * 连续两行空白
     * @param currentIndex
     * @param fullArray
     */
    function wrapMutliBlock(currentIndex, fullArray) {
        function isStartLineOfBlock() {
            //检测是否为空行
            let emptyLineReg = /^\s*$/g;
            /**
             * 开头必须有四个空格以上，后面必须跟着一个任意字符（处理空格之外)
             * @type {RegExp}
             */
            let hasSpaceFirstWithAnyContent = /^\s{4,}.[^ ]/g;
            return emptyLineReg.test(fullArray[currentIndex]) && hasSpaceFirstWithAnyContent.test(fullArray[currentIndex + 1]);
        }

        if (isStartLineOfBlock()) {
            let afterIndex = wrapMulti(
                currentIndex,
                function (currentIndex, currentLine, fullArray) {
                    /** 判断是否为Block的结束行
                     * 判断方法：
                     *  当前行首四个字符是空格以外的其它字符（也就是没有Tab缩进
                     *  但是无法做到一个正则可以判断首行前面四个字符是否有空格以外的字符，因此需要转换思路
                     *      1. 利用search方法搜索空格以外的字符[^ ]，搜到的任意一字符如果其位置<4,说明它是结束行
                     *      2. 需要注意的是，这个方法搜索到空字符是返-1
                     *
                     * @param currentLine 当前遍历行
                     * @param fullArray 整篇文章的数组
                     * @param currentIndex 当前遍历到的下标
                     */
                    // function isEndingLineOfBlock(line, fullArray, currentIndex) {
                    //      function isEndingLineOfBlock(line, fullArray, currentIndex) {
                    //如果判断到当前行已经是文章的最后一行，则认为结束
                    if (fullArray.length - 1 === currentIndex) {
                        return true;
                    }

                    let randomCharButNotEmptyReg = /[^ ]/g;
                    //寻找整行的第一个非空白字符，如果该非空白字符位置<4, 认为不足一个Tab, 则结束之, 除非当前行为空白行
                    let charIndex = currentLine.search(randomCharButNotEmptyReg);
                    if (charIndex < 4 && currentLine.trim().length !== 0) {
                        return true;
                    }
                    return false;
                },
                function (arr) {
                    return parseBlock(arr)
                }
            );

            /*不处理最后一行*/
            return afterIndex - 1;

        }
        return currentIndex;
    }

    function wrapMultiQuote(currentIndex, fullArray) {
        function isQuoteStart() {
            //空白行退出
            return /^\s{0,}([>]{1,})(.*)/g.test(fullArray[currentIndex]);
        }

        if (isQuoteStart()) {
            return wrapMulti(
                currentIndex,
                function (currentIndex, currentLine) {
                    return /^\s{0,}$/g.test(currentLine);
                },
                function (arr) {
                    return parseQuote(arr);
                }
            );
        }
        return currentIndex;
    }


    for (let i = 0; i < arry.length; i++) {

        /**
         * 自定义解析多行类型示例
         */
        if (/^abc-/g.test(arry[i])) {
            i = wrapMulti(
                i,

                /*传入一个判断结束的函数*/
                function (currentIndex, currentLine) {
                    let startRegex = /^abc-/g;
                    if (startRegex.test(currentLine)) {
                        return true;
                    }
                    return false;
                },
                /*传入一个解析器*/
                function (arr) {
                    let afterParsedHtml = "<button onclick='toggle(document.getElementById(\"custom\"))'>收缩</button>";
                    afterParsedHtml += "<div id='custom' style='background-color: grey'>";
                    for (let j = 0; j < arr.length; j++) {
                        let currentLine = arr[j];
                        currentLine = currentLine.trim().length === 0 ? "&nbsp" : currentLine;
                        afterParsedHtml += "<p>" + currentLine + "</p>";
                    }
                    afterParsedHtml += "</div>";
                    return afterParsedHtml;
                }
            );
        }

        //====================处理多行==========开始
        //代码
        i = wrapMultiCode(i, arry);

        //跳过检测到为空行+缩进 block的文本
        i = wrapMutliBlock(i, arry);

        //引用
        i = wrapMultiQuote(i, arry);
        //====================处理多行==========结束


        //处理单行
        singleLine = arry[i];
        singleLine = parseLine(singleLine);
        html += singleLine
    }

//解析完成，返回MarkedHtml对象
// markedHtml.indicator = indicator;
    return html;
}


//检测多行空行变成一行
parseLine.emptyLineCount = 0;

// 有序列表递增用
// parseLine.orderedListCount = 0;
// 有序列表递增符号
parseLine.orderedListCountByLevelMap = new Map();


//多行解析路由============================开始
/**
 * 解析Mardown代码块
 * 注意：防止xml被解析！需要转义 > <
 */
function parseMultiLineArr(arr) {
    let codeParse = new CodeParser(arr);
    return codeParse.getCodeEle();
}

function parseBlock(arr) {
    let blockParser = new BlockParser(arr);
    return blockParser.getBlockEle();
}

function parseQuote(arr) {

    let quoteParse = new QuoteParser(arr);
    return quoteParse.getQuoteEle();
}

//多行解析路由============================结束


//单行解析============================开始
/**
 * 分类单行代码
 * @param singleLine
 * @returns {string|*}
 */
function parseLine(singleLine) {
    if (singleLine === undefined || singleLine === null) {
        return "";
    }

    //标题#
    let headerReg = /^\s*#/g;
    if (headerReg.test(singleLine)) {
        let sharpLen = /^\s*(#*)/g.exec(singleLine)[1].length;
        if (sharpLen >= 7) {
            sharpLen = 6;
        }
        // let sstr = "<h" + sharpLen + " class='header header-" + sharpLen+ "'>" + singleLine.replace(/^\s*#*(.*)/g, "$1") + "</h" + sharpLen+ ">";
        singleLine = "<h" + sharpLen + " class='header header-" + sharpLen + "'>" + singleLine.trim().substring(sharpLen) + "</h" + sharpLen + ">";
    }
    //转义
    singleLine = singleLine.replace(/\\#/g, "#");

    // todo 清单
    // - [ ]
    // - [x]
    //清单需要自动换行
    let todoReg = /^\s{0,3}-\s\[\s\](.*)/g;
    if (todoReg.test(singleLine)) {
        singleLine = singleLine.replace(todoReg, "<input class='md-todo-uncheck' type='checkbox' disabled />$1<br/>");
    }

    let todoFinishedReg = /^\s{0,3}-\s\[x\](.*)/g;
    if (todoFinishedReg.test(singleLine)) {
        singleLine = singleLine.replace(todoFinishedReg, "<input class='md-todo-checked' type='checkbox' disabled  checked/>$1<br/>")
    }


    //无序列表
    //\s任意空格加-开头, Tab加-格式化无需列表
    // let unOrderedListReg = /^\s*\\?-(?!-)/g;
    /**
     * 任意空白开头，前面不能有转义
     * @type {RegExp}
     */
        // let unOrderedListReg = /^\s*([-*+])(?!\1)/g;
    let unOrderedListReg = /^\s*([-*+])\s(?!\1)/g;
    if (unOrderedListReg.test(singleLine)) {
        //判断前面是否有转义符号
        // let styles = ["\t&#8226;",  "\t&#9830;","\t&#9674;"]
        //字符大区
        //https://www.cnblogs.com/mengmengi/p/10137167.html
        //TODO 更换字符
        //https://www.w3school.com.cn/tiy/t.asp?f=csse_list-style

        // • &bull;
        // ° &deg;
        // ♦ &diams;    不推荐, 不同浏览器显示效果不一样
        // ◊ &loz;
        //
        let styles = ["&bull;", "&deg;"];
        // let styles = ["&bull;", "&deg;", "&diams;", "&loz;"];
        // let spaceLen = singleLine.substring(0, singleLine.indexOf("-")).length;
        //搜索第一个非空白字符
        let spaceLen = singleLine.search(/[^\s]/g);
        //获取样式
        let style = styles[Math.floor(spaceLen / 4) % styles.length];
        //填充物的宽度
        let retractEle = "<span class='unordered-list-indicator' style='padding-left: " + ((spaceLen / 4) * 20) + "px;'>" + style + "</span>";

        singleLine = "<p class='unordered-list'>" + retractEle + singleLine.substring(spaceLen + 1) + "</p>";
    }
    // singleLine = singleLine.replace(/(\\\-|\\\+|\\\*)/g, "$1");
    singleLine = singleLine.replace(/\\(\-)/g, "$1");

    //TODO 有序列表
    // let orderedListReg = /^\s*\?-(?!-)/g;
    let orderedListReg = /^\s*(\d+)\./g;
    if (orderedListReg.test(singleLine)) {
        // let styles = ["1", "i", "a"];
        // let styles = ["&bull;", "&deg;", "&diams;", "&loz;"];
        //搜索第一个 数字.
        let spaceLen = singleLine.search(/\d+\./g);

        //当前缩进级别
        let level = Math.floor(spaceLen / 4);

        //拿到当前缩进级别的序号
        let levelCount = parseLine.orderedListCountByLevelMap.get(level);
        //如果发现为未定义，则需要从1开始计算
        if (levelCount === undefined) {
            levelCount = 1;
            parseLine.orderedListCountByLevelMap.set(level, levelCount);
        }

        //获取字符的开头
        // let charCodeStarter = styles[level % styles.length];
        //获取递增后的字符
        // let style = charCodeStarter;

        //显示格式为：
        // 1.2
        //      1.2.1
        //      1.2.2
        // 需要满足的条件
        // 获取缩进级别
        // 获取前面所有缩进级别的号数
        function getPrefix() {
            let prefix = "";
            let m = parseLine.orderedListCountByLevelMap;
            for (let i = 0; i < level; i++) {
                let preCount = m.get(i);
                //因为上一级别的递增了，所以我们要减去1, 如果上一级没有存数，则设置为1
                preCount = preCount === undefined ? 1 : preCount - 1;
                prefix += preCount + ".";
            }
            return prefix;
        }

        let style = getPrefix() + levelCount;

        //填充物的宽度
        let retractEle = "<span class='ordered-list-indicator' style='padding-left: " + ((spaceLen / 4) * 20) + "px;'>" + style + "</span>";

        // singleLine = "<li class='ordered-list'>" + retractEle + singleLine.substring(spaceLen + 1) + "</li>";
        // singleLine = "<span class='ordered-list'>" + retractEle + singleLine.substring(spaceLen + 1) + "</span><br/>";
        singleLine = "<p class='ordered-list'>" + retractEle + singleLine.substring(spaceLen + 1) + "</p>";

        //当前level递增
        parseLine.orderedListCountByLevelMap.set(level, levelCount + 1);
        //将该级别以下的清空避免污染下一次同级别有序列表
        //比如
        // 1. 一级
        //      1.1 二级
        //      1.2 二级
        //      1.3 二级
        // 2. 一级
        //      4. 二级   这里被污染
        for (let i = level + 1; i < parseLine.orderedListCountByLevelMap.size; i++) {
            parseLine.orderedListCountByLevelMap.set(i, 1);
        }
    } else {
        //如果出现空白行，就清空
        if (singleLine.trim().length === 0) {
            parseLine.orderedListCountByLevelMap.clear();
        }
    }


    //图像
    // let teststr = "![abc](http://img.wszjl.com/images/background/jpg/22.jpg)";
    let reg = /!\[(.*)\]\((.*)\)/g;
    let obj = reg.exec(singleLine.trim());
    if (obj != null) {
        let altText = obj[1];
        let url = obj[2];
        let imgEle = "<span>" + "<img style=\"width: 100%\" alt=\"" + altText + "\" src=" + url.trim() + " />" + "</span>";

        singleLine = imgEle;
    }


    // br
    let brReg = /^\s{0,}---/g;
    if (brReg.test(singleLine)) {
        singleLine = "<hr/>" + singleLine.substring(singleLine.indexOf("---") + 3);
    }


    //链接[]()
    // let lnReg = /(.*)\[(.*)\]\((.*)\)(.*)/g;
    let lnReg = /\[([^\]]*?)\]\((.*?)\)/g;
    if (lnReg.test(singleLine)) {
        singleLine = singleLine.replace(lnReg, "<a href=\'$2\' >$1</a>");
    }


    //高亮==
    let hlReg = /(^|[^\\])==([^=]*?)==/g;
    if (hlReg.test(singleLine)) {
        singleLine = singleLine.replace(hlReg, "$1<span style='background: yellow'>$2</span>");
        // singleLine = singleLine.replace(/\\=/g, "=");
    }
    singleLine = singleLine.replace(/\\=/g, "=");

    //斜体*
    //正则的断言
    //IE不支持负向先行断言
    // try {
    //     let emReg = /(?<!\*)\*([^*]{1,})\*(?!\*)/g;
    //     singleLine = singleLine.replace(emReg, "<em>$1</em>");
    // } catch (e) {
    //     console.error("you browser unsupport !")
    // }

    //兼容方法，斜体和粗体
    if (/\*([^*]{1,})\*/g.test(singleLine)) {
        //粗体
        singleLine = singleLine.replace(/(^|[^\\])\*\*([^* ])(.*?)\*\*/g, "$1<span class='md-strong'>$2$3</span>");

        //斜体
        let emReg = /(^|[^\\])\*([^ ])([^*]*?)(\*)/g;
        // let emReg = /(^|[^\\])\*([^ ])(.*?)\*([^*]|$)/g;
        singleLine = singleLine.replace(emReg, "$1<span class='md-italic'>$2$3</span>");

        //把反义符号去掉
        // singleLine = singleLine.replace(/(\\\*)/g, "*");
        // singleLine = singleLine.replace(/(\\\*)/g, "*");
    }
    singleLine = singleLine.replace(/(\\\*)/g, "*");


    let delReg = /(^|[^\\])~~(.*?)~~/g;
    if (delReg.test(singleLine)) {
        singleLine = singleLine.replace(delReg, "$1<span class='md-del'>$2</span>");

        /*把反义符号去掉*/
        // singleLine = singleLine.replace(/\\~/g, "~");
    }
    singleLine = singleLine.replace(/\\~/g, "~");

    //下划线++
    let undReg = /(^|[^\\])\+\+(.*?)\+\+/g;
    if (undReg.test(singleLine)) {
        singleLine = singleLine.replace(undReg, "$1<span class='md-underline'>$2</span>");

        /*把反义符号去掉*/
        // singleLine = singleLine.replace(/\\\+/g, "+");
    }
    singleLine = singleLine.replace(/\\\+/g, "+");


    // //单行代码解析``
    // let regSingleCode = /[^\\]`[^`]/g;
    // if (singleLine.trim().match(regSingleCode) != null) {
    //     singleLine = parseMultiLineArr([singleLine], false);
    // }
    // let regSingleCode = /(^|[^\\])`([^ ])(.*?)([^ ])`/g;

    /**
     * 要求
     * 1. 不能以转义符号开头
     * 2. 反引号里面不能以空白开头，不能以空白结尾，中间不得出现反引号
     *
     * 写法解释
     * (^|[^\\])(`[^\s`]+`)|(`([^ ])([^`]*?)([^ ])`)
     * (^|[^\\]) : 开头可以是非反引号的任意字符
     *
     * 组合1: 解决中间出现空白的情况
     * (^|[^\\])(`[^\s`]+`) : 任意非反引号字符开始, 以`开头，中间不得出现任何空白字符或者反引号字符, 以`结束
     * 组合2: 解决两边不得出现空白的情况
     * (^|[^\\])(`([^ ])([^`]*?)([^ ])` :任意非反引号字符开始, 紧跟后面不能出现空白，占位1个，中间不能出现反引号之外的符号，后面一个反引号前面第一个字符不能是空白
     *
     * 组合1 | 组合2  = 要求
     * @type {RegExp}
     */

    let regSingleCode = /(^|[^\\])(`[^\s]`)|(^|[^\\])(`([^\s])([^`]*?)([^\s])`)/g;
    if (singleLine.trim().match(regSingleCode) != null) {
        // singleLine = parseMultiLineArr([singleLine], false);
        // singleLine = singleLine.replace(regSingleCode, "$1<span class='code code-single-frame'>$2$3$4</span>")
        singleLine = singleLine.replace(regSingleCode, function (ch) {
            //第一个符号被捕获了，需要切割出来, 比如 "test`echo hello`"，其中会拿到 "t`echo hello`, 前面的t就是我们需要单独提取的内容。
            let firstChar = ch.charAt(0);
            ch = ch.replace(/``?(.*)`/g, "$1");

            //如果是`开头的，就不会获取到第一个字符
            if (firstChar !== "`") {
                ch = ch.substring(1);
            }

            ch = escapeCode(ch, false);
            ch = highlightCode(ch, "singleline");
            // return "<span class='code code-single-frame'>" + escapeCode(ch, false) + "</span>";
            return firstChar + "<span class='code code-single-frame'>" + ch + "</span>";
        });
        // singleLine = singleLine.replace(/\\`/g, "`");
    }


    singleLine = singleLine.replace(/\\`/g, "`");


    //转义\\成为\
    singleLine = singleLine.replace(/\\\\/g, "\\");

    // 检测多行空行变成一行
    if (singleLine.trim().length === 0 && parseLine.emptyLineCount <= 1) {
        parseLine.emptyLineCount++;
        return "<br/>"
    }

    /**
     * 没有被标签封装，说明是纯文本
     * @type {RegExp}
     */
    let plainTextReg = /^\s*</g;
    let temLine = singleLine.trim();
    if (temLine.length > 0 && !plainTextReg.test(temLine)) {
        parseLine.emptyLineCount = 0;
        // singleLine = "<p class='plain-text'>" + singleLine + "</p>";
        singleLine = "<span class='plain-text'>" + singleLine + "</span>";
    }
    return singleLine;
}

//单行解析============================结束


function toggle(element) {
    let display = element.style.display;
    element.style.display = display === ("" || "none") ? "block" : "none";
}

/*代码折叠*/
function toggleCode(button, element) {
    button.style.transform = "-webkit-transform 500ms ease-in-out";
    if (button.innerText === "+") {
        button.innerText = "-";
        button.style.transform = "rotate(180deg)";
    } else {
        button.innerText = "+";
        button.style.transform = "rotate(0deg)";
    }
    let display = element.style.display;
    element.style.display = display === ("" || "none") ? "block" : "none";
}



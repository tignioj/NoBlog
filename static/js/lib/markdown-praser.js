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
     * 检测是否为多行代码，如果是则封装到html,并返回处理后的下标
     * @param currentIndex
     * @param fullArray
     * @returns {*}
     */
    function wrapMultiCode(currentIndex, fullArray) {
        let multiLineArr = [];
        let multiLineBegin = false;
        let i = currentIndex;

        for (; i < fullArray.length; i++) {
            let line = fullArray[i];
            if (multiLineBegin === false && line.match(/^```/g)) {
                multiLineBegin = true;
                multiLineArr.push(line);
                continue;
            }

            //如果mtarr里面有东西,说明开启了多行代码解析，此时判断是否结束多行
            if (multiLineArr.length > 0) {
                //如果在开启了代码解析的情况下还检测到了```,则应该结束了
                if (line.match(/```/g)) {
                    multiLineBegin = false;
                    multiLineArr.push(line);
                    //高亮代码
                    html += parseMultiLineArr(multiLineArr, true);
                    multiLineArr = [];
                    continue;
                } else {
                    //否则需要继续添加
                    multiLineArr.push(line);
                    continue;
                }
            }

            break;
        }
        return i;
    }

    /**
     * 封装多行block
     * 连续两行空白
     * @param currentIndex
     * @param fullArray
     */
    function wrapMutliBlock(currentIndex, fullArray) {
        let multiBlockArr = [];
        let multiBlockBegin = false;
        let i = currentIndex;

        /**
         * 判断是否为Block的结束行
         * 判断方法：
         *  当前行首四个字符是空格以外的其它字符（也就是没有Tab缩进
         *  但是无法做到一个正则可以判断首行前面四个字符是否有空格以外的字符，因此需要转换思路
         *      1. 利用search方法搜索空格以外的字符[^ ]，搜到的任意一字符如果其位置<4,说明它是结束行
         *      2. 需要注意的是，这个方法搜索到空字符是返-1
         *
         * @param line 当前遍历行
         * @param fullArray 整篇文章的数组
         * @param currentIndex 当前遍历到的下标
         */
        function isEndingLineOfBlock(line, fullArray, currentIndex) {
            //如果判断到当前行已经是文章的最后一行，则认为结束
            if (fullArray.length - 1 === currentIndex) {
                return true;
            }

            let randomCharButNotEmptyReg = /[^ ]/g;
            //寻找整行的第一个非空白字符，如果该非空白字符位置<4, 认为不足一个Tab, 则结束之, 除非当前行为空白行
            let charIndex = line.search(randomCharButNotEmptyReg);
            if (charIndex < 4 && line.trim().length !== 0) {
                // if (charIndex < 4 && line.trim().length !== 0) {
                return true;
            }
            return false;
        }

        /**
         * 判断是否为Block的开始行，需要检测多行
         * 检测方法：
         *  当前行为空行
         *  下一行不是空行，而且必须有一个Tab（即四个空格在开头）
         * @param fullArray
         * @param i
         * @returns {boolean|boolean}
         */
        function isStartLineOfBlock(fullArray, i) {

            //检测是否为空行
            let emptyLineReg = /^\s*$/g;
            /**
             * 开头必须有四个空格以上，后面必须跟着一个任意字符（处理空格之外)
             * @type {RegExp}
             */
            let hasSpaceFirstWithAnyContent = /^\s{4,}.[^ ]/g;
            return emptyLineReg.test(fullArray[i]) && hasSpaceFirstWithAnyContent.test(fullArray[i + 1])
        }

        //处理结束冗余空行的计数器
        let emptyLineCountOfEnding = 0;


        for (; i < fullArray.length; i++) {
            let line = fullArray[i];

            // 如果还么有开始进入板块， 则从当前行开始判断是否为开始行
            if (!multiBlockBegin && isStartLineOfBlock(fullArray, i)) {
                multiBlockBegin = true;
                multiBlockArr.push(line);
                continue;
            }

            //如果mtarr里面有东西,说明开启了多行代码解析
            if (multiBlockArr.length > 0) {
                //如果开头前4个位置有字符（而不是空格), 而且不是空行 就结束
                /**
                 * 判断结束板块的方法：
                 * 1. 判断当前行最前面四个字符是否有空格以外的字符，
                 * 如果有，而且不是空行，则说明结束板块了
                 * 比如
                 * 第1行        |     a
                 * 第2行        |  ab
                 * 第3行        |(这里没有空格,是空行)
                 * 这里第1行前面四个字符是空白，但是不是空行，因为后面有a，所以不结束
                 * 第2行前面四个字符中，第三个字符是a，所以应该结束
                 * 第3行完全空行，前面也没有字符,也没有空格，所以不该结束
                 *
                 * 2. 判断文章是否到达了底部
                 */
                if (isEndingLineOfBlock(line, fullArray, i)) {
                    multiBlockBegin = false;
                    //清除冗余行
                    for (let j = 0; j < emptyLineCountOfEnding; j++) {
                        multiBlockArr.pop();
                    }
                    html += parseBlock(multiBlockArr);
                    multiBlockArr = [];
                    break;
                }


                /**
                 * 除去结尾冗余空行的一些准备
                 * 当检测到空行，就开始计数
                 * 如果不是空行，判断是不是结束了
                 * 如果结束了，就保存技术
                 * 如果还么结束，则置为0
                 * 最后需要在block结束方法处调用pop()方法清除冗余行
                 * @type {number}
                 */
                if (line.trim().length === 0) {
                    emptyLineCountOfEnding++;
                } else {
                    //如果不是结束行，则置空
                    if (!isEndingLineOfBlock(line, fullArray, i)) {
                        emptyLineCountOfEnding = 0;
                    }
                }

                //逐行添加到待处理的block数组中
                multiBlockArr.push(line);
                continue;
            }

            // 这种情况就是当前未解析到block,直接结束循环
            break;
        }


        return i;
    }

    function wrapMultiQuote(currentIndex, fullArray) {
        let multiQuoteArr = [];
        let multiQuoteBegin = false;
        let i = currentIndex;

        let blockReg = /^\s{0,}([>]{1,})(.*)/g;

        for (; i < fullArray.length; i++) {

            let line = fullArray[i];
            // if (multiBlockBegin === false && line.match(/^```/g)) {
            if (!multiQuoteBegin && blockReg.test(line)) {
                multiQuoteBegin = true;
                multiQuoteArr.push(line);
                continue;
            }

            //如果mtarr里面有东西,说明开启了多行代码解析，此时判断是否结束多行
            if (multiQuoteArr.length > 0) {
                //空白行退出
                if (/^\s{0,}$/g.test(line)) {
                    multiQuoteBegin = false;
                    multiQuoteArr.push(line);
                    let quoteEle = parseQuote(multiQuoteArr);
                    html += quoteEle;
                    multiQuoteArr = [];
                    continue;
                } else {
                    //否则需要继续添加
                    multiQuoteArr.push(line);
                    continue;
                }
            }
            break;
        }
        return i;
    }

    for (let i = 0; i < arry.length; i++) {
        //当开启多行时，不因该再进入这里，因为结束也是```
        //     开头，防止结束的时候再次进入这里

        //跳过检测到为多行代码格式的文本
        i = wrapMultiCode(i, arry);

        //跳过检测到为空行+缩进 block的文本
        i = wrapMutliBlock(i, arry);

        i = wrapMultiQuote(i, arry);


        singleLine = arry[i];


        //非代码需要进行转义 < > &等
        singleLine = parseLine(singleLine);


        html += singleLine
    }


    //解析完成，返回MarkedHtml对象
    // markedHtml.indicator = indicator;
    return new MarkedHtml(html);
}


//检测多行空行变成一行
parseLine.emptyLineCount = 0;

// 有序列表递增用
// parseLine.orderedListCount = 0;
// 有序列表递增符号
parseLine.orderedListCountByLevelMap = new Map();


/**
 * 分类解析
 * @param singleLine
 * @returns {string|*}
 */
function parseLine(singleLine) {
    if (singleLine === undefined || singleLine === null) {
        return "";
    }
    // let index = singleLine.indexOf("#");
    // if (index !== -1) {
    //     singleLine = parseHeader(singleLine);
    // }
    let headerReg = /^\s*#/g;
    if (headerReg.test(singleLine)) {
        singleLine = parseHeader(singleLine);
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
    let unOrderedListReg = /^\s*([-*+])(?!\1)/g;
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

        singleLine = "<li class='unordered-list'>" + retractEle + singleLine.substring(spaceLen + 1) + "</li>";
    }
    singleLine = singleLine.replace(/(\\-|\\\+|\\\*)/g, "$1");

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
        let retractEle = "<span class='unordered-list-indicator' style='padding-left: " + ((spaceLen / 4) * 20) + "px;'>" + style + "</span>";

        singleLine = "<li class='unordered-list'>" + retractEle + singleLine.substring(spaceLen + 1) + "</li>";

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


    let delReg = /([^\\])~~(.*?)~~/g;
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
        // let regSingleCode = /(^|[^\\])(`[^\s]`)|(`([^ ])([^`]*?)([^ ])`)/g;
    let regSingleCode = /(^|[^\\])(`[^\s]`)|(^|[^\\])(`([^ ])([^`]*?)([^ ])`)/g;
    if (singleLine.trim().match(regSingleCode) != null) {
        // singleLine = parseMultiLineArr([singleLine], false);
        // singleLine = singleLine.replace(regSingleCode, "$1<span class='code code-single-frame'>$2$3$4</span>")
        singleLine = singleLine.replace(regSingleCode, function (ch) {
            //第一个符号被捕获了，需要切割出来, 比如 "test`echo hello`"，其中会拿到 "t`echo hello`, 前面的t就是我们需要单独提取的内容。
            ch = ch.replace(/`(.*)`/g, "$1");
            let firstChar = ch.substring(0, 1);
            ch = ch.substring(1);
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

/**
 * markdown解析
 * @param str
 */
function markdownParse(str) {
    // document.write("<h1>hello</h1>")
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
         * 判断是否为结束行
         * 判断方法：
         *  当前行首四个字符是空格以外的其它字符（也就是没有Tab缩进
         *  但是无法做到一个正则可以判断首行前面四个字符是否有空格以外的字符，因此需要转换思路
         *      1. 利用search方法搜索空格以外的字符[^ ]，搜到的任意一字符如果其位置<4,说明它是结束行
         *      2. 需要注意的是，这个方法搜索到空字符是返-1
         *
         * @param line
         */
        function isEndingLineOfBlock(line, fullArray, currentIndex) {
            if (fullArray.length-1 === currentIndex) {
                return true;
            }

            let randomCharButNotEmptyReg = /[^ ]/g;
            let charIndex = line.search(randomCharButNotEmptyReg);
            if (charIndex < 4 && line.trim().length !== 0) {
                // if (charIndex < 4 && line.trim().length !== 0) {
                return true;
            }
            return false;
        }

        /**
         * 判断是否为结束行，需要检测多行
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
                    if (!isEndingLineOfBlock(line,fullArray, i)) {
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


/**
 * 分类解析
 * @param singleLine
 * @returns {string|*}
 */
function parseLine(singleLine) {
    if (singleLine === undefined || singleLine === null) {
        return "";
    }
    let index = singleLine.indexOf("#");
    if (index !== -1) {
        singleLine = parseHeader(singleLine);
    }


    //\s任意空格加-开头,
    let liReg = /^\s*\\?-(?!-)/g;
    if (liReg.test(singleLine)) {
        //判断前面是否有转义符号
        let liWithEscapeReg = /^\s*(\\-)(?!-)/g;
        if (liWithEscapeReg.test(singleLine)) {
            singleLine  = singleLine.replace(liWithEscapeReg, "-");
        } else {
            // let styles = ["\t&#8226;",  "\t&#9830;","\t&#9674;"]
            //字符大区
            //https://www.cnblogs.com/mengmengi/p/10137167.html
            //TODO 更换字符
            let styles = ["&bull;", "&deg;", "&diams;", "&loz;"];
            let spaceLen = singleLine.substring(0, singleLine.indexOf("-")).length;
            let style = styles[(spaceLen / 4) % 4];
            let retractEle = "<span class='plain-list-indicator' style='padding-left: " + ((spaceLen / 4) * 20) + "px;'>" + style + "</span>";
            singleLine = "<li class='plain-list'>" + retractEle + singleLine.substring(singleLine.indexOf("-") + 1) + "</li>";
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
    let lnReg = /(.*)\[(.*)\]\((.*)\)(.*)/g;
    singleLine = singleLine.replace(lnReg, "$1<a href=\'$3\' >$2</a>$4");

    //高亮==
    let hlReg = /(^|[^\\])==([^=]*?)==/g;
    if (hlReg.test(singleLine)) {
        singleLine = singleLine.replace(hlReg, "$1<span style='background: yellow'>$2</span>");
        singleLine = singleLine.replace(/\\=/g, "=");
    }

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
        singleLine = singleLine.replace(/(\\\*)/g, "*");
    }


    let delReg = /([^\\])~~(.*)~~/g;
    if (delReg.test(singleLine)) {
        singleLine = singleLine.replace(delReg, "$1<span class='md-del'>$2</span>");

        /*把反义符号去掉*/
        singleLine = singleLine.replace(/\\~/g, "~");
    }

    //下划线++
    let undReg = /(^|[^\\])\+\+(.*)\+\+/g;
    if (undReg.test(singleLine)) {
        singleLine = singleLine.replace(undReg, "$1<span class='md-underline'>$2</span>");

        /*把反义符号去掉*/
        singleLine = singleLine.replace(/\\\+/g, "+");
    }


    // //单行代码解析``
    // let regSingleCode = /[^\\]`[^`]/g;
    // if (singleLine.trim().match(regSingleCode) != null) {
    //     singleLine = parseMultiLineArr([singleLine], false);
    // }
    let regSingleCode = /(^|[^\\])`([^ ])(.*?)([^ ])`/g;
    if (singleLine.trim().match(regSingleCode) != null) {
        // singleLine = parseMultiLineArr([singleLine], false);
        // singleLine = singleLine.replace(regSingleCode, "$1<span class='code code-single-frame'>$2$3$4</span>")
        singleLine = singleLine.replace(regSingleCode, function (ch) {
            ch = ch.replace(/`(.*)`/g, "$1");
            let firstChar = ch.substring(0, 1);
            ch = ch.substring(1);
            ch = escapeCode(ch, false);
            ch = highlightCode(ch, "singleline");
            // return "<span class='code code-single-frame'>" + escapeCode(ch, false) + "</span>";
            return firstChar + "<span class='code code-single-frame'>" + ch + "</span>";
        });
        singleLine = singleLine.replace(/\\`/g, "`");
    }



    /**
     * 没有被标签封装，说明是纯文本
     * @type {RegExp}
     */
    let plainTextReg = /^\s*</g;
    let temLine = singleLine.trim();
    if (temLine.length > 0 && !plainTextReg.test(temLine)) {
        singleLine = "<p class='plain-text'>" + singleLine + "</p>";
    }

    return singleLine;
}


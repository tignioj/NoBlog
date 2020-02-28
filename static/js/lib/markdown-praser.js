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

        let emptyLineReg = /^\s*$/g;
        // let hasSpaceLineInHeaderReg = /^\s{4,}.[^ ]/g;
        /**
         * 开头必须有四个空格以上，后面必须跟着一个任意字符（处理空格之外)
         * @type {RegExp}
         */
        let hasSpaceFirstWithAnyContent = /^\s{4,}.[^ ]/g;

        for (; i < fullArray.length; i++) {

            let line = fullArray[i];
            // if (multiBlockBegin === false && line.match(/^```/g)) {
            if (!multiBlockBegin && emptyLineReg.test(fullArray[i]) && hasSpaceFirstWithAnyContent.test(fullArray[i + 1])) {
                multiBlockBegin = true;
                multiBlockArr.push(line);
                continue;
            }

            //如果mtarr里面有东西,说明开启了多行代码解析，此时判断是否结束多行
            if (multiBlockArr.length > 0) {
                //如果开头前4个位置有字符（而不是空格), 而且不是空行 就结束
                let randomCharButNotEmptyReg = /[^ ]/g;
                let charIndex = line.search(randomCharButNotEmptyReg);
                if (charIndex<4 && line.trim().length !== 0) {
                    multiBlockBegin = false;
                    html += parseBlock(multiBlockArr);
                    multiBlockArr = [];
                    break;
                } else {
                    //否则需要继续添加
                    multiBlockArr.push(line);
                    continue;
                }
            }

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
        //TODO xml出现问题,因为它被HTML解析了...

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
    let markedHtml = new MarkedHtml(html);
    // markedHtml.indicator = indicator;
    return markedHtml;
}


/**
 * 分类解析
 * @param singleLine
 * @returns {string|*}
 */
function parseLine(singleLine) {
    let index = singleLine.indexOf("#");
    if (index !== -1) {
        singleLine = parseHeader(singleLine);
    }

    //\s任意空格加-开头,
    // (?!-) 第一个-后面不能有-
    let liReg = /^\s{0,}-(?!-)/g;
    if (liReg.test(singleLine)) {
        // let styles = ["\t&#8226;",  "\t&#9830;","\t&#9674;"]
        //字符大区
        //https://www.cnblogs.com/mengmengi/p/10137167.html
        //TODO 更换字符
        let styles = ["&bull;", "&deg;" ,"&diams;",  "&loz;"]
        let spaceLen = singleLine.substring(0, singleLine.indexOf("-")).length;
        let style = styles[(spaceLen / 4) % 4];
        let retractEle = "<span class='plain-list-indicator' style='padding-left: " + ((spaceLen / 4)*20) + "px;'>" + style + "</span>"
        singleLine = "<li class='plain-list'>" + retractEle + singleLine.substring(singleLine.indexOf("-") + 1) + "</li>";
    }

    //图像
    // let teststr = "![abc](http://img.wszjl.com/images/background/jpg/22.jpg)";
    let reg = /!\[(.*)\]\((.*)\)/g
    let obj = reg.exec(singleLine.trim());
    if (obj != null) {
        let altText = obj[1];
        let url = obj[2];
        let imgEle = "<span>" + "<img style=\"width: 100%\" alt=\"" + altText + "\"src=" + url.trim() + " />" + "</span>"
        singleLine = imgEle;
    }


    // br
    let brReg = /^\s{0,}---/g;
    if (brReg.test(singleLine)) {
        singleLine = "<hr/>" + singleLine.substring(singleLine.indexOf("---") + 3);
    }

    // 引用
    // let quoReg = /^\s{0,}([>]{1,})(.*)/g;
    // let qObj = quoReg.exec(str);
    // if (qObj) {
    //     let quoteLen = qObj[1].length;
    //     let quoteStr = qObj[2];
    //     for (let i = 0; i < quoteLen; i++) {
    //         quoteStr = "<span style='background-color: darkgray; padding-left: 1em;'></span>" + quoteStr
    //     }
    //     quoteStr = "<p>" + quoteStr + "</p>";
    //     str =  quoteStr;
    //     //计算>的数量
    //     // str.indexOf(quotedStr);
    // }


    //链接[]()
    let lnReg = /(.*)\[(.*)\]\((.*)\)(.*)/g;
    singleLine = singleLine.replace(lnReg, "$1<a href=\'$3\' >$2</a>$4")

    //高亮==
    let hlReg = /==(.*)==/g;
    singleLine = singleLine.replace(hlReg, "<span style='background: yellow'>$1</span>")

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
        singleLine = singleLine.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

        //斜体
        let emReg = /\*([^*]{1,})\*/g;
        singleLine = singleLine.replace(emReg, "<em>$1</em>");

        //因为粗体会把斜体覆盖，所以先执行粗体
    }


    let delReg = /~~(.*)~~/g;
    singleLine = singleLine.replace(delReg, "<del>$1</del>");

    //下划线++
    let undReg = /\+\+(.*)\+\+/g;
    singleLine = singleLine.replace(undReg, "<span style='text-decoration: underline'>$1</span>");


    // //单行代码解析``
    let regSingleCode = /`[^`]/g;
    if (singleLine.trim().match(regSingleCode) != null) {
        singleLine = parseMultiLineArr([singleLine], false);
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


/**
 * 高亮代码
 * 原理：封装css
 * @param rawCode 未高亮的代码
 * @param language 语言
 */

let isStartComment = false;

function higlightCode(rawCode, language) {

    //代码缩进把空格替换成 &nbsp;
    //TODO 显示空格

    // rawCode = rawCode.replace(/ /g, "&nbsp;")
    // singleCodeLine = singleCodeLine.replace(/ /g, "&nbsp;&nbsp;")

    if (language == null || language === "") {
        language = "default";
    }
    language = language.toLowerCase();

//TODO 编写高亮css，添加到code组件
    switch (language) {
        case "java":
            return parseJava(rawCode);
        // return parseDefault(rawCode);
        case "html":
            return parseXML(rawCode);
        case "default":
            return parseDefault(rawCode);
        default:
            return parseDefault(rawCode);
    }

    function parseXML(rawCode) {
        let nCode = escapeCode(rawCode.trim(), false);

        // 获取开头的缩进内容
        let indentSize = rawCode.search(/[^\s]/g);
        let indentEle = "";
        if (indentSize !== -1) {
            indentEle = "<span class='code-indent' style='padding-left: " + (Math.floor((indentSize / 4) * 20) + "px'></span>");
        }

        //TODO 单行嵌套
        /**
         * 1. 检测是否单行嵌套
         *如果是， 分割标签, 从第一个开始遍历
         * 遍历下一个标签，检测当前标签是否为闭合标签
         * 如果否，则继续存进数组
         * 如果是，从数组中按顺序取出
         */
        /**
         * 1. 检测当前是否为嵌套标签
         * 检测方法：
         *  1) 分割标签
         *  match方法得到一个数组
         */
        // "<a style='color: red'> <b> haha </b></a>".match(/<[^>]+>[^<]*/g)
        // let tagSeparatorReg = /<[^>]+>[^<]*/g;
        // let tagSeparatorReg = /(%lt;)[^>]+&gt;[^<]*/g;

        /**
         * 解释：
         * &lt;             &lt开头
         * ((?!&gt;).)+&gt;      任意字符串但是不能出现&gt;直到&gt;为止
         * \s+                  有么有空格都行
         * ((?!&lt;).)*         任意字符串但是不能出现&lt;
         *
         * 用途：切割标签
         *  比如  <a></a> 被切割为 ["<a>", "</a>"]
         *
         * 局限性1：只能以 "<" 开头， 比如不能解析
         *      text <a> </a>
         *      这里的text会被忽视！
         *
         * 解决局限性1：获取第一个 &lt;的位置, 保留前面的纯文本，后面填充
         *      text    |   <a> </a>
         *
         * 局限性3： 当出现以 < 开头的纯文本，就无法高亮 比如
         *      < 3 <a></a>
         * 解决局限性3：  获取第一个标签的位置，同局限性1一样，分割成两部分，后面填充
         *      < 3     |   <a> </a>
         *
         *
         *
         * 局限性2：当标签中出现 1 > 2时， 大于号会被解析为下一个标签的开始, 从而无法正确解析
         *
         * 解决局限性2：
         *  提取标签文本，单独解析
         *
         *
         *  局限性3：当标签的内容出现  < 时， 小于号会被解析到下一行
         */
        let tagSeparatorReg = /&lt;((?!&gt;).)+&gt;\s*((?!&lt;).)*/g;

        // 解决局限性1：获取第一个 标签 的位置, 保留前面的纯文本，后面填充
        // let ltIndex = nCode.indexOf("&lt;");
        // let ltIndex = nCode.indexOf("&lt;");
        let ltIndex = nCode.search(/&lt;\w+.*&gt;/g);
        let plainTextInFirst = ltIndex === -1 ? "" : nCode.substring(0, ltIndex);
        let tagAfterText = ltIndex === -1 ? nCode : nCode.substring(ltIndex);


        let tagArr = tagAfterText.match(tagSeparatorReg);
        // "<a class='c1'><b> text > >  </b></a>".match(/<[^>]+>\s*[^<]*/g)
        // "<a class='c1'><b> text > >  </b></a>".match(/<[^>]+>\s*((?!<).)*/g)
        //"<a class='c1'><b> 1 < 2 == true   </b></a>".match(/<((?!>).)+>\s*((?!<).)*/g)
        let nEle = "";
        //如果分割到了字符串，说明不是纯文本
        if (tagArr !== null) {
            for (let i = 0; i < tagArr.length; i++) {
                let oneSideTagWithText = tagArr[i];
                //解决局限性 2: 获取标签后面的内容，单独解析
                /**
                 *
                 * 比如<a> 1 > 2</a>中，被切割为
                 * <a> 1 > 2
                 * </a>
                 * 解决：
                 *  找到第一个 &gt;, 切割
                 * @type {number}
                 */

                let textIndex = oneSideTagWithText.indexOf("&gt;");
                let plainText = oneSideTagWithText.substring(textIndex + 4);
                let oneSideTag = oneSideTagWithText.substring(0, textIndex) + "&gt;";

                //解决局限性3：
                /**
                 * 比如<a> 1 < 3 </a> 被切割为
                 * <a>  1
                 * < 3 </a>
                 * 解决：找到第一个标签的位置，如果为0，表示由局限性2处理
                 * 如果不是0，则分割成两部分处理
                 * @type {number | *}
                 */
                let textIndexAfter = oneSideTagWithText.search(/&lt;\/\w+.*&gt;/g);
                if (textIndexAfter !== 0 && textIndexAfter !== -1) {
                    oneSideTag = oneSideTagWithText.substring(textIndexAfter);
                    plainText = oneSideTagWithText.substring(0, textIndexAfter);
                    nEle += parsePlainTextOfXML(plainText) + parseOneTagOfXML(oneSideTag);
                } else {
                    nEle += parseOneTagOfXML(oneSideTag) + parsePlainTextOfXML(plainText);
                }

            }

            return indentEle + parsePlainTextOfXML(plainTextInFirst) + nEle + "<br/>";
            // return indentEle  + nEle + "<br/>";
        } else {
            return indentEle + parsePlainTextOfXML(nCode);
        }
        //
        //
        // //高亮XML声明
        // let docTypeReg = /(&lt;)(![\w]+)(\s+)(.*)(&gt;)/g;
        // nCode = nCode.replace(docTypeReg, "$1<span style='color: red'>$2</span>$3<span style='color: orange'>$4</span>$5");
        //
        //
        // //                1<  2/ 3标签名称 4属性 5> 6内容    7</ 8标签名称
        // // let tagNameReg = /(<)(\/?)([\w]+)(.*)(>)([^>]+)(\1\/)(\3)/g;
        // //单行闭合标签
        // // let singleLineTag = /(&lt;)(\/?)([\w]+)(.*)(&gt;)([^&gt;]*)(\1\/)(\3)/g;
        // // let singleLineTag = /(&lt;)(\/?)([\w]+)(.*)(&gt;)([^&;]*)(\1\/)(\3)/g;
        // let singleLineTag = /(&lt;)(\/?)([\w]+)(.*)(&gt;)(.*)(\1\/)(\3)/g;
        // //"<a > b</a>".replace(/(<)(\/?)([\w]+)(.*)(>)([^>]+)(\1\/)(\3)/g, "#1$1# ^2$2^ (3$3) @4$4@ (5$5) @6$6@ (7$7)  #8$8#")
        // // nCode = nCode.replace(tagNameReg, "$1$2<span style='color: red'>$3</span>$4$5$6$7$8$9$10$11");
        // nCode = nCode.replace(singleLineTag,
        //     /*1.2 <或者</*/
        //     "$1$2" +
        //     /*3 标签名称*/
        //     "<span style='color: red'>$3</span>" +
        //     /*4. 属性*/
        //     "<span style='color: orange'>$4</span>" +
        //     /*5. >*/
        //     "$5" +
        //     /*6. 内容*/
        //     "<span style='color: grey'>$6</span>" +
        //     /*7. </*/
        //     "$7" +
        //     /*8. 标签名称*/
        //     "<span style='color: red'>$8</span>"
        // );
        //
        //
        // //未闭合标签
        // //                  1<  2/ 3标签名称 4属性 5> 6内容
        // let noCloseTag = /(&lt;)(\/?)([\w]+)(.*)(&gt;)/g;
        // nCode = nCode.replace(noCloseTag,
        //     /*1.2 <或者</*/
        //     "$1$2" +
        //     /*3 标签名称*/
        //     "<span style='color: red'>$3</span>" +
        //     /*4. 属性*/
        //     "<span style='color: orange'>$4</span>" +
        //     /*5. >*/
        //     "$5"
        // );
        //
        //
        // // //高亮字符串
        // let strReg = /(&quot;)(.*?[^\\])(&quot;)/g;
        // if (strReg.test(nCode)) {
        //     // nCode = nCode.replace(strReg, "<span class='hl-code-string'>\"$1\"</span>");
        //     // nCode = nCode.replace(strReg, "$1<span class='hl-code-string'>$2</span>$3");
        //     nCode = nCode.replace(strReg, "<span class='hl-code-string'>$1$2$3</span>");
        // }
        //
        //
        //
        // //什么也没有
        // if (nCode.trim().substring(0, 1)!=="&") {
        //     nCode = "<span style='color: grey'>" + nCode + "</span>";
        // }
        //
        // nCode = indentEle + nCode;
        // return nCode;
    }

    /**
     * 处理XML的纯文本
     * @param plainText
     * @returns {string}
     */
    function parsePlainTextOfXML(plainText) {
        return (plainText === null || plainText.length === 0) ? "" : "<span style='color: grey'>" + plainText + "</span>";
    }

    /**
     * 单独处理每个XML标签, 不能闭合，不能有其他任何东西
     * 参数举例 ： <a href="example.com" >
     * 参数举例 ： <span class="ok">
     * 参数举例 ： <span>
     * 参数举例 ： <!DOCTYPE html>
     *
     * 错误参数举例： <a href="example.com"></a>
     * 错误参数举例2: <a href="example.com"> abc </a>
     * 错误参数举例3: <a href="example.com">
     * @param rawXML
     * @returns {string}
     */
    function parseOneTagOfXML(rawXML) {
        let nCode = rawXML;

        //高亮XML声明
        let docTypeReg = /(&lt;)(![\w]+)(\s+)(.*)(&gt;)/g;
        nCode = nCode.replace(docTypeReg, "$1<span style='color: red'>$2</span>$3<span style='color: orange'>$4</span>$5");


        //                1<  2/ 3标签名称 4属性 5> 6内容    7</ 8标签名称
        // let tagNameReg = /(<)(\/?)([\w]+)(.*)(>)([^>]+)(\1\/)(\3)/g;
        //单行闭合标签
        // let singleLineTag = /(&lt;)(\/?)([\w]+)(.*)(&gt;)([^&gt;]*)(\1\/)(\3)/g;
        // let singleLineTag = /(&lt;)(\/?)([\w]+)(.*)(&gt;)([^&;]*)(\1\/)(\3)/g;
        let singleLineTag = /(&lt;)(\/?)([\w]+)(.*)(&gt;)(.*)(\1\/)(\3)/g;
        //"<a > b</a>".replace(/(<)(\/?)([\w]+)(.*)(>)([^>]+)(\1\/)(\3)/g, "#1$1# ^2$2^ (3$3) @4$4@ (5$5) @6$6@ (7$7)  #8$8#")
        // nCode = nCode.replace(tagNameReg, "$1$2<span style='color: red'>$3</span>$4$5$6$7$8$9$10$11");
        nCode = nCode.replace(singleLineTag,
            /*1.2 <或者</*/
            "$1$2" +
            /*3 标签名称*/
            "<span style='color: red'>$3</span>" +
            /*4. 属性*/
            "<span style='color: orange'>$4</span>" +
            /*5. >*/
            "$5" +
            /*6. 内容*/
            "<span style='color: grey'>$6</span>" +
            /*7. </*/
            "$7" +
            /*8. 标签名称*/
            "<span style='color: red'>$8</span>"
        );


        //未闭合标签
        //                  1<  2/ 3标签名称 4属性 5> 6内容
        let noCloseTag = /(&lt;)(\/?)([\w]+)(.*)(&gt;)/g;
        nCode = nCode.replace(noCloseTag,
            /*1.2 <或者</*/
            "$1$2" +
            /*3 标签名称*/
            "<span style='color: red'>$3</span>" +
            /*4. 属性*/
            "<span style='color: orange'>$4</span>" +
            /*5. >*/
            "$5"
        );


        // //高亮字符串""
        let strReg = /(&quot;)(.*?[^\\])(&quot;)/g;
        if (strReg.test(nCode)) {
            // nCode = nCode.replace(strReg, "<span class='hl-code-string'>\"$1\"</span>");
            // nCode = nCode.replace(strReg, "$1<span class='hl-code-string'>$2</span>$3");
            nCode = nCode.replace(strReg, "<span class='hl-code-string'>$1$2$3</span>");
        }

        //高亮字符串''
        // let str1Reg = /'([^']+)'/g;
        let str1Reg = /&#39;(.*?)&#39;/g;
        if (str1Reg.test(nCode)) {
            nCode = nCode.replace(str1Reg, "<span class='hl-code-string'>'$1'</span>");
        }


        //什么也没有
        if (nCode.trim().substring(0, 1) !== "&") {
            return parsePlainTextOfXML(nCode);
        }


        return nCode;
    }


    function hlString(line) {
        //拿到key world

        //高亮字符串
        // line = line.replace(/&quot;(.*)&quot;/g, "<span style='color: darkgoldenrod'>\"$1\"</span>")
        if (/"(.*)"/g.test(line)) {
            line = line.replace(/"(.*)"/g, "<span style='color: darkgoldenrod'>\"$1\"</span>");
        } else if (/'(.*)'/g.test(line)) {
            line = line.replace(/'(.*)'/g, "<span style='color: darkgoldenrod'>\'$1\'</span>");
        }
        return line;
    }

    /**
     * 默认的解析方法
     * @param rawCode
     * @returns {string | void | *}
     */
    function parseDefault(rawCode) {
        let afterHiglight;

        //TODO 高亮字符串
        afterHiglight = hlString(rawCode);

        //TODO 高亮数字
        //TODO 高亮函数
        //TODO 高亮包名
        //TODO 高亮注释
        //TODO 高亮关键字

        // return "<span style='color: " + getRanDomColor() + ";'>" + rawCode + "</span>";
        return afterHiglight;
    }


    /**
     * 解析java代码
     * @param rawCode
     * @returns {string|*}
     */
    function parseJava(rawCode) {
        const keywords = [
            /*包*/
            "import", "package",
            /*类*/
            "new",
            "class", "abstract", "interface",
            "extends", "implements",
            "this", "instanceof", "super",

            /*流程*/
            "try", "catch", "finally",
            /*必须按照这个顺序，否则会解析throw后插入<span>就无法再次解析throws了*/
            "throws",
            "throw",
            "if", "else", "while", "for", "do",
            "switch", "case",
            "continue", "break", "goto",

            /*断言*/
            "assert",

            /*方法/修饰*/
            "void", "protected", "public", "default", "private",
            "synchronized", "static",
            "return",


            /*语言类型*/
            "null",
            "byte",
            "true", "false",
            "shot", "int", "long",
            "float", "double",
            "char",
            "enum",
        ];


        // '"': '&quot;',
        //     "'": '&#39;'

        let nCode = escapeCode(rawCode.trim(), false);

        /**
         * 为了防止字符‘和html标签的字符重合，我们先把原生的'转义
         * @type {number | *}
         */


            // 获取开头的缩进内容
        let indentSize = rawCode.search(/[^\s]/g);
        let indentEle = "";
        if (indentSize !== -1) {
            // indentEle = "<span class='code-indent' style='padding-left: " + (Math.floor((indentSize / 4)) + "em'></span>");
            indentEle = "<span class='code-indent' style='padding-left: " + (Math.floor((indentSize / 4) * 20) + "px'></span>");
        }

        // let isStartComment = false;

        //TODO /**/多行注释
        let commentStartReg = /\/\*/g;
        let commentEndReg = /\*\//g;
        let matterCommentStart = commentStartReg.exec(rawCode);
        if (matterCommentStart) {

            //多行注释时，
            /**
             * 单行有注释的开头，没有注释结尾
             * 这时候不解析后面的任何字符，直接返回，进入下一行的解析
             */
            if (!isStartComment && /\/\*/g.test(nCode) && !/\*\//g.test(nCode)) {
                isStartComment = true;
                let commentStartRegToEnd = /(\/\*.*)/g;
                nCode = indentEle + nCode.replace(commentStartRegToEnd, "<span class='hl-code-multi-line-comment'>$1</span>");
                return nCode;
            }

            //检测是否为单行注释
            /**
             * 单行有注释的开头，有注释结尾
             *
             */
            let singleCommentReg = /(\/\*.*\*\/)/g;
            if (singleCommentReg.test(rawCode)) {
                nCode = rawCode.replace(singleCommentReg, "<span class='hl-code-one-line-comment'>$1</span>")
            }

        }

        //进入了多行注释，但是注释还没结束, 直接返回
        if (isStartComment && !commentEndReg.test(nCode)) {
            nCode = indentEle + "<span class='hl-code-multi-line-comment'>" + nCode + "</span>";
            return nCode;
        }

        //进入了多行注释，判断到结束字符，结束标签
        if (isStartComment && /\*\//g.test(nCode)) {
            let commentStartToEndReg = /(.*\*\/)/g;
            isStartComment = false;
            nCode = indentEle + nCode.replace(commentStartToEndReg, "<span class='hl-code-multi-line-comment'>$1</span>");
            return nCode;
        }

        //高亮字符
        // let str1Reg = /'([^']+)'/g;
        let str1Reg = /&#39;(\\&#39;|\\&quot;|.{0,2})&#39;/g;
        if (str1Reg.test(nCode)) {
            nCode = nCode.replace(str1Reg, "<span class='hl-code-string'>'$1'</span>");
        }


        //高亮数字
        //\b表示非字母数字与字母数字的边界。
        //由于'会被转义成&#39, 我们不能高亮这个数字，否则会将&#39分割成 &#<span...>39</span> 网页就无法正确显示了
        let numberReg = /([^#])\b(\d+)\b/g;
        nCode = nCode.replace(numberReg, "$1<span class='hl-code-number'>$2</span>");


        //高亮注解
        let annoReg = /(@\b\w+\b)(\()?/g;
        nCode = nCode.replace(annoReg, "<span class='hl-code-annotation'>$1</span>$2");


        //高亮关键字
        for (let i = 0; i < keywords.length; i++) {
            //\\b边界限定
            //为防止标签内的class和java关键字冲突，需要用[^=]排除class=的字段
            let keyWordReg = new RegExp("\\b(" + keywords[i] + ")\\b([^=])", "g");

            nCode = nCode.replace(keyWordReg, "<span class='hl-code-keyword'>$1</span>$2");
        }

        /**
         * 匹配 字符串 '‘
         * 字符串开头不能是=或者\w
         * 字符串结束：只要遇到'就结束
         * @type {RegExp}
         */
        // let strRegNoClass = /([^=\w])('[^']+')+/g;

        /**
         * 去除html剩余的东西
         * 解释
         * 分三段
         *<[^>]+> html标签开头
         *([^<>]+) html标签内容，不能有 < 或者 >出现
         *<[^>]+> html标签结束
         * @type {RegExp}
         */
        // let trimHtmlReg = /<[^>]+>([^<>]+)<[^>]+>/g;
        // let trimHtmlReg = /<[^>/]+>([^<>]+)<[^>]+>/g;
        // let trimHtmlReg = /<[^>/]+>([^<>]+)<\/[^>]+>/g;
        // let trimHtmlReg = /(<[^>/]+>)([^<>]+)(<\/[^>]+>)/g;


        // 高亮字符串
        /**
         * 解释：
         * (&quot;)     引号开头
         * (.*?[^\\])   任意内容，不贪婪匹配，直到遇到非转义符号(\)的时候停止
         * (&quot;)     在转义符号后面必须有&quot;才匹配
         * @type {RegExp}
         */
        let strReg = /(&quot;)(.*?[^\\])(&quot;)/g;
        if (strReg.test(nCode)) {
            // nCode = nCode.replace(strReg, "<span class='hl-code-string'>\"$1\"</span>");
            // nCode = nCode.replace(strReg, "$1<span class='hl-code-string'>$2</span>$3");
            nCode = nCode.replace(strReg, "<span class='hl-code-string'>$1$2$3</span>");
        }


        //高亮方法
        let funReg = /\b([\w]+)\b\(/g;
        let obj = funReg.exec(nCode);
        if (obj) {
            nCode = nCode.replace(funReg, "<span class='hl-code-function'>$1</span>(");
        }


        //高亮this后面的属性
        let thisFieldReg = /(this<\/span>).([\w]+)/;
        //如果不是方法, 则需要处理
        nCode = nCode.replace(thisFieldReg, "$1.<span class='hl-code-field'>$2</span>");
        // nCode = nCode.replace(thisFieldReg, "$1.<span class='hl-code-field'>$2</span>");


        //
        //     //高亮单行注释
        // let singleCommentReg = /\/\/(.*)/g;
        // if (singleCommentReg.test(rawCode)) {
        //     //获取注释的字串
        //     nCode = nCode.substring(0, nCode.indexOf("//")) + getTrimedHtml(nCode.substring(nCode.indexOf("//")));
        //     nCode = nCode.replace(singleCommentReg, "<span class='hl-code-one-line-comment'>//$1</span>");
        //     return (nCode == null || nCode.length === 0) ? rawCode : nCode;
        // }

        //高亮单行注释
        //形式//
        let singleCommentReg = /\/\/(.*)/g;
        if (singleCommentReg.test(nCode)) {
            //获取注释的字串
            nCode = nCode.substring(0, nCode.indexOf("//")) + getTrimedHtml(nCode.substring(nCode.indexOf("//")));
            nCode = nCode.replace(singleCommentReg, "<span class='hl-code-one-line-comment'>//$1</span>");
            return indentEle + nCode;
        }

        //加入开头的缩进
        nCode = indentEle + nCode;
        return (nCode == null || nCode.length === 0) ? rawCode : nCode;
    }

    /**
     * 获取去掉html标签后的文本
     * @param html
     * @returns {void | string | *}
     */
    function getTrimedHtml(html) {
        let trimHtmlReg = /<[^>]+>/g;
        return html.replace(trimHtmlReg, "");
    }

}


//转义特殊字符以免被浏览器解析
escapeCode.escapeTest = /[&<>"']/;
escapeCode.escapeReplace = /[&<>"']/g;
escapeCode.replacements = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
};
escapeCode.escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/;
escapeCode.escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g;

function escapeCode(html, encode) {

    if (encode) {
        if (escapeCode.escapeTest.test(html)) {
            return html.replace(escapeCode.escapeReplace, function (ch) {
                return escapeCode.replacements[ch];
            });
        }
    } else {
        if (escapeCode.escapeTestNoEncode.test(html)) {
            return html.replace(escapeCode.escapeReplaceNoEncode, function (ch) {
                return escapeCode.replacements[ch];
            });
        }
    }
    return html;
}




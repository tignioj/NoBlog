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
        rawCode = escapeCode(rawCode);
        return rawCode;
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



        let nCode = rawCode.trim();

        // 获取开头的缩进内容
        let indentSize = rawCode.search(/[^\s]/g);
        let indentEle = "";
        if (indentSize !== -1) {
            // indentEle = "<span class='code-indent' style='padding-left: " + (Math.floor((indentSize / 4)) + "em'></span>");
            indentEle = "<span class='code-indent' style='padding-left: " + (Math.floor((indentSize / 4)*20) + "px'></span>");
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
            if (!isStartComment &&  /\/\*/g.test(nCode) && ! /\*\//g.test(nCode)) {
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





        //高亮数字
        //\b表示非字母数字与字母数字的边界。
        let numberReg = /\b(\d+)\b/g;
        nCode = nCode.replace(numberReg, "<span class='hl-code-number'>$1</span>");



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

        //高亮字符串
        let strReg = /"(.*)"/g;
        nCode = nCode.replace(strReg, "<span class='hl-code-string'>\"$1\"</span>");

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




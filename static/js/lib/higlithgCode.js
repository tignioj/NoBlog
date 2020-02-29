/**
 * 高亮代码
 * 原理：封装css
 * @param rawCode 未高亮的代码
 * @param language 语言
 */

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
            "throw", "throws",
            "if", "else", "while", "for", "do",
            "switch", "case",
            "continue", "break", "goto",

            /*断言*/
            "assert",

            /*方法/修饰*/
            "void", "protect", "public", "default", "private",
            "synchronized", "static",
            "return",


            /*语言类型*/
            "byte",
            "true", "false",
            "shot", "int", "long",
            "float", "double",
            "char",
            "enum",
        ];


        let nCode = "";
        /**
         * 高亮方法
         * 1. 获取开头的缩进内容
         * 2. 以空格分割字符串成一个数组
         * 3. 遍历数组，则用对应的标签包装
         * 关键字
         * 数字
         * 如果是函数
         * @type {*|string[]}
         */
        let indentSize = rawCode.search(/[^\s]/g);
        let indentEle = "";
        if (indentSize !== -1) {
            indentEle = "<span class='code-indent' style='padding-left: " + ((indentSize / 4)) + "em'></span>";
        }
        nCode += indentEle;


        //高亮单行注释
        let singleCommentReg = /\/\/(.*)/g;
        if (singleCommentReg.test(rawCode)) {
            nCode += rawCode.trim();
            nCode = nCode.replace(singleCommentReg, "<span class='hl-code-one-line-comment'>//$1</span>");
            return (nCode == null || nCode.length === 0) ? rawCode : nCode;
        }

        //TODO 高亮多行注释


        let arr = rawCode.split(/\s+/g);


        /**
         * 遍历每一个word
         */
        for (let i = 0; i < arr.length; i++) {
            let word = arr[i].trim();
            let firstChar = word.charAt(0);

            //是否包含keyword
            if (keywords.indexOf(word) > -1) {
                word = "<span class='hl-code-keyword'>" + word + "</span>";
            }


            //高亮方法
            let functionBorder = word.indexOf("(");
            if (firstChar !== "@" && functionBorder > 0) {
                word = "<span class='hl-code-function'>" + word.substring(0, functionBorder) + "</span>" + word.substring(functionBorder);
            }

            //注解
            if (firstChar === "@") {
                let annoBorder = word.indexOf("(");
                if (annoBorder !== -1) {
                    word = "<span class='hl-code-annotation'>" + word.substring(0, annoBorder) + "</span>" + word.substring(annoBorder);
                } else {
                    word = "<span class='hl-code-annotation'>" + word + "</span>"
                }
            }


            if (i < arr.length - 1) {
                word += " ";
            }
            nCode += word;
        }

        //高亮字符串
        let strReg = /"(.*)"/g;
        nCode = nCode.replace(strReg, "<span class='hl-code-string'>\"$1\"</span>");


        //高亮this
        //因为function已经在前面解析过，为了防止再次解析到方法（比如this.hello()), 需要进行检测
        let thisFieldReg = /this\.([\w]+)/g;
        let thisFunReg = /this\.([\w]+)\(/g;
        let trimHtmlReg = /<[^>]+>/g;
        let trimedCode = nCode.replace(trimHtmlReg, "");
        //如果不是方法, 则需要处理
        if (!thisFunReg.test(trimedCode)) {
            nCode = nCode.replace(thisFieldReg, "<span  class='hl-code-keyword' >this</span>.<span class='hl-code-field'>$1</span>");
        } else {
            nCode = nCode.replace(thisFieldReg, "<span  class='hl-code-keyword' >this</span>.$1");
        }


        return (nCode == null || nCode.length === 0) ? rawCode : nCode;
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




/**
 * 高亮代码
 * 原理：封装css
 * @param rawCode 未高亮的代码
 * @param language 语言
 */

//判断java是否进入了多行注释
let isStartComment = false;

//判断html是否为多行注释
let isStartMultiLineHtmlComment = false;

//默认高亮方法变量，用于判断是否进入了多行注释
let isStartMultiLineDefaultComment = false;


function highlightCode(rawCode, language) {

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
                "<span class='hl-code-html-tag'>$3</span>" +
                /*4. 属性*/
                "<span class='hl-code-html-prop'>$4</span>" +
                /*5. >*/
                "$5"
            );


            // //高亮字符串""
            let strReg = /(&quot;)(.*?[^\\])(&quot;)/g;
            if (strReg.test(nCode)) {
                // nCode = nCode.replace(strReg, "<span class='hl-code-string'>\"$1\"</span>");
                // nCode = nCode.replace(strReg, "$1<span class='hl-code-string'>$2</span>$3");
                nCode = nCode.replace(strReg, "<span class='hl-code-html-string'>$1$2$3</span>");
            }

            //高亮字符串''
            // let str1Reg = /'([^']+)'/g;
            let str1Reg = /&#39;(.*?)&#39;/g;
            if (str1Reg.test(nCode)) {
                nCode = nCode.replace(str1Reg, "<span class='hl-code-html-string'>'$1'</span>");
            }


            //什么也没有
            if (nCode.trim().substring(0, 1) !== "&") {
                return parsePlainTextOfXML(nCode);
            }


            return nCode;
        }


        /**
         * 处理非注释以外的xml标签
         * 比如
         * <a></a>
         * <span class="abc"> test </span>
         * @param nCode
         * @returns {string}
         */
        function parseNoneCommentXML(nCode) {
            //判断纯文本
            if (!/&lt;\/?\w+.*&gt/.test(nCode)) {
                return parsePlainTextOfXML(nCode);
            }

            /**
             * 方法2
             */
                // let tagSeparatorReg2 = /.*?<[^>]+>/g;
            let tagSeparatorReg2 = /.*?&lt;((?!&gt;).)+&gt;/g;

            //获取标签后面的字符串
            let textAfterIndex = nCode.lastIndexOf("&gt;");
            let textAfter = nCode.substring(textAfterIndex + 4);

            //获取标签前面的字符串
            let textBeforeIndex = nCode.search(/&lt;\w+.*&gt;/g);
            let textBefore = nCode.substring(0, textBeforeIndex);

            //获取去掉两边字符串的标签
            let tagEle = nCode.substring(textBeforeIndex, textAfterIndex) + "&gt;";

            //将标签分割成标签组
            let tagArr2 = tagEle.match(tagSeparatorReg2);
            if (tagArr2 !== null) {
                let tempEle = "";
                for (let i = 0; i < tagArr2.length; i++) {
                    let plainTextWithTag = tagArr2[i];
                    let textAndTagBoundryReg = /&lt;\/\w+.*&gt;/g;
                    let textAndTagBoundry = plainTextWithTag.search(textAndTagBoundryReg);
                    let plainText = plainTextWithTag.substring(0, textAndTagBoundry);
                    let tag = plainTextWithTag.substring(textAndTagBoundry);
                    tempEle += parsePlainTextOfXML(plainText) + parseOneTagOfXML(tag);
                }
                return parsePlainTextOfXML(textBefore) + tempEle + parsePlainTextOfXML(textAfter);
            } else {
                return parsePlainTextOfXML(nCode);
            }

        }

        /**
         * 处理XML的纯文本
         * @param plainText
         * @returns {string}
         */
        function parsePlainTextOfXML(plainText) {
            if (plainText !== null && plainText !== undefined && plainText.length !== 0) {
                return "<span class='hl-code-html-plain-text'>" + plainText + "</span>";
            }
            return "";
        }

        /**
         * 处理XML注释
         * @param rawComment
         * @returns {void | string | *}
         */
        function parseXMLComment(rawComment) {
            let xmlComment = /(^\s?&lt;!--.*?--&gt;)/g;
            if (xmlComment.test(rawComment)) {
                return rawComment.replace(xmlComment, "<span class='hl-code-html-comment'>$1</span>");
            }
        }

        let nCode = escapeCode(rawCode.trim(), false);

        // 获取开头的缩进内容
        let indentSize = rawCode.search(/[^\s]/g);
        let indentEle = "";
        if (indentSize !== -1) {
            //缩进的单位
            // indentEle = "<span class='code-indent' style='padding-left: " + (Math.floor((indentSize / 4) * 20) + "px'></span>");
            indentEle = rawCode.substring(0, indentSize);
        }

        //判断实体
        //高亮XML声明
        let docTypeReg = /(&lt;)(![\w]+)(\s+)(.*)(&gt;)/g;
        if (docTypeReg.test(nCode)) {
            return indentEle + nCode.replace(docTypeReg, "$1<span class='hl-code-html-declare-tag'>$2</span>$3<span class='hl-code-html-declare-type'>$4</span>$5");
        }


        //2. 处理多行简单的多行html注释
        /**
         *      <!--
         *          abc -->
         * 或者
         * <!--
         *  abc
         * -->
         * @type {RegExp}
         */
        let startComent = /(&lt;!--.*)/g;
        let endComment = /(--&gt;)/g;
        if (!isStartMultiLineHtmlComment && startComent.test(nCode) && !endComment.test(nCode)) {
            isStartMultiLineHtmlComment = true;
            return indentEle + nCode.replace(startComent, "<span class='hl-code-html-comment'>$1</span>");
        }

        //进入了注释
        if (isStartMultiLineHtmlComment) {
            //判断结束
            if (!startComent.test(nCode) && endComment.test(nCode)) {
                isStartMultiLineHtmlComment = false;
                return indentEle + nCode.replace(endComment, "<span class='hl-code-html-comment'>$1</span>");
            }
            return indentEle + "<span class='hl-code-html-comment'>" + nCode + "</span>";
        }


        //TODO 处理复杂html注释
        /**
         * 比如
         * <!--注释1--> <a>不是注释</a> <!--注释2--> <a>不是注释</a>
         */
        /**
         * 切割注释和标签
         * @type {RegExp}
         */
            // let tagSeparatorReg = /.*?<[^>]+>/g;
        let commentSeparatorReg = /.*?&lt;!--((?!--&gt;).)+--&gt;/g;
        //1. 处理单行注释
        // let xmlComment = /<!--(.*)-->/g

        //2. 拿到正则无法获取最后面的一小段的边界 比如 <!--xx-->边界(此处正则无法获取的内容)
        let tagAfterCommentIndex = nCode.lastIndexOf("--&gt;");

        //3. 拿到正则无法获取最后面的一小段
        //文本1  <!--xx--> 文本 2
        //切割方法只能拿到注释和注释前面的文本，所有后面的文本2需要我们手动处理
        let tagAfterComment = nCode.substring(tagAfterCommentIndex + 6);

        //4. 获取注释和注释前面的内容
        //比如    文本1 <!--xxx-->
        //这里我们就获取到了
        //        文本1 <!--xxx--
        //但是--> 需要我们自己添加上去
        let tagCommentBefore = nCode.substring(0, tagAfterCommentIndex) + "--&gt;";

        //比如：切割  abc <!--aa--> def <!--bb--> ghi <!--cc--> jkl
        /**
         * [
         *      "abc <!--aa-->",
         *      "def <!--bb-->",
         *      "ghi <!--cc-->"
         * ]
         * 这里的jkl用这种切割方法是无法获取到的，我们上面低3步的时候已经单独提取处理
         */
            //注：由于第三步已经把jkl提取出来，所以实际上任何的 --> 后面的文本都不会在这里出现
        let commentTagArr = tagCommentBefore.match(commentSeparatorReg);

        //临时拼接处理后的的ELE,
        //比如拼接 <span class="高亮"> &lt;a&gt;&lt;/a&gt; + </span> <span class="注释"> &lt;!--xxx--&gt;</span>
        let temEleWithCommentAndTag = "";
        if (commentTagArr !== null) {
            for (let i = 0; i < commentTagArr.length; i++) {
                //"abc <!--aa-->
                let commentWithTag = commentTagArr[i];

                //"abc | <!--aa-->  这里的|表示我们要获取的位置
                let commentAndTagBoundaryIndex = commentWithTag.search(/&lt;!--.*&gt;/g);

                //比如获取 "abc | <!--aa--> 中的 abc
                let tagBeforeComment = commentWithTag.substring(0, commentAndTagBoundaryIndex);

                //比如获取 "abc | <!--aa--> 中的 <!--aa-->
                let comment = commentWithTag.substring(commentAndTagBoundaryIndex);

                //处理tagBeforeComment , 即处理  "abc ", 其中abc可能是标签
                let tagBeforeCommentHighlighted = parseNoneCommentXML(tagBeforeComment);


                //处理comment, 即处理 <!--aa-->
                let commentHighlighted = parseXMLComment(comment);

                //拼接处理后的tag 和 comment
                temEleWithCommentAndTag += tagBeforeCommentHighlighted + commentHighlighted;
            }
            //拼接上面提取的jkl
            nCode = temEleWithCommentAndTag + parseNoneCommentXML(tagAfterComment);
        } else {
            nCode = parseNoneCommentXML(nCode)
        }

        //拼接 缩进 换行
        nCode = indentEle + nCode;
        return nCode;

    }


    /**
     * 默认的解析方法
     * @param rawCode
     * @returns {string | void | *}
     */
    function parseDefault(rawCode) {
        const keywords = [
            /*=====javascript=====*/
            "function",
            "var", "let",
            "document",


            /*=====java=======*/
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


        function hlString(nCode) {
            let strReg = /(&quot;)(.*?[^\\])(&quot;)/g;
            if (strReg.test(nCode)) {
                // nCode = nCode.replace(strReg, "<span class='hl-code-string'>\"$1\"</span>");
                // nCode = nCode.replace(strReg, "$1<span class='hl-code-string'>$2</span>$3");
                nCode = nCode.replace(strReg, "<span class='hl-code-string'>$1$2$3</span>");
            }
            return nCode;
        }

        function hlFunction(nCode) {
            let funReg = /\b([\w]+)\b\(/g;
            let obj = funReg.exec(nCode);
            if (obj) {
                nCode = nCode.replace(funReg, "<span class='hl-code-function'>$1</span>(");
            }
            return nCode;
        }

        function hlKeyWords(nCode) {
            //高亮关键字
            for (let i = 0; i < keywords.length; i++) {
                //\\b边界限定
                //为防止标签内的class和java关键字冲突，需要用[^=]排除class=的字段
                let keyWordReg = new RegExp("\\b(" + keywords[i] + ")\\b([^=])", "g");

                nCode = nCode.replace(keyWordReg, "<span class='hl-code-keyword'>$1</span>$2");
            }
            return nCode;
        }


        function highlightNumber(nCode) {
            //高亮数字
            //\b表示非字母数字与字母数字的边界。
            //由于'会被转义成&#39, 我们不能高亮这个数字，否则会将&#39分割成 &#<span...>39</span> 网页就无法正确显示了
            let numberReg = /([^#])\b(\d+)\b/g;
            return nCode.replace(numberReg, "$1<span class='hl-code-number'>$2</span>");
        }

        function highlightDoubleSlashComment(nCode) {
            let singleCommentReg = /\/\/(.*)/g;
            if (singleCommentReg.test(nCode)) {
                //获取注释的字串
                nCode = nCode.substring(0, nCode.indexOf("//")) + getTrimedHtml(nCode.substring(nCode.indexOf("//")));
                nCode = nCode.replace(singleCommentReg, "<span class='hl-code-one-line-comment'>//$1</span>");
            }
            return nCode;
        }


        let nCode = escapeCode(rawCode, false);

        // 高亮关键字
        nCode = hlKeyWords(nCode);

        //
        // 高亮字符串
        nCode = hlString(nCode);
        //
        // 高亮数字
        nCode = highlightNumber(nCode);
        //
        //高亮函数
        nCode = hlFunction(nCode);

        //TODO 高亮注释
        //单行注释
        nCode = highlightDoubleSlashComment(nCode);

        //多行注释


        // return "<span style='color: " + getRanDomColor() + ";'>" + rawCode + "</span>";
        return nCode;
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
        function getIndentEle(rawCode) {
            let indentSize = rawCode.search(/[^\s]/g);
            let indentEle = "";
            if (indentSize > 0) {
                indentEle = rawCode.substr(0, indentSize);
            }
            return indentEle;
        }

        let indentEle = getIndentEle(rawCode);

        /**
         * 比如
         * <!--注释1--> <a>不是注释</a> <!--注释2--> <a>不是注释</a>
         */
        /**
         * 切割注释和标签
         * @type {RegExp}
         */
            // let tagSeparatorReg = /.*?<[^>]+>/g;
            // let commentSeparatorReg = /.*?&lt;!--((?!--&gt;).)+--&gt;/g;
        let commentSeparatorReg = /.*?\/\*((?!\*\/).)+\*\//g;

        //2. 拿到正则无法获取最后面的一小段的边界 比如 <!--xx-->边界(此处正则无法获取的内容)
        // let tagAfterCommentIndex = nCode.lastIndexOf("--&gt;");
        let tagAfterCommentIndex = nCode.lastIndexOf("*/");

        //3. 拿到正则无法获取最后面的一小段
        //文本1  /*注释1*/ 文本 2
        //切割方法只能拿到注释和注释前面的文本，所有后面的文本2需要我们手动处理
        let tagAfterComment = nCode.substring(tagAfterCommentIndex + 2);

        //4. 获取注释和注释前面的内容
        //比如    文本1 /*注释1*/
        //这里我们就获取到了
        //        文本1 /*注释1
        //但是注释的闭合*/ 需要我们自己添加上去
        let tagCommentBefore = nCode.substring(0, tagAfterCommentIndex) + "*/";

        //比如：切割  abc /*注释1*/ def /**注释2*/ ghi /*注释3*/ jkl
        // /**
        //   [
        //        "abc /*注释1*/",
        //        "def /*注释2*/",
        //        "ghi /*注释3*/"
        //   ]
        //   这里的jkl用这种切割方法是无法获取到的，我们上面低3步的时候已经单独提取处理
        //注：由于第三步已经把jkl提取出来，所以实际上任何的 */ 后面的文本都不会在这里出现
        let commentTagArr = tagCommentBefore.match(commentSeparatorReg);

        //临时拼接处理后的的ELE,
        //比如拼接 <span class="高亮"> System.out.println("ok") </span> <span class="注释"> /*注释*/ </span>
        let temEleWithCommentAndTag = "";
        if (commentTagArr !== null) {
            for (let i = 0; i < commentTagArr.length; i++) {
                //"abc /*注释1*/
                let commentWithTag = commentTagArr[i];

                //"abc | /*注释2*/  这里的|表示我们要获取的位置
                let commentAndTagBoundaryIndex = commentWithTag.search(/\/\*.*\*\//g);

                //比如获取 "abc | /*注释*/ 中的 abc
                let tagBeforeComment = commentWithTag.substring(0, commentAndTagBoundaryIndex);

                //比如获取 "abc | /*注释*/ 中的 /*注释*/
                let comment = commentWithTag.substring(commentAndTagBoundaryIndex);

                //处理tagBeforeComment , 即处理  "abc ", 其中abc是非注释的内容，比如System.out.println("ok");
                let tagBeforeCommentHighlighted = parseAfterSplitCommentOfJava(tagBeforeComment);


                //处理comment, 即处理  "/*注释 */"
                let commentHighlighted = parseJavaComment(comment);

                //拼接处理后的tag 和 comment
                temEleWithCommentAndTag += tagBeforeCommentHighlighted + commentHighlighted;
            }
            //拼接上面提取的jkl
            nCode = temEleWithCommentAndTag + parseAfterSplitCommentOfJava(tagAfterComment);
        } else {
            nCode = parseAfterSplitCommentOfJava(nCode)
        }
        return indentEle + nCode;


        /***
         * 处理被正则分割后，非全注释部分
         * 比如
         */
         // (空白) /*注释1*/  System.out.println("ok")  /*注释2*/ public /*注释3*/ 文本4  /* 半个注释
        //这里处理的包括
        //  1. 开头的空白
        //  2.  System.out.println("ok")
        //  3. public
        //  4. 文本4
        //  5. /* 半个注释
        function parseAfterSplitCommentOfJava(nCode) {
            let commentStartReg = /\/\*/g;
            let commentEndReg = /\*\//g;

            if (commentStartReg.test(nCode)) {
                /**
                 * 单行有注释的开头，没有注释结尾
                 * 这时候不解析后面的任何字符，直接返回，进入下一行的解析
                 * 比如
                 *      /* 开始注释
                 * 但是没有结束，不用说后面的肯定是灰色的
                 * 但是前面的需要单独拿出来解析
                 */
                if (!isStartComment && /\/\*/g.test(nCode) && !/\*\//g.test(nCode)) {
                    //分割注释和前面非注释的内容
                    //比如  System.out.println("ok")      |/*  注释1
                    // 这里的的|就是分割的地方
                    let lastCommentStartIndex = nCode.lastIndexOf("/*");
                    //获取注释,即获取 /* 注释1
                    let afterIndexOfComment = nCode.substring(lastCommentStartIndex);

                    //获取注释前面的字符串，即System.out.println("ok")      |
                    let stringBeforeLastCommentStartIndex = nCode.substring(0, lastCommentStartIndex);

                    //
                    afterIndexOfComment = "<span class='hl-code-multi-line-comment'>" + afterIndexOfComment + "</span>";
                    let tempEle = parseNoneCommentOfJava(stringBeforeLastCommentStartIndex) + afterIndexOfComment;
                    isStartComment = true;
                    return tempEle;
                }

                // let singleCommentReg = /(\/\*.*\*\/)/g;
                //检测是否为单行注释, 中间不能有其它内容
                let singleCommentReg = /^\s*?(\/\*((?!\*\/|\/\*).)+\*\/)\s*?$/g;
                if (singleCommentReg.test(rawCode)) {
                    nCode = rawCode.replace(singleCommentReg, "<span class='hl-code-one-line-comment'>$1</span>");
                    return nCode;
                }
            }
            return parseNoneCommentOfJava(nCode);


            function parseNoneCommentOfJava(nCode) {
                //进入了多行注释，但是注释还没结束, 直接返回
                if (isStartComment && !commentEndReg.test(nCode)) {
                    nCode = "<span class='hl-code-multi-line-comment'>" + nCode + "</span>";
                    return nCode;
                }

                //进入了多行注释，判断到结束字符，结束标签
                if (isStartComment && /\*\//g.test(nCode)) {
                    let commentStartToEndReg = /(.*\*\/)/g;
                    isStartComment = false;
                    nCode = nCode.replace(commentStartToEndReg, "<span class='hl-code-multi-line-comment'>$1</span>");
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


                //高亮单行注释
                //形式//
                let singleCommentReg = /\/\/(.*)/g;
                if (singleCommentReg.test(nCode)) {
                    //获取注释的字串
                    nCode = nCode.substring(0, nCode.indexOf("//")) + getTrimedHtml(nCode.substring(nCode.indexOf("//")));
                    nCode = nCode.replace(singleCommentReg, "<span class='hl-code-one-line-comment'>//$1</span>");
                    return nCode;
                }

                return nCode;
            }

            // //进入了多行注释，但是注释还没结束, 直接返回
            // if (isStartComment && !commentEndReg.test(nCode)) {
            //     nCode = "<span class='hl-code-multi-line-comment'>" + nCode + "</span>";
            //     return nCode;
            // }
            //
            // //进入了多行注释，判断到结束字符，结束标签
            // if (isStartComment && /\*\//g.test(nCode)) {
            //     let commentStartToEndReg = /(.*\*\/)/g;
            //     isStartComment = false;
            //     nCode = nCode.replace(commentStartToEndReg, "<span class='hl-code-multi-line-comment'>$1</span>");
            // }
            //
            //
            // //高亮字符
            // // let str1Reg = /'([^']+)'/g;
            // let str1Reg = /&#39;(\\&#39;|\\&quot;|.{0,2})&#39;/g;
            // if (str1Reg.test(nCode)) {
            //     nCode = nCode.replace(str1Reg, "<span class='hl-code-string'>'$1'</span>");
            // }
            //
            // //高亮数字
            // //\b表示非字母数字与字母数字的边界。
            // //由于'会被转义成&#39, 我们不能高亮这个数字，否则会将&#39分割成 &#<span...>39</span> 网页就无法正确显示了
            // let numberReg = /([^#])\b(\d+)\b/g;
            // nCode = nCode.replace(numberReg, "$1<span class='hl-code-number'>$2</span>");
            //
            //
            // //高亮注解
            // let annoReg = /(@\b\w+\b)(\()?/g;
            // nCode = nCode.replace(annoReg, "<span class='hl-code-annotation'>$1</span>$2");
            //
            //
            // //高亮关键字
            // for (let i = 0; i < keywords.length; i++) {
            //     //\\b边界限定
            //     //为防止标签内的class和java关键字冲突，需要用[^=]排除class=的字段
            //     let keyWordReg = new RegExp("\\b(" + keywords[i] + ")\\b([^=])", "g");
            //
            //     nCode = nCode.replace(keyWordReg, "<span class='hl-code-keyword'>$1</span>$2");
            // }
            //
            //
            // // 高亮字符串
            // /**
            //  * 解释：
            //  * (&quot;)     引号开头
            //  * (.*?[^\\])   任意内容，不贪婪匹配，直到遇到非转义符号(\)的时候停止
            //  * (&quot;)     在转义符号后面必须有&quot;才匹配
            //  * @type {RegExp}
            //  */
            // let strReg = /(&quot;)(.*?[^\\])(&quot;)/g;
            // if (strReg.test(nCode)) {
            //     // nCode = nCode.replace(strReg, "<span class='hl-code-string'>\"$1\"</span>");
            //     // nCode = nCode.replace(strReg, "$1<span class='hl-code-string'>$2</span>$3");
            //     nCode = nCode.replace(strReg, "<span class='hl-code-string'>$1$2$3</span>");
            // }
            //
            //
            // //高亮方法
            // let funReg = /\b([\w]+)\b\(/g;
            // let obj = funReg.exec(nCode);
            // if (obj) {
            //     nCode = nCode.replace(funReg, "<span class='hl-code-function'>$1</span>(");
            // }
            //
            //
            // //高亮this后面的属性
            // let thisFieldReg = /(this<\/span>).([\w]+)/;
            // //如果不是方法, 则需要处理
            // nCode = nCode.replace(thisFieldReg, "$1.<span class='hl-code-field'>$2</span>");
            // // nCode = nCode.replace(thisFieldReg, "$1.<span class='hl-code-field'>$2</span>");
            //
            //
            // //高亮单行注释
            // //形式//
            // let singleCommentReg = /\/\/(.*)/g;
            // if (singleCommentReg.test(nCode)) {
            //     //获取注释的字串
            //     nCode = nCode.substring(0, nCode.indexOf("//")) + getTrimedHtml(nCode.substring(nCode.indexOf("//")));
            //     nCode = nCode.replace(singleCommentReg, "<span class='hl-code-one-line-comment'>//$1</span>");
            //     return nCode;
            // }
            //
            // return nCode;
        }

        /**
         * 处理单行的注释
         * @param nCode
         * @returns {void | string | *}
         */
        function parseJavaComment(nCode) {
            //检测是否为单行注释
            /**
             * 单行有注释的开头，有注释结尾
             *
             */
            let singleCommentReg = /(\/\*.*\*\/)/g;
            if (singleCommentReg.test(nCode)) {
                nCode = nCode.replace(singleCommentReg, "<span class='hl-code-one-line-comment'>$1</span>")
            }
            return nCode;
        }

        // //高亮字符
        // // let str1Reg = /'([^']+)'/g;
        // let str1Reg = /&#39;(\\&#39;|\\&quot;|.{0,2})&#39;/g;
        // if (str1Reg.test(nCode)) {
        //     nCode = nCode.replace(str1Reg, "<span class='hl-code-string'>'$1'</span>");
        // }
        //
        //
        // //高亮数字
        // //\b表示非字母数字与字母数字的边界。
        // //由于'会被转义成&#39, 我们不能高亮这个数字，否则会将&#39分割成 &#<span...>39</span> 网页就无法正确显示了
        // let numberReg = /([^#])\b(\d+)\b/g;
        // nCode = nCode.replace(numberReg, "$1<span class='hl-code-number'>$2</span>");
        //
        //
        // //高亮注解
        // let annoReg = /(@\b\w+\b)(\()?/g;
        // nCode = nCode.replace(annoReg, "<span class='hl-code-annotation'>$1</span>$2");
        //
        //
        // //高亮关键字
        // for (let i = 0; i < keywords.length; i++) {
        //     //\\b边界限定
        //     //为防止标签内的class和java关键字冲突，需要用[^=]排除class=的字段
        //     let keyWordReg = new RegExp("\\b(" + keywords[i] + ")\\b([^=])", "g");
        //
        //     nCode = nCode.replace(keyWordReg, "<span class='hl-code-keyword'>$1</span>$2");
        // }
        //
        // /**
        //  * 匹配 字符串 '‘
        //  * 字符串开头不能是=或者\w
        //  * 字符串结束：只要遇到'就结束
        //  * @type {RegExp}
        //  */
        // // let strRegNoClass = /([^=\w])('[^']+')+/g;
        //
        // /**
        //  * 去除html剩余的东西
        //  * 解释
        //  * 分三段
        //  *<[^>]+> html标签开头
        //  *([^<>]+) html标签内容，不能有 < 或者 >出现
        //  *<[^>]+> html标签结束
        //  * @type {RegExp}
        //  */
        // // let trimHtmlReg = /<[^>]+>([^<>]+)<[^>]+>/g;
        // // let trimHtmlReg = /<[^>/]+>([^<>]+)<[^>]+>/g;
        // // let trimHtmlReg = /<[^>/]+>([^<>]+)<\/[^>]+>/g;
        // // let trimHtmlReg = /(<[^>/]+>)([^<>]+)(<\/[^>]+>)/g;
        //
        //
        // // 高亮字符串
        // /**
        //  * 解释：
        //  * (&quot;)     引号开头
        //  * (.*?[^\\])   任意内容，不贪婪匹配，直到遇到非转义符号(\)的时候停止
        //  * (&quot;)     在转义符号后面必须有&quot;才匹配
        //  * @type {RegExp}
        //  */
        // let strReg = /(&quot;)(.*?[^\\])(&quot;)/g;
        // if (strReg.test(nCode)) {
        //     // nCode = nCode.replace(strReg, "<span class='hl-code-string'>\"$1\"</span>");
        //     // nCode = nCode.replace(strReg, "$1<span class='hl-code-string'>$2</span>$3");
        //     nCode = nCode.replace(strReg, "<span class='hl-code-string'>$1$2$3</span>");
        // }
        //
        //
        // //高亮方法
        // let funReg = /\b([\w]+)\b\(/g;
        // let obj = funReg.exec(nCode);
        // if (obj) {
        //     nCode = nCode.replace(funReg, "<span class='hl-code-function'>$1</span>(");
        // }
        //
        //
        // //高亮this后面的属性
        // let thisFieldReg = /(this<\/span>).([\w]+)/;
        // //如果不是方法, 则需要处理
        // nCode = nCode.replace(thisFieldReg, "$1.<span class='hl-code-field'>$2</span>");
        // // nCode = nCode.replace(thisFieldReg, "$1.<span class='hl-code-field'>$2</span>");
        //
        //
        //
        // //高亮单行注释
        // //形式//
        // let singleCommentReg = /\/\/(.*)/g;
        // if (singleCommentReg.test(nCode)) {
        //     //获取注释的字串
        //     nCode = nCode.substring(0, nCode.indexOf("//")) + getTrimedHtml(nCode.substring(nCode.indexOf("//")));
        //     nCode = nCode.replace(singleCommentReg, "<span class='hl-code-one-line-comment'>//$1</span>");
        //     return indentEle + nCode;
        // }
        //
        // //加入开头的缩进
        // nCode = indentEle + nCode;
        // return (nCode == null || nCode.length === 0) ? rawCode : nCode;
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




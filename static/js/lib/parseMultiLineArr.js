/**
 * 解析Mardown代码块
 * 注意：防止xml被解析！需要转义 > <
 */
function parseMultiLineArr(arr, isMultiLine) {
    let codeParse = new MultiLineParser(arr, isMultiLine);
    return codeParse.getCodeEle();
}

function parseBlock(arr) {
    let blockParser = new BlockParser(arr);
    return blockParser.getBlockEle();
}

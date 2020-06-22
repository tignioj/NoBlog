window.addEventListener('load', function (e) {
    let xhr = getXMLHttp();
    xhr.open('GET', 'posts.json');
    xhr.send(null);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let loadingEle = document.getElementById("loading");
            loadingEle.parentElement.removeChild(loadingEle);
            window.articles = JSON.parse(xhr.responseText)
            loadDocuments(window.articles);
        } else {
            document.getElementById("loading").innerText = "网络出错了.."
        }
    }
    /**
     * 存放每个header的高度
     * 用途: 页面滚动时查询该高度的元素
     * @type {Map<number, Node>}
     */
    document.getElementById("back-to-top-btn").addEventListener("click", function () {
        scrolltotop();
    });


    initsearch();
    scrollToLastTime();

});


function initsearch() {
    let searchInput = document.getElementById("searchInput");
    searchInput.addEventListener('keyup', function (e) {
        document.getElementById("articles").innerHTML = "";
        let arr = window.articles.articles.list;
        let value = searchInput.value;
        console.log(value);
        let newArr = [];
        if (value.trim().length > 0) {
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].title.indexOf(value) !== -1 || arr[i].summary.indexOf(value) !== -1) {
                    newArr.push(arr[i]);
                }
            }
            if (newArr.length === 0) {
                document.getElementById("articles").innerText = "没有结果"
            } else {
                loadDocumentByArray(newArr);
            }
        } else {
            loadDocumentByArray(arr);
        }
    })
}

//回到顶部
function scrollToLastTime() {
    // let currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
    let lastTimeScroll = sessionStorage.getItem('lastTimeScroll');
    if (lastTimeScroll != null) {
        console.log("scrollTo:" + parseInt(lastTimeScroll));
        setTimeout(function () {
            scrollTo(0, parseInt(lastTimeScroll));
        }, 50)
    }
}

window.addEventListener('scroll', function () {
    //当处于顶部时，隐藏“回到顶部”按钮
    if (window.pageYOffset > 50) {
        document.getElementById("back-to-top-btn").style.bottom = "20px";
    } else {
        document.getElementById("back-to-top-btn").style.bottom = "-90px";
    }

    sessionStorage.setItem('lastTimeScroll', window.pageYOffset + "");
})


/**
 * 加载文章数组
 * @param arr
 */
function loadDocumentByArray(arr) {
    for (let i = 0; i < arr.length; i++) {
        let obj = arr[i];
        let div = document.createElement("div");

        let title = document.createElement("h1");
        let title_a = document.createElement("a");
        let title_a_span = document.createElement("span");

        title.classList.add("title");
        let createDate = document.createElement("span");
        createDate.classList.add("create_date")
        let summary = document.createElement("p");
        summary.classList.add("summary")

        summary.appendChild(document.createTextNode(obj.summary));
        createDate.appendChild(document.createTextNode(obj.create_time));
        title_a_span.appendChild(document.createTextNode(obj.title));
        title_a.appendChild(title_a_span)
        title_a.setAttribute('href', "./article.html?id=" + obj.id);
        //记住当前位置
        title_a.addEventListener('click', function () {
            sessionStorage.setItem('lastTimeScroll', window.pageYOffset + "");
        })


        title.appendChild(title_a);
        div.appendChild(createDate);
        div.appendChild(title);
        div.appendChild(summary);
        div.classList.add("article");
        document.getElementById("articles").appendChild(div);
    }
}

function loadDocuments(jsonObj) {
    if (jsonObj.articles.list.length > 0) {
        loadDocumentByArray(jsonObj.articles.list)
    } else {
        document.getElementById("articles").innerHTML = "你好像还没有文章哦"
    }

}
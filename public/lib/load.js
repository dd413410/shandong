layui.define(['urls', 'jquery'], function (exports) {
    var http = layui.urls.http,
    $=layui.jquery;

    var load = {
        is: true,
        url: null,
        down: function (url,met,data) {
            if (load.is) {
                load.is = false;
                setTimeout(function () {
                    load.is = true;
                }, 2000);
                http({
                    url: url,
                    type: met,
                    data: data,
                    success: function (res) {
                        load.url = res.url;
                        var dom = "<a href='" + load.url + "' id='dom' targe='_blank' style='display: none'></a>";
                        $("body").append(dom);
                        var dom = document.getElementById("dom");
                        dom.addEventListener("click", load.Fn, false);
                        dom.click();
                        dom.remove();
                        dom.removeEventListener("click", load.Fn);
                    }
                });
            };
        },
        Fn: function () {
            // 删除报表,下载完成之后删除,要不然数据库表很多
            http({
                url: 'del',
                type: 'post',
                data: {
                    url: load.url
                }
            });
        }
    };
    exports('load', load)
});
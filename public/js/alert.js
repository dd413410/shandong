layui.define(function (e) {
    layui.use(["urls", "form", "laypage"], function () {
        var http = layui.urls.http,
            url = layui.urls.url,
            $ = layui.$,
            lay = layui.layer,
            layForm = layui.form,
            laypage = layui.laypage;
        var page = 1,
            val = "";
        function siteListFn() {
            http({
                url: url.sites,
                type: 'post',
                data: {
                    type: "浮标"
                },
                success: function (res) {
                    var site = res.site;
                    var str = '<option value="">全部</option>';
                    for (var s = 0; s < site.length; s++) {
                        var siteItem = site[s];
                        str += '<option value="' + siteItem.name + '">' + siteItem.name + '</option>';
                    };
                    $("#site").html(str);
                    layForm.render("select");
                    alrFn();
                }
            });
        }
        siteListFn();
        function alrFn() {
            http({
                url: url.alarm,
                type: 'get',
                data: {
                    pageNum: page,
                    name: val,
                },
                success: function (res) {
                    var data = res.data;
                    var count = res.count;
                    $("#count").html(count);
                    count > 10 ? $("#pag").show() : $("#pag").hide();
                    $("#tbody").empty();
                    for (var i = 0; i < data.length; i++) {
                        var dataItem = data[i].fields;
                        var str = '<div class="layui-col-xs3">' + dataItem.station + '</div>' +
                            '<div class="layui-col-xs3">' + dataItem.Time + '</div>' +
                            '<div class="layui-col-xs3">' + dataItem.element + '</div>' +
                            '<div class="layui-col-xs3">' + dataItem.value + '</div>';
                        $("#tbody").append(str);
                    };
                    laypage.render({
                        elem: "pag",
                        count: count,
                        curr: page,
                        theme: "#5a98de",
                        jump: function (obj, is) {
                            if (!is) {
                                page = obj.curr;
                                alrFn();
                            }
                        },
                    });
                }
            })
        };
       

        $("#sear").click(function () {
            page = 1;
            val = $("#site").val();
            alrFn();
        });
        $('#close').click(function () {
            var index = parent.layer.getFrameIndex(window.name)
            parent.layer.close(index);
        });

    });
    e("alert", {})
});
layui.define(function (e) {
    layui.use(["urls", "form", "laypage"], function () {

        var http = layui.urls.http,
            url = layui.urls.url,
            $ = layui.$,
            lay = layui.layer,
            laypage = layui.laypage;


        var page = 1;
        function listFn() {
            http({
                url: url.receive,
                type: 'get',
                data: {
                    pageNum: page
                },
                success: function (res) {
                    $('#tbody').empty();
                    data = res.data.data;
                    var count = res.data.count;
                    $("#count").html(count);
                    count > 10 ? $('#pag').show() : $('#pag').hide();
                    for (var s = 0; s < data.length; s++) {
                        var dataItem = data[s].fields;
                        var str =
                            '<div class="layui-row tbody">' +
                            '<div title=\"' + dataItem.station + '\">' + dataItem.station + '</div>' +
                            '<div title=\"' + dataItem.station + '\">' + dataItem.Time + '</div>' +
                            '<div title=\"' + dataItem.stationCode + '\">' + dataItem.Type + '</div>' +
                            '</div>';
                        $('#tbody').append(str);
                    }
                    laypage.render({
                        elem: 'pag',
                        count: count,
                        curr: page,
                        theme: '#5a98de',
                        jump: function (obj, is) {
                            if (!is) {
                                page = obj.curr;
                                listFn();
                            }
                        }
                    });
                }
            });
        };
        listFn();

        $("#close").click(function () {
            var index = parent.layer.getFrameIndex(window.name)
            parent.layer.close(index);
        });
    });
    e("accept", {})
})
layui.define(function (e) {
    layui.use(["urls", "jquery"], function () {
        var http = layui.urls.http,
            url = layui.urls.url,
            $ = layui.jquery;



        var map = new BMap.Map("map");
        // map.centerAndZoom(new BMap.Point(116.404, 39.915), 15);
        map.enableScrollWheelZoom();
        var stage;
        function setFn() {
            http({
                url: url.radar,
                type: 'get',
                data: {},
                success: function (res) {
                    var data = res.data;
                    if (data.length > 0) {
                        stage = data[data.length - 1];
                        setFnc();
                    };
                }
            });
        };
        setFn();

        function setFnc() {
            http({
                url: url.radar,
                type: 'post',
                data: {
                    time: stage
                },
                success: function (res) {
                    var data = res.data;
                    var temp = [];
                    if (data.length > 1) {
                        for (var i = 0; i < data.length; i++) {
                            temp.push(
                                new BMap.Point(data[i][0], data[i][1])
                            )
                        };
                        map.centerAndZoom(new BMap.Point(data[0][0], data[0][1]), 15);
                        var polygon = new BMap.Polygon(temp, {
                            strokeColor: "#f29750",
                            strokeWeight: 2,
                            strokeOpacity: 0.5,
                            fillColor: "#f29750"
                        });
                        map.addOverlay(polygon);
                    };
                }
            });
        };
    });
    e("test", {})
});
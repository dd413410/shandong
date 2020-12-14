layui.define(function (e) {
    layui.use(["urls", "carousel", "form", "laydate", "upload"], function () {
        var http = layui.urls.http,
            url = layui.urls.url,
            carousel = layui.carousel,
            lay = layui.layer,
            $ = layui.$,
            layForm = layui.form,
            laydate = layui.laydate;


        var colArr = [
            "#f29750",
            "#C0C0C0",
            "#808080",
            "#ed98d6",
            "#0000FF",
            "#152636",
            "#843900",
            "#130c0e",
            "#4a4a4a",
            "#d2691e"
        ];
        var index = 0;


        var listData = [];
        var time = '';
        var idx = 0;
        var id = '';

        var map = new T.Map('map'),
            zoom = 11,
            polygon = null;
        map.centerAndZoom(new T.LngLat(121.7, 38), zoom);
        // function listFn() {
        window.listFn = function () {
            $("#preList").empty();
            idx = 0;
            http({
                url: url.yaogan,
                type: 'get',
                data: {},
                success: function (res) {
                    listData = res.data;
                    var str = '';
                    for (var i = 0; i < listData.length; i++) {
                        var dataItem = listData[i];
                        if (i == 0) {
                            var div = '<div class="add" title=\"' + dataItem.time + '\" id=' + dataItem.id + ' idx=' + i + '>';
                        } else {
                            var div = '<div title=\"' + dataItem.time + '\" id=' + dataItem.id + ' idx=' + i + '>';
                        };
                        if (i == 0 || i == 1) {
                            var p = '<p class="btn">' +
                                '<button class="layui-btn layui-btn-sm toRou">预测</button>' +
                                '</p>';
                        } else {
                            var p = '<p class="btn">' +
                                '<button class="layui-btn layui-btn-sm dele">删除</button>' +
                                '<button class="layui-btn layui-btn-sm toRou">预测</button>' +
                                '</p>';
                        };
                        str += div +
                            '<p class="name">' + dataItem.name + '</p>' +
                            '<p class="time">' + dataItem.time + '</p>' +
                            '<p class="href"><a href=' + dataItem.doc + ' target="_blank">下载快报</a></p>' + p + '</div>';
                    };
                    $("#preList").html(str);
                    if (listData.length > 0) {
                        time = listData[0].time;
                        id = listData[0].id;
                        setFn();
                    };
                    $(".tips").hide();
                    setTimFn();
                }
            })
        };
        listFn();
        // 监听数据是否更新
        var setTim = null;
        function setTimFn() {
            http({
                url: url.monitor,
                type: 'get',
                data: {},
                success: function (res) {
                    var code = res.code;
                    if (code == 1) {
                        $(".tips").show();
                    }
                },
                complete: function (r) {
                    setTim = setTimeout(setTimFn, 10000);
                }
            })
        };
        $("#preList").on("click", "div", function () {
            time = $(this).attr('title');
            idx = $(this).attr('idx');
            id = $(this).attr('id');
            $("#preList").find("div").removeClass("add");
            $(this).addClass("add");
            map.clearOverLays();
            setFn();
        });
        $("#icon").click(function () {
            $("#switch").animate({ "right": -500 }, 500);
            $(".film").animate({ "right": 0 }, 500);
        });
        $("#icons").click(function () {
            $("#switch").animate({ "right": 0 }, 500);
            $(".film").animate({ "right": 500 }, 500);
        });
        $("#switch").on("click", ".toRou", function () {
            sessionStorage.is = time;
            sessionStorage.id = id;
            var base = layui.urls.base;
            var u = base + 'view/home.html';
            window.top.location.href = u;
        });
        $("#switch").on("click", ".dele", function () {
            var infoMsg = lay.msg('此操作将永久删除该案例, 是否继续?', {
                time: 10000,
                shade: 0.5,
                btn: ['确定', '取消'],
                yes: function () {
                    http({
                        url: url.dyaogan,
                        type: 'post',
                        data: {
                            id: id
                        },
                        success: function (res) {
                            lay.msg('删除成功！');
                            lay.close(infoMsg);
                            listFn();
                        }
                    });
                },
                btn2: function () {
                    lay.msg('已取消删除!');
                }
            });
        });

        window.imgAlrFn = function () {
            layer.photos({
                photos: "#carousel",
                anim: 5
            })
        };
        var polArr = [];
        function setFn() {
            var imgData = listData[idx].url;
            var str = '';
            for (var m = 0; m < imgData.length; m++) {
                str += '<div><img src=' + imgData[m] + ' onclick="imgAlrFn()"/></div>';
            };
            $("#rota").html('<div carousel-item id="carousel">' + str + '</div>');
            carousel.render({
                elem: '#rota',
                width: '400px',
                height: '300px',
                interval: 3000
            });
            http({
                url: url.yaogan,
                type: 'post',
                data: {
                    time: time,
                    id: id
                },
                success: function (res) {
                    polArr = res.code;
                    index = res.level;
                    layForm.val('film', {
                        "color": index,
                        "thick": index
                    });
                    var c = map.getViewport(polArr);
                    var lat = c.center.lat;
                    var lng = c.center.lng;
                    map.centerAndZoom(new T.LngLat(lat, lng), zoom);
                    addPolFn();
                }
            });
        };
        // 绘制溢油面
        function addPolFn() {
            var points = [];
            for (var i = 0; i < polArr.length; i++) {
                var tempItem = polArr[i];
                points.push(new T.LngLat(tempItem[0], tempItem[1]))
            };
            polygon = new T.Polygon(points, {
                color: colArr[index],
                weight: 3,
                opacity: 1,
                fillColor: colArr[index],
                fillOpacity: 1
            });
            map.addOverLay(polygon);
            // polygon.addEventListener("click", getSiteFn);
        };
        // 油膜颜色
        layForm.on('select(color)', function (data) {
            var val = data.value;
            layForm.val('film', {
                "thick": val
            });
            return false;
        });
        // 油膜厚度
        layForm.on('select(thick)', function (data) {
            var val = data.value;
            layForm.val('film', {
                "color": val
            });
            return false;
        });
        layForm.on('submit(subBtn)', function (data) {
            // 发请求
            index = data.field.thick;
            http({
                url: url.cyan,
                type: 'post',
                data: {
                    type: 2,
                    id: id,
                    level: index
                },
                success: function (res) {
                    lay.msg("设置成功!")
                    if (polygon) {
                        map.removeOverLay(polygon);
                        addPolFn();
                    };
                }
            });
            return false;
        });
        window.onunload = function () {
            window.clearTimeout(setTim);
        }
        window.reloadFn = function () {
            window.location.reload();
        };
    });
    e("monit", {})
});
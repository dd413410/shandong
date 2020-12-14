layui.define(function (e) {
    layui.use(["urls"], function () {
        var http = layui.urls.http,
            url = layui.urls.url,
            $ = layui.$,
            lay = layui.layer;


        var map = new T.Map('map');
        var zoom = 8;
        map.setMaxZoom(14);
        map.centerAndZoom(new T.LngLat(121.7, 38), zoom);


        var data = [];



        var subId;
        function analListFn() {
            http({
                url: url.lst,
                type: 'get',
                data: {},
                success: function (res) {
                    $("#preList").empty();
                    data = res.data;
                    var str = '';
                    for (var i = 0; i < data.length; i++) {
                        var dataItem = data[i].fields;
                        var type = dataItem.Type;
                        var tips = '';
                        if (type == 1) {
                            tips = 'SAR、光学、高光谱';
                        } else if (type == 2) {
                            tips = 'X波段、光学';
                        } else {
                            tips = '光学、高光谱';
                        };
                        str += '<div id=' + data[i].pk + ' type=' + type + '>' +
                            '<p class="site" title=' + dataItem.Name + '>' + dataItem.Name + '</p>' +
                            '<p class="type" title=' + tips + '>' + tips + '</p>' +
                            // '<p class="conf" title=' + dataItem.Kxd + '>置信度:' + dataItem.Kxd + '</p>' +
                            '<p class="btn"><button class="layui-btn layui-btn-sm dele" dl=' + data[i].pk + '>删除</button></p>' +
                            '</div>';
                        $("#preList").html(str);
                    };
                }
            })
        };
        analListFn();
        var type = '';

        var zxd = "";
        $("#preList").on("click", "div", function () {
            subId = $(this).attr('id');
            type = $(this).attr('type');
            $(".alr_box").hide();
            $("#show").hide();
            $("#preList").find("div").removeClass("add");
            $(this).addClass("add");
            getDataFn();

            for (var d = 0; d < data.length; d++) {
                var dataItem = data[d];
                if (subId == dataItem.pk) {
                    zxd = dataItem.fields.Kxd;
                }
            }

        });
        // 删除
        $("#preList").on("click", ".dele", function (e) {
            var dl = $(this).attr('dl');
            var infoMsg = lay.msg('此操作将永久删除该案例, 是否继续?', {
                time: 10000,
                shade: 0.5,
                btn: ['确定', '取消'],
                yes: function () {
                    http({
                        url: url.rmrh,
                        type: 'post',
                        data: {
                            id: dl
                        },
                        success: function (res) {
                            lay.msg('删除成功！');
                            lay.close(infoMsg);
                            if (dl == subId) {
                                map.clearOverLays();
                                $(".alr_box").hide();
                            };
                            analListFn();
                        }
                    });
                },
                btn2: function () {
                    lay.msg('已取消删除!');
                }
            });
            e.stopPropagation();
        });

        $("#icon").click(function () {
            $("#switch").animate({ "right": -400 }, 500);
        });
        $("#icons").click(function () {
            $("#switch").animate({ "right": 0 }, 500);
        });
        var pol_a = [],
            pol_b = [],
            pol_c = [],
            pol_d = [];
        function getDataFn() {
            http({
                url: url.an,
                type: 'get',
                data: {
                    id: subId
                },
                success: function (res) {
                    console.log(res)
                    map.clearOverLays();
                    pol_a = res.sar;
                    pol_b = res.xbd;
                    pol_c = res.gx;
                    pol_d = res.ggp;
                    if (pol_a.length > 0) {
                        sarPolFn(res.sarF);
                    }
                    if (pol_b.length > 0) {
                        xbdPolFn(res.xbdF);
                    }
                    if (pol_c.length > 0) {
                        wxPolFn(res.gxF);
                    }
                    if (pol_d.length > 0) {
                        ggpPolFn(res.ggpF);
                    }

                    var tips = "";
                    if (type == 1) {
                        tips = "SAR、光学、高光谱:" + res.area + ";<span>置信度:<span style='color:#FFFF00;'>" + zxd + "</span>!</span>";
                    } else if (type == 2) {
                        tips = "X波段、光学:" + res.area + ";<span>置信度:<span style='color:#FFFF00;'>" + zxd + "</span>!</span>";
                    } else {
                        tips = "光学、高光谱:" + res.area + ";<span>置信度:<span style='color:#FFFF00;'>" + zxd + "</span>!</span>";
                    };

                    $("#text").html(tips);
                    $(".alr_box").show();

                    
                    setZxFn();
                    
                }
            })
        };

        // 获取中心点
        function setZxFn() {
            var temp = pol_a.concat(pol_b).concat(pol_c).concat(pol_d);
            var arr=[];
            for(var c=0;c<temp.length;c++){
                var x=temp[c];
                arr.push(new T.LngLat(x[0],x[1]));
            };
           map.setViewport(arr);
        };


        //绘制sar面
        function sarPolFn(file) {
            var points = [];
            for (var i = 0; i < pol_a.length; i++) {
                var tempItem = pol_a[i];
                points.push(new T.LngLat(tempItem[0], tempItem[1]))
            };
            var polygon = new T.Polygon(points, {
                color: "#f29750",
                weight: 1,
                opacity: 0.5,
                fillColor: "#f29750",
                fillOpacity: 0.5,
            });
            map.addOverLay(polygon);

            var lab = pol_a[pol_a.length - 1];
            var latlng = new T.LngLat(lab[0], lab[1]);
            var label = new T.Label({
                text: file,
                position: latlng,
                offset: new T.Point(-9, -20)
            });
            map.addOverLay(label);


        };
        //绘制X波段面
        function xbdPolFn(file) {
            var points = [];
            for (var i = 0; i < pol_b.length; i++) {
                var tempItem = pol_b[i];
                points.push(new T.LngLat(tempItem[0], tempItem[1]))
            };
            var polygon = new T.Polygon(points, {
                color: "#003a6c",
                weight: 1,
                opacity: 0.5,
                fillColor: "#003a6c",
                fillOpacity: 0.5,
            });
            map.addOverLay(polygon);

            var lab = pol_b[pol_b.length - 1];
            var latlng = new T.LngLat(lab[0], lab[1]);
            var label = new T.Label({
                text: file,
                position: latlng,
                offset: new T.Point(-9, -20)
            });
            map.addOverLay(label);
        };
        //绘制光学面
        function wxPolFn(file) {
            var points = [];
            for (var i = 0; i < pol_c.length; i++) {
                var tempItem = pol_c[i];
                points.push(new T.LngLat(tempItem[0], tempItem[1]))
            };
            var polygon = new T.Polygon(points, {
                color: "#b54334",
                weight: 1,
                opacity: 0.5,
                fillColor: "#b54334",
                fillOpacity: 0.5,
            });
            map.addOverLay(polygon);

            var lab = pol_c[pol_c.length - 1];
            var latlng = new T.LngLat(lab[0], lab[1]);
            var label = new T.Label({
                text: file,
                position: latlng,
                offset: new T.Point(-9, -20)
            });
            map.addOverLay(label);
        };
        //绘制高光谱面
        function ggpPolFn(file) {
            var points = [];
            for (var i = 0; i < pol_d.length; i++) {
                var tempItem = pol_d[i];
                points.push(new T.LngLat(tempItem[0], tempItem[1]))
            };
            var polygon = new T.Polygon(points, {
                color: "#8e7437",
                weight: 1,
                opacity: 0.5,
                fillColor: "#8e7437",
                fillOpacity: 0.5,
            });
            map.addOverLay(polygon);

            var lab = pol_d[pol_d.length - 1];
            var latlng = new T.LngLat(lab[0], lab[1]);
            var label = new T.Label({
                text: file,
                position: latlng,
                offset: new T.Point(-9, -20)
            });
            map.addOverLay(label);
        };


        $("#hide").click(function () {
            $(".alr_box").hide();
            $("#show").show();
        });


        $("#show").click(function () {
            $(".alr_box").show();
            $("#show").hide();
        });






    });
    e("fuses", {});
});
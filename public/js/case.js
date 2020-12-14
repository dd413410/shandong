layui.define(function (e) {
    layui.use(["urls"], function () {
        var http = layui.urls.http,
            url = layui.urls.url,
            lay = layui.layer,
            $ = layui.$;

        var dateChart = echarts.init(document.getElementById('dateAxis'));
        var temps = [];
        function initAxisFn(data) {
            temps = [];
            for (var d = 0; d < data.length; d++) {
                var label = (d + 1) < 10 ? "0" + (d + 1) : (d + 1);
                var timeItem = data[d];
                temps.push({
                    value: label,
                    id: timeItem.id,
                    time: timeItem.time
                });
            };
            var option = {
                grid: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                },
                timeline: {
                    axisType: 'category',
                    data: temps,
                    left: 10,
                    right: 10,
                    bottom: 0,
                    label: {
                        color: '#fff',
                        interval: 0,
                        clickable: true,
                        rotate: 45,
                        interval: 2
                    },
                    checkpointStyle: {
                        color: '#1b84d2',
                        borderColor: '#1b84d2'
                    },
                    itemStyle: {
                        color: '#d37540',
                        borderColor: '#d37540'
                    },
                    controlStyle: {
                        show: false
                    },
                    currentIndex: 0
                },
            };
            dateChart.setOption(option);
            dateChart.on('timelinechanged', function (e) {
                var idx = e.currentIndex;
                changeFn(idx);
            });
        };
        //时间轴改变,触发该函数
        function changeFn(idx) {
            if (idx < num) {
                if (isPlay) {
                    window.clearInterval(setTiOut);
                };
                for (var c = idx; c < polArr.length; c++) {
                    map.removeOverLay(polArr[c]);
                };
                num = idx;
                polId=null;
                setFnc();
            } else {
                dateChart.setOption({
                    timeline: {
                        currentIndex: num
                    }
                });
            }
        };

        
        // 播放
        var isPlay = true;
        window.playFn = function () {
            if (num == lgt) {
                lay.msg("已播放完毕!")
            } else {
                isPlay = true;
                setFnc();
                // setTiOut = setTimeout(setFnc, 1000);
                $("#play").hide();
                $("#pause").show();
            };
        };
        //暂停
        window.pauseFn = function () {
            window.clearInterval(setTiOut);
            $("#pause").hide();
            $("#play").show();
            isPlay = false;
        };
        // 获取右侧列表
        function preListFn() {
            http({
                url: url.yuce,
                type: 'get',
                data: {},
                success: function (res) {
                    var data = res.data;
                    $("#preList").empty();
                    var str = '';
                    for (var i = 0; i < data.length; i++) {
                        var dataItem = data[i];
                        str += '<div id=' + dataItem.id + '>' +
                            '<p>' + dataItem.name + '</p>' +
                            '<p>' + dataItem.time + '</p>' +
                            '<p><button class="layui-btn layui-btn-sm dele" dl=' + dataItem.id + '>删除</button></p>' +
                            '</div>';
                    };
                    $("#preList").html(str);
                }
            })
        };
        preListFn();
        var lgt = null;
        var deg = [];
        var map = new T.Map('map');
        map.centerAndZoom(new T.LngLat(121, 37), 8);
        // 绘制轴
        var axisId = null;
        var polId = null;

        function getDataFn() {
            http({
                url: url.yuce,
                type: 'post',
                data: {
                    id: axisId
                },
                success: function (res) {
                    map.clearOverLays();
                    deg = res.data;
                    lgt = deg.length;
                    // 绘制时间轴
                    $("#dateAxis").show();
                    initAxisFn(deg);
                    $("#axis").show();
                    $("#pause").show();
                    $("#play").hide();

                    if (lgt <= 0) {
                        clearTiOutFn();
                        return false;
                    };
                    setZxFn();
                    labFn();
                    setFnc();
                }
            })
        };
        function setZxFn(){
            var arr=[];
            for(var c=0;c<deg.length;c++){
                var x=deg[c];
                arr.push(new T.LngLat(x.lon,x.lat));
            };
           map.setViewport(arr);
        };

        //添加时间
        function labFn() {
            var labArr = [];
            labArr.push(deg[0]);
            for (var c = 1; c < deg.length - 1; c++) {
                if (c % 2 == 0) {
                    labArr.push(deg[c]);
                }
            };
            labArr.push(deg[deg.length - 1]);
            for (var x = 0; x < labArr.length; x++) {
                var labItem = labArr[x];
                var latlng = new T.LngLat(labItem.lon, labItem.lat);
                var lab = new T.Label({
                    position: latlng,
                    offset: new T.Point(0, 0)
                });
                if (x == 0) {
                    lab.setLabel('<div class="ks">始</div>');
                    // lab.setFontSize(20);
                    // lab.setFontColor("#33CC00");
                    map.addOverLay(lab);
                } else {
                    lab.setLabel('<div class="tm">'+labItem.time+'</div>');
                    lab.setFontColor("#fff");
                    map.addOverLay(lab);
                };
            }
        };
        var num = 0;
        var setTiOut = null;
        function setTiOutFn() {
            window.clearInterval(setTiOut);
            setTiOut = setTimeout(setFnc, 1000);
        };
        function clearTiOutFn() {
            window.clearInterval(setTiOut);
            num = 0;
        };

        // 获取面信息
        function setFnc() {
            if (num <= lgt - 1) {
                polId = deg[num].id;
                http({
                    url: url.face,
                    type: 'post',
                    data: {
                        id: polId,
                        old: polId
                    },
                    success: function (res) {
                        if (res.data.length <= 0) {
                            clearTiOutFn();
                            return false;
                        }
                        drawLineFn(res);
                    }
                })
            } else {
                map.removeOverLay(polygon);
                map.removeOverLay(circle);
                var point = [];
                for (var r = 0; r < deg.length; r++) {
                    nameId = deg[0].time;
                    var regItem = deg[r];
                    point.push(new T.LngLat(regItem.lon, regItem.lat));
                    var icon = {
                        color: "#800080",
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 1,
                        lineStyle: "solid"
                    }
                    circle = new T.Circle(new T.LngLat(regItem.lon, regItem.lat), 100, icon);
                    map.addOverLay(circle);
                    addInFn(circle, regItem);
                };
                isPlay = false;
                $("#pause").hide();
                $("#play").show();
            }
        };

        // 绘制面
        var circle = null;
        var line = null;
        var polygon = null;

        // 记录面
        var polArr = [];
        // 自动播放的绘制
        function drawLineFn(res) {
            var old = res.old;
            var pol = [];
            for (var i = 0; i < old.length; i++) {
                var oldItem = old[i];
                pol.push(new T.LngLat(oldItem[0], oldItem[1]))
            };
            var tempmaxpol = new T.Polygon(pol, {
                color: "#dac9ae",
                weight: 3,
                opacity: 1,
                fillColor: "#dac9ae",
                fillOpacity: 1
            });
            map.addOverLay(tempmaxpol);
            //绘制面记录,用以清除
            polArr[num] = tempmaxpol;
            //绘制新面
            if (polygon) {
                map.removeOverLay(polygon);
                polygon = null;
            };
            var temp = res.data;
            var points = [];
            for (var i = 0; i < temp.length; i++) {
                var tempItem = temp[i];
                points.push(new T.LngLat(tempItem[0], tempItem[1]));
            };
            polygon = new T.Polygon(points, {
                color: "#f29750",
                weight: 3,
                opacity: 1,
                fillColor: "#f29750",
                fillOpacity: 1
            });
            map.addOverLay(polygon);

            // 绘制点
            var point = [];
            for (var r = 0; r < deg.length; r++) {
                nameId = deg[0].time;
                var regItem = deg[r];
                point.push(new T.LngLat(regItem.lon, regItem.lat));
                var icon = {
                    color: "#800080",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 1,
                    lineStyle: "solid"
                }
                if (num == r) {
                    icon.color = "#33CC00";
                } else {
                    icon.color = "#800080";
                };
                circle = new T.Circle(new T.LngLat(regItem.lon, regItem.lat), 100, icon);
                map.addOverLay(circle);
                addInFn(circle, regItem);
            };
            // 绘制线
            var lineconfig = {
                color: "#800080",
                weight: 1,
                opacity: 1,
                lineStyle: "solid",
                fillColor: "#800080"
            };
            line = new T.Polyline(point, lineconfig);
            map.addOverLay(line);

            dateChart.setOption({
                timeline: {
                    currentIndex: num
                }
            });
            if (isPlay) {
                num++;
                setTiOutFn();
            };
        };
        //鼠标移入添加提示信息
        var infoWin = null;
        var setInfoOut = null;
        function addInFn(dom, item) {
            dom.addEventListener("mouseover", function (e) {
                removeInFn();
                var point = e.lnglat;
                var htm = '<div>' + item.time + '</div>';
                infoWin = new T.InfoWindow();
                infoWin.setLngLat(point);
                infoWin.setOffset(new T.Point(0, -10));
                infoWin.setContent(htm);
                infoWin.closeOnClick = true;
                map.addOverLay(infoWin);
                setInfoOut = setTimeout(removeInFn, 5000);
            })
        };
        //移除信息框
        function removeInFn() {
            window.clearTimeout(setInfoOut);
            if (infoWin) {
                map.removeOverLay(infoWin);
            }
        };
        $("#preList").on("click", "div", function () {
            axisId = $(this).attr('id');
            isPlay = true;
            oid = [];
            $("#preList").find("div").removeClass("add");
            $(this).addClass("add");
            clearTiOutFn();
            getDataFn();
        });
        $("#icon").click(function () {
            $("#switch").animate({ "right": -360 }, 500);
        });
        $("#icons").click(function () {
            $("#switch").animate({ "right": 0 }, 500);
        });
        $("#preList").on("click", ".dele", function (e) {
            var dl = $(this).attr('dl');
            var infoMsg = lay.msg('此操作将永久删除该案例, 是否继续?', {
                time: 10000,
                shade: 0.5,
                btn: ['确定', '取消'],
                yes: function () {
                    http({
                        url: url.rmyu,
                        type: 'post',
                        data: {
                            id: dl
                        },
                        success: function (res) {
                            lay.msg('删除成功！');
                            lay.close(infoMsg);
                            if (dl == axisId) {
                                clearTiOutFn();
                                oid = [];
                                map.clearOverLays();
                                $("#dateAxis").hide();
                            };
                            preListFn();
                        }
                    });
                },
                btn2: function () {
                    lay.msg('已取消删除!');
                }
            });
            e.stopPropagation();
        });
        window.closeFn = function () {
            $("#alrBox").hide();
        };
        window.reloadFn = function () {
            window.location.reload();
        };
    });
    e("case", {})
});
layui.define(function (e) {
    layui.use(["urls", "form", "laydate", "upload", "carousel"], function () {
        var http = layui.urls.http,
            url = layui.urls.url,
            lay = layui.layer,
            $ = layui.$,
            layForm = layui.form,
            laydate = layui.laydate,
            carousel = layui.carousel;

        var map = new T.Map('map'),
            zoom = 8;
        map.centerAndZoom(new T.LngLat(121.7, 38), zoom);

        // sessionStorage.is="2017-07-06 17:47";

        var time = sessionStorage.is;
        var id = sessionStorage.id;
        // if (id == 0 || id == 1) {
        //     $("#back").hide();
        // };
        console.log(id)
        if (id == 1 || id == 2) {
            $("#back").show();
        } else {
            $("#back").hide();

        };

        if (!time) {
            $("#tips").show();
            return false;
        } else {
            $("#date").val(time);
            $("#mask").show();
            setFn();
        };
        layForm.on('submit(addBtn)', function (data) {
            $("#upbtn").click();
            return false;
        });
        window.closeFn = function () {
            $("#mask").hide();
        };
        window.imgAlrFn = function () {
            layer.photos({
                photos: "#carousel",
                anim: 5,
                area: ['1200px', '750px']
            })
        };
        var polyArr = [];
        function setFn() {
            http({
                url: url.yaogan,
                type: 'post',
                data: {
                    time: time,
                    id: id
                },
                success: function (res) {
                    var temp = res.code;
                    var c = map.getViewport(temp);
                    var lat = c.center.lat;
                    var lng = c.center.lng;
                    zoom = c.zoom > 14 ? 14 : c.zoom;
                    map.centerAndZoom(new T.LngLat(lat, lng), zoom);
                    var points = [];
                    for (var i = 0; i < temp.length; i++) {
                        var tempItem = temp[i];
                        points.push(new T.LngLat(tempItem[0], tempItem[1]));
                        polyArr.push({
                            lon: tempItem[0],
                            lat: tempItem[1]
                        });
                    };
                    polygon = new T.Polygon(points, {
                        color: "#f29750",
                        weight: 3,
                        opacity: 1,
                        fillColor: "#f29750",
                        fillOpacity: 1
                    });
                    map.addOverLay(polygon);
                    // polygon.addEventListener("click", getSiteFn);
                    // polygon.addEventListener("dblclick", function () {
                    //     $("#mask").show();
                    // });
                }
            });

        };


        /*
            @@@正则验证
        */
        layForm.verify({
            nm: function (val) {
                if (!val) {
                    return '请输入溢油名称';
                }
            },
            sm: function (val) {
                if (!val) {
                    return '请输入模拟名称';
                }
            },
            oildensity: function (val) {
                if (!val) {
                    return '请输入油密度';
                }
            },
            oiltotal: function (val) {
                if (!val) {
                    return '请输入溢油总量';
                }
            },
            starttime: function (val) {
                if (!val) {
                    return '请选择开始日期';
                }
            }
        });
        var isClick = true;
        var index;

        var axisId = null;
        var polId = null;

        var click = "";
        layForm.on('submit(submitbtn)', function (data) {
            var data = data.field;
            data.id = id;
            click = 1;
            setloadFn(data);

            // if(id==1||id==2){

            // }
            return false;
        });
        layForm.on('submit(subback)', function (data) {
            var data = data.field;
            data.id = id;
            click = 2;
            setloadFn(data);
            return false;
        });

        function setloadFn(data) {
            // data.polyArr
            data.oilpoints = JSON.stringify(polyArr);
            if (isClick) {
                isClick = false;
                setTimeout(function () {
                    isClick = true;
                }, 2000);
                http({
                    url: url.load,
                    type: 'get',
                    data: data,
                    beforeSend: function () {
                        if (id == 1 || id == 2) {
                            $(".tips").hide();
                        } else {
                            lay.msg("您的申请已提交，请等待漂移预测部门计算会商并反馈结果!");
                        };
                        index = layer.load(2, { shade: false });
                    },
                    success: function (res) {
                        $("#mask").hide();
                        layer.close(index);
                        axisId = res.data;
                        if (id == 1 || id == 2) {
                            $(".tips").hide();
                        } else {
                            setTimFn();
                            $(".tips").show();
                        }
                        getDataFn();
                    }
                });
            }
        };

        // 监听文件夹是否更新
        var setTim = null;
        function setTimFn() {
            http({
                url: url.monitor,
                type: 'post',
                data: {
                    id: axisId
                },
                success: function (res) {
                    if (res.code == -1) {
                        setTim = setTimeout(setTimFn, 10000);
                    } else {
                        $(".tips").hide();
                        $("#feed").show();
                        var data = res.data;
                        $("#load").attr("href", data.doc);
                        $("#xls").attr("href", data.xls);
                        var str = '<div carousel-item id="carousel">' +
                            '<div><img src="' + data.jpg + '" onclick="imgAlrFn()" /></div>' +
                            '</div>';
                        $("#rota").html(str);
                        carousel.render({
                            elem: '#rota',
                            width: '400px',
                            height: '300px',
                            interval: 3000
                        });
                    }
                }
            })
        };
        window.imgAlrFn = function () {
            layer.photos({
                photos: "#carousel",
                anim: 5,
            })
        };
        window.lookFn = function () {
            $("#feed").hide();
            $(".feed").show();
        };
        window.hideFn = function () {
            $(".feed").hide();
            $("#feed").show();
        };








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
            // return false;
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

        var lgt = null;
        var deg = [];
        function getDataFn() {
            http({
                url: url.yuce,
                type: 'post',
                data: {
                    id: axisId
                },
                success: function (res) {
                    if (click == 1) {
                        deg = res.data;
                    } else {
                        deg = res.data.reverse();
                    };
                    map.clearOverLays();
                    // deg = res.data;
                    lgt = deg.length;
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

        // 设置中心点
        function setZxFn() {
            var arr = [];
            for (var c = 0; c < deg.length; c++) {
                var x = deg[c];
                arr.push(new T.LngLat(x.lon, x.lat));
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
                    map.addOverLay(lab);
                } else {
                    lab.setLabel('<div class="tm">' + labItem.time + '</div>');
                    lab.setFontColor("#fff");
                    map.addOverLay(lab);
                };
            }
        };

        var num = 0;
        var setTiOut = null;
        function setTiOutFn() {
            window.clearInterval(setTiOut);
            setTiOut = setTimeout(setFnc, 1000)
        };
        function clearTiOutFn() {
            window.clearInterval(setTiOut);
            num = 0;
        }
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
                        drawLineFn(res)
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


        var circle = null;
        var line = null;
        var polygon = null;

        var polArr = [];
        function drawLineFn(res) {
            var old = res.old;
            var pol = [];
            for (var i = 0; i < old.length; i++) {
                var maxPolItem = old[i];
                pol.push(new T.LngLat(maxPolItem[0], maxPolItem[1]))
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
                points.push(new T.LngLat(tempItem[0], tempItem[1]))
            };
            polygon = new T.Polygon(points, {
                color: "#f29750",
                weight: 3,
                opacity: 1,
                fillColor: "#f29750",
                fillOpacity: 1
            });
            map.addOverLay(polygon);

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
        window.reloadFn = function () {
            window.location.reload();
        };
    });
    e("warn", {})
});
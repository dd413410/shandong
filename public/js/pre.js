layui.define(function (e) {
    layui.use(["urls", "form", "upload", "laydate", "carousel"], function () {
        var http = layui.urls.http,
            url = layui.urls.url,
            layForm = layui.form,
            lay = layui.layer,
            $ = layui.$,
            upload = layui.upload,
            laydate = layui.laydate,
            carousel = layui.carousel;


        // initMapFn();
        laydate.render({
            elem: '#date',
            type: 'datetime',
            format: 'yyyy-MM-dd HH:mm',
        });
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
                    console.log(c)
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
        var map = new T.Map('map');
        map.centerAndZoom(new T.LngLat(121.7, 38), 8);
        // 获取时间轴
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
            setTiOut = setTimeout(setFnc, 1000)
        };
        function clearTiOutFn() {
            window.clearInterval(setTiOut);
            num = 0;
        };
        // 获取每个点的面
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
        // 绘制面和圆点
        var circle = null;
        var line = null;
        var polygon = null;

        var tempPoly = null;
        // 记录面
        var polArr = [];
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
            // 绘制新面
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
        layForm.verify({
            nm: function (val) {
                if (!val) {
                    return '请输入名称';
                }
            },
            sm: function (val) {
                if (!val) {
                    return '请输入模拟名称';
                }
            },
            starttime: function (val) {
                if (!val) {
                    return '请选择开始日期';
                }
            },
            centerpoints: function (val) {
                if (!val) {
                    return '请选择中心点';
                }
            },
            names: function (val) {
                if (type == 1) {
                    if (!val) {
                        return '请上传shp文件';
                    }
                }
            }
        });

        var tempPol = [];//临时经纬度,上传shp后后台返回的经纬度集合
        // 绘制方式
        var type = 1;
        layForm.on('select(type)', function (data) {
            type = data.value;
            cleFn();
            if (type == 1) {
                $("#type").show();
                $("#types").hide();
            } else {
                $("#type").hide();
                $("#types").show();
            }
            return false;
        });
        // 清空面
        function cleFn() {
            map.clearOverLays();
            $("#spans").text('未绘制');
            polyArr = [];
            $("#names").val('');
            cenArr = [];
            $("#span").val('');
            tempPol = [];
        }
        // 地图绘面
        var polyArr = [];
        var Poly = new T.PolylineTool(map, { follow: true });
        $("#spotBtns").click(function () {
            $("#alrBox").hide();
            $("#spans").text('未绘制');
            if (tempPoly) {
                map.removeOverLay(tempPoly);
                tempPoly = null;
            };
            polyArr = [];
            tempPol = [];
            Poly.open();
            Poly.clear();
            Poly.addEventListener("draw", function (e) {
                var curr = e.currentLnglats;
                for (var c = 0; c < curr.length; c++) {
                    polyArr.push({
                        lon: curr[c].lng,
                        lat: curr[c].lat
                    });
                    tempPol.push([curr[c].lng, curr[c].lat]);
                };
                tempPolFn();
                $("#spans").text('已绘制');
                $("#alrBox").show();
            });
        });
        // 上传shp文件
        var loading;
        upload.render({
            elem: '#updata',
            accept: 'file',
            acceptMime: ".shp",
            exts: 'shp',
            field: 'file',
            url: url.up,
            choose: function (obj) {
                obj.preview(function (index, file, result) {
                    $("#names").val(file.name);
                    $("#names").attr("title", file.name);
                });
            },
            before: function (c) {
                loading = layer.load(1, {
                    shade: [0.1, '#fff']
                });
            },
            done: function (res) {
                tempPol = res.data;
                layer.close(loading);
                tempPolFn();
            },
            error: function () {
                layer.close(loading);
                lay.msg('提交shp文件失败!');
            }
        });
        // 上传shp后解析成面
        function tempPolFn() {
            var points = [];
            for (var i = 0; i < tempPol.length; i++) {
                var tempItem = tempPol[i];
                points.push(new T.LngLat(tempItem[0], tempItem[1]))
            };
            tempPoly = new T.Polygon(points, {
                color: "#f29750",
                weight: 3,
                opacity: 1,
                fillColor: "#f29750",
                fillOpacity: 1
            });
            map.addOverLay(tempPoly);
        };
        // 添加中心点
        var center;
        var cenArr = [];
        var markerTool = new T.MarkTool(map, { follow: true });
        $("#spotBtn").click(function () {
            if (type == 1) {
                var val = $("#names").val();
                if (!val) {
                    lay.msg('请先上传shp文件!')
                    return false;
                }
            } else {
                if (polyArr.length <= 0) {
                    lay.msg('请先绘制面!')
                    return false;
                };
            };
            markerTool.open();
            markerTool.clear();
            $("#alrBox").hide();
            markerTool.addEventListener("mouseup", function (e) {
                center = e.currentLnglat;
                cenArr = [{
                    lon: center.lng,
                    lat: center.lat
                }];
                $("#span").val(center.lng + ',' + center.lat);
                $("#alrBox").show();
            });
        });
        // 提交按钮
        var upData = null;
        layForm.on('submit(addBtn)', function (data) {
            upData = data.field;
            var type = upData.type;
            delete upData.file;
            if (type == 1) {
                var temp = [];
                for (var i = 0; i < tempPol.length; i++) {
                    temp.push({
                        lon: tempPol[i][0],
                        lat: tempPol[i][1]
                    })
                }
                upData.oilpoints = JSON.stringify(temp);
            } else {
                if (polyArr.length <= 0) {
                    lay.msg('请绘制面!')
                    return false;
                };
                upData.oilpoints = JSON.stringify(polyArr);
            };
            delete upData.type;
            upData.centerpoints = JSON.stringify(cenArr);
            var loading;
            http({
                url: url.load,
                type: 'post',
                data: upData,
                beforeSend: function () {
                    loading = layer.load(1, {
                        shade: [0.1, '#fff']
                    });
                    $("#tips").show();
                    $("#alrBox").hide();
                },
                success: function (res) {
                    layer.close(loading);
                    map.clearOverLays();
                    $("#tips").hide();
                    $(".tips").show();
                    axisId = res.data;
                    getDataFn();
                    setTimFn();
                },
                error: function (err) {
                    layer.close(loading);
                    $("#tips").hide();
                    lay.msg("绘制面积过大!");
                }
            })
            return false;
        });
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
                    if(res.code==-1){
                        setTim = setTimeout(setTimFn, 10000);
                    }else{
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
        window.lookFn = function () {
            $("#feed").hide();
            $(".feed").show();
        };
        window.hideFn = function () {
            $(".feed").hide();
            $("#feed").show();
        };
        window.imgAlrFn = function () {
            layer.photos({
                photos: "#carousel",
                anim: 5,
            })
        };
        window.closeFn = function () {
            $("#alrBox").hide();
        };
        window.reloadFn = function () {
            window.location.reload();
        };
        window.onunload = function () {
            window.clearTimeout(setTim);
        };
    });
    e("pre", {})
});
layui.define(function (e) {
    layui.use(["urls", "jquery", "laydate", "form", "upload"], function () {
        var http = layui.urls.http,
            url = layui.urls.url,
            $ = layui.jquery,
            lay = layui.layer,
            laydate = layui.laydate,
            layForm = layui.form;
        var map = new T.Map('map'),
            zoom = 10,
            polygon = null;

        var isC = 2;//用于区分点击了时间轴  还是点击了雷达
        var stage = null;
        var timeLine = [];
        var polArr = [];
        var tempDeta;
        // 获取时间轴信息
        function setFn() {
            http({
                url: url.radar,
                type: 'get',
                data: {},
                success: function (res) {
                    timeLine = res.data;
                    initAxisFn(timeLine, timeLine.length);
                    if (timeLine.length > 0) {
                        stage = timeLine[timeLine.length - 1];
                        getRanFn();
                        // ldListFn();
                    };
                }
            });
        };
        setFn();
        // 初始化时间
        laydate.render({
            elem: '#date',
            type: 'datetime',
            format: 'yyyy-MM-dd HH:mm',
            // max: dateMaxFn()
        });
        // 时间轴初始化
        var dateChart = echarts.init(document.getElementById('dateAxis'));
        function initAxisFn(data, idx) {
            var option = {
                grid: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                },
                timeline: {
                    axisType: 'category',
                    data: data,
                    left: 150,
                    right: 150,
                    bottom: 0,
                    label: {
                        color: '#d37540',
                        interval: 0,
                        clickable: true

                    },
                    checkpointStyle: {
                        color: '#1b84d2',
                        borderColor: '#1b84d2'
                    },
                    itemStyle: {
                        color: '#d37540',
                        borderColor: '##d37540'
                    },
                    controlStyle: {
                        show: false
                    },
                    currentIndex: idx
                },
            };
            dateChart.setOption(option);
            dateChart.on('timelinechanged', function (e) {
                var i = e.currentIndex;
                stage = timeLine[i];
                idx = 0;
                isC = 1;
                if (polygon) {
                    map.removeOverLay(polygon);
                    getRanFn();
                }
            });
        };
        //获取雷达详情
        function getRanFn() {
            http({
                url: url.radar,
                type: 'post',
                data: {
                    time: stage
                },
                success: function (res) {
                    var deta = res.detail;
                    var str = '';
                    for (var item in deta) {
                        str += '<div>' +
                            '<p title=\"' + item + '"\>' + item + '</p>' +
                            ' <p title=\"' + deta[item] + '"\>' + deta[item] + '</p>' +
                            '</div>';
                    };
                    $("#box_box").html(str);
                    polArr = res.data;
                    ldListFn();
                    // addPolFn();
                }
            });
        };
        // 获取雷达列表
        var check = 0;
        var marker;
        var ld;
        function ldListFn() {
            http({
                url: url.ld,
                type: 'get',
                data: {
                    type: "雷达"
                },
                success: function (res) {
                    ld = res.data;
                    console.log(ld)
                    setRadFn();
                }
            });
        };
        //添加雷达图层
        function setRadFn() {
            map.clearOverLays();
            for (var i = 0; i < ld.length; i++) {
                var dataItem = ld[i].fields;
                dataItem.check = i;
                if (i == check) {
                    var icon = new T.Icon({
                        iconUrl: "../../static/leida.png",
                        iconSize: new T.Point(60, 60)
                    });
                    setCirFn(dataItem.lon, dataItem.lat);
                    tempDeta = {
                        lon: dataItem.lon,
                        lat: dataItem.lat
                    };
                } else {
                    var icon = new T.Icon({
                        iconUrl: "../../static/leida.png",
                        iconSize: new T.Point(30, 30)
                    });
                };
                marker = new T.Marker(new T.LngLat(dataItem.lon, dataItem.lat), { icon: icon, item: dataItem });
                map.addOverLay(marker);
                marker.addEventListener("mouseover", addInFn);
                marker.addEventListener("click", getSiteFn);
                // 添加雷达覆盖面积
            };
            addPolFn();
            setZxFn();
        };
        // 添加圆
        var circle = null;
        function setCirFn(lon, lat) {
            if (circle) {
                map.removeOverLay(circle);
                circle = null;
            };
            var icon = {
                color: "#fff",
                weight: 1,
                opacity: 1,
                fillColor: "#fff",
                fillOpacity: 0.1,
                lineStyle: "solid"
            };
            circle = new T.Circle(new T.LngLat(lon, lat), 25000, icon);
            map.addOverLay(circle);
        };
        // 绘制溢油面
        function addPolFn() {
            var points = [];
            for (var i = 0; i < polArr.length; i++) {
                var tempItem = polArr[i];
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
            setZxFn();
        };
        //添加信息框
        var infoWin = null;
        var setInfoOut = null;
        function addInFn(item) {
            window.clearTimeout(setInfoOut);
            removeInFn();
            var opt = item.target.options;
            var data = opt.item;
            var htm = '<div>' + data.station + '<div/>';
            var m = item.target;
            infoWin = new T.InfoWindow();
            infoWin.setLngLat(m.getLngLat());
            infoWin.setOffset(new T.Point(0, -20));
            infoWin.setContent(htm);
            infoWin.closeOnClick = true;
            map.addOverLay(infoWin);
            setInfoOut = setTimeout(removeInFn, 5000);
        };
        //移除信息框
        function removeInFn() {
            window.clearTimeout(setInfoOut);
            if (infoWin) {
                map.removeOverLay(infoWin);
            }
        };
        // 雷达点击事件
        function getSiteFn(item) {
            removeInFn();
            tempDeta = item.target.options.item;
            check = tempDeta.check;
            isC = 2;
            setRadFn();
        };
        //设置中心点
        function setZxFn() {
            if (isC == 1) {
                var c = map.getViewport(polArr);
                var lat = c.center.lat;
                var lng = c.center.lng;
                map.centerAndZoom(new T.LngLat(lat, lng), 14);
            } else {
                var lat = tempDeta.lon;
                var lng = tempDeta.lat;
                map.centerAndZoom(new T.LngLat(lat, lng), 10);
            };
        };
        window.reloadFn = function () {
            window.location.reload();
        };
    });
    e("radar", {})
});
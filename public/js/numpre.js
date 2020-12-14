var layForm = layui.form;
var laydate = layui.laydate;
var map;
var wms;
var bbox;
var resourceInfo;
var width, height;
var xmax, ymax, xmin, ymin;
require([
    "esri/map",
    "esri/layers/WMSLayer",
    "esri/layers/WMSLayerInfo",
    "esri/layers/ArcGISDynamicMapServiceLayer",
    "esri/geometry/Extent",
], function (Map, WMSLayer, WMSLayerInfo, ArcGISDynamicMapServiceLayer, Extent) {
    var tempUrl = "http://192.168.1.156:8002/fore/";
    // var tempUrl="http://152.136.151.201:8003/fore/";
    map = new Map("map", {
        logo: false,
        basemap: "topo",
        center: [121, 37],
        zoom: 8,
        fadeOnZoom: true,
        minZoom: 3,
    });
    var htlayer = new ArcGISDynamicMapServiceLayer("http://map.geoq.cn/arcgis/rest/services/ChinaOnlineCommunity_Mobile/MapServer?f=json&callback=dojo.io.script.jsonp_dojoIoScript1._jsonpCallback");
    map.addLayer(htlayer);

    var stage = '';
    var checks = 1;
    var dateChart = echarts.init(document.getElementById('dateAxis'));
    function initAxisFn(data) {
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
                left: 10,
                right: 10,
                bottom: 0,
                label: {
                    color: '#fff',
                    interval: 0,
                    clickable: true

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
            stage = data[idx];


            if (map.getLayer("shuzhimap")) {
                map.removeLayer(map.getLayer("shuzhimap"));
            }

            checks == 1 ? getForeFn() : checks == 2 ? postForeFn() : "";
        });
    };
    var check = $("input[type='checkbox']");
    layForm.on('checkbox(check)', function (data) {
        var val = data.value;
        if (checks == val) {
            checks = '';
        } else {
            checks = val;
        };
        for (var c = 0; c < check.length; c++) {
            if (checks == check[c].value) {
                check[c].checked = true;
            } else {
                check[c].checked = false;
            }
        };
        layForm.render('checkbox');
        if (map.getLayer("shuzhimap")) {
            map.removeLayer(map.getLayer("shuzhimap"));
        }
        if (checks == 1) {
            getForeFn()
        }
        if (checks == 2) {
            postForeFn()
        }
        return false;
    });



    // 时间赋值和初始化
    var time = initDateFn();
    laydate.render({
        elem: '#date',
        type: 'date',
        format: 'yyyy-MM-dd',
        value: time,
        min: initDateFn(),
        done: function (val) {
            time = val;
            initEcharFn();
        }
    });
    var hm = new Date().getTime() + 3600000;//毫秒
    var xs = initTimeFn(hm);//获取小时
    var data = [];//赋值给时间轴

    var is = initDateFn();
    function initEcharFn() {
        data = [];
        var ks = time == is ? xs : 0;
        for (var k = ks; k < 24; k++) {
            var idx = k >= 10 ? k : '0' + k;
            data.push(idx);
        };
        stage = data[0];
        initAxisFn(data);

        if (map.getLayer("shuzhimap")) {
            map.removeLayer(map.getLayer("shuzhimap"))
        }
        if (checks == 1) {
            getForeFn()
        }
        if (checks == 2) {
            postForeFn()
        }
    }
    initEcharFn();
    // 获取今天时间
    function initDateFn() {
        var date = new Date();
        var y = date.getFullYear();
        var m = date.getMonth() + 1 >= 10 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1);
        var d = date.getDate() >= 10 ? date.getDate() : '0' + date.getDate();
        var time = y + '-' + m + '-' + d;
        return time;
    };
    // 获取今天毫秒
    function initTimeFn(hm) {
        var date = new Date(hm);
        var xs = date.getHours();
        return xs;
    };



    map.on("extent-change", function () {
        var extent = map.extent;
        width = map.width;
        height = map.height;
        xmax = extent.xmax;
        ymax = extent.ymax;
        xmin = extent.xmin;
        ymin = extent.ymin;
        changFn();
    });

    function changFn() {
        if (resourceInfo == undefined || resourceInfo == null) {
            var layer1 = new WMSLayerInfo({
                name: "1",
                title: "Rivers",
            });
            var layer2 = new WMSLayerInfo({
                name: "2",
                title: "Cities",
            });
            resourceInfo = {
                extent: new Extent(
                    xmin,
                    ymin,
                    xmax,
                    ymax,
                    {
                        wkid: 102100,
                    }
                ),
                layerInfos: [layer1, layer2],
            };
        }
        bbox = xmin + "," + ymin + "," + xmax + "," + ymax;
        if (map.getLayer("shuzhimap")) {
            map.removeLayer(map.getLayer("shuzhimap"))
        }
        if (checks == 1) {
            getForeFn()
        }
        if (checks == 2) {
            postForeFn()
        }
    };


    function getForeFn() {
        var date = time + "T" + stage;
        $.ajax({
            url: tempUrl,
            type: "get",
            data: {
                time: date,
                bbox: bbox,
                width: width,
                height: height
            },
            success: function (res) {
                var url = '';
                url = res.url;
                wms = new WMSLayer(url, {
                    resourceInfo: resourceInfo,
                    transparent: true,
                    format: "png",
                    visibleLayers: ["1", "2"],
                });
                wms.id = "shuzhimap"
                map.addLayers([wms]);

            },
        });
    };

    function postForeFn() {
        var date = time + "T" + stage;
        $.ajax({
            url: tempUrl,
            type: "post",
            data: {
                time: date,
                bbox: bbox,
                width: width,
                height: height
            },
            success: function (res) {
                var url = '';
                url = res.url;
                wms = new WMSLayer(url, {
                    resourceInfo: resourceInfo,
                    transparent: true,
                    format: "png",
                    visibleLayers: ["1", "2"],
                });
                wms.id = "shuzhimap"
                map.addLayers([wms]);
            },
        });
    };
});




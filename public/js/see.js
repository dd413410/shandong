layui.define(function (e) {
    layui.use(["urls", "form", "laydate"], function () {
        var http = layui.urls.http,
            url = layui.urls.url,
            $ = layui.$,
            lay = layui.layer,
            layForm = layui.form,
            laydate = layui.laydate;

        var map = new T.Map('map');
        zoom = 8;
        map.centerAndZoom(new T.LngLat(121.7, 38), zoom);
        var siteId = '', siteName = '';
        var site = null;
        var checked = 5;

        var timeVal = dateHandFn();
        var hours = dateHandHFn().slice(-2);
        // 日期选择器初始化
        laydate.render({
            elem: '#time',
            btns: ['confirm'],
            type: 'date',
            max: dateHandFn(),
            format: 'yyyy-MM-dd',
            value: timeVal,
            done: function (val) {
                timeVal = val;
                dateMaxFn(val);
            }
        });
        // 时间处理
        // 获取当前时间
        function dateHandFn() {
            var date = new Date();
            var y = date.getFullYear();
            var m = date.getMonth() + 1 >= 10 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1);
            var d = date.getDate() >= 10 ? date.getDate() : '0' + date.getDate();
            var dateStr = y + '-' + m + '-' + d;
            return dateStr;
        };

        function initDate() {
            var hour = dateHandHFn();
            var hours = hour.slice(-2);
            var curDate = dateHandFn();
            var max = curDate == timeVal ? hours : 23;
            var data = [];
            for (var i = 0; i <= max; i++) {
                var val = i < 10 ? "0" + i : i;
                data.push(val);
            };
            return data;
        };

        function dateMaxFn(val) {
            var hour = dateHandHFn();
            var h = hour.slice(-2);
            var day = hour.slice(0, -3);
            var idxs = 0;
            if (val == day) {
                idxs = h.slice(0, 1) == 0 ? h.slice(1, 2) : h;
            };
            data = initDate();
            hours = data[idxs];
            dateChart.setOption({
                timeline: {
                    data: data,
                    currentIndex: hours
                }
            });
            siteDateFn();
        };
        function dateHandHFn() {
            var date = new Date();
            var y = date.getFullYear();
            var m = date.getMonth() + 1 >= 10 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1);
            var d = date.getDate() >= 10 ? date.getDate() : '0' + date.getDate();
            var h = date.getHours() >= 10 ? date.getHours() : '0' + date.getHours();
            var dateStr = y + '-' + m + '-' + d + '-' + h;
            return dateStr;
        };

        // 要素复选框
        var checks = '';
        var check = $("input[name='elemCheck']");
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
            siteDateFn();
            layForm.render('checkbox');
            return false;
        });

        //时间轴
        var dateChart = echarts.init(document.getElementById('dateAxis'));
        var data = initDate();
        function initAxisFn() {
            var hour = dateHandHFn();
            var idx = hour.slice(-2);
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
                    left: 15,
                    right: 15,
                    bottom: 0,
                    label: {
                        color: '#1b84d2',
                        formatter: function (s) {
                            return s + "时"
                        }
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
                        show: false,
                    },
                    currentIndex: idx
                },
            };
            dateChart.setOption(option);
            dateChart.on('timelinechanged', function (e) {
                var idx = e.currentIndex;
                hours = data[idx];
                siteDateFn();
            });
            siteDateFn();
        };
        initAxisFn();
        // 获取浮标数据
        function siteDateFn() {
            var time = timeVal + "T" + hours + ":00";
            http({
                url: url.sites,
                type: 'post',
                data: {
                    type: "浮标",
                    time: time,
                    el: checks
                },
                success: function (res) {
                    site = res.site;
                    if (site.length > 0) {
                        var item = site[checked];
                        siteName = item.name;
                        siteId = item.id;
                        setZxFn();
                        siteDataFn();  //站点小时数据
                        siteLineFn();  //站点折线图
                        addIconFn();   //添加图标
                    };
                }
            });
        };
        function setZxFn(){
            var arr=[];
            for(var c=0;c<site.length;c++){
                var x=site[c];
                arr.push(new T.LngLat(x.lon,x.lat));
            };
           map.setViewport(arr);
        };

        function addIconFn() {
            map.clearOverLays();
            for (var i = 0; i < site.length; i++) {
                var dataItem = site[i];
                dataItem.check = i;
                var size = 10;
                if (i == checked) {
                    var icon = new T.Icon({
                        iconUrl: "../../static/fubiao.png",
                        iconSize: new T.Point(60, 60)
                    });
                    // map.centerAndZoom(new T.LngLat(dataItem.lon, dataItem.lat), zoom);
                    size = 12;
                } else {
                    var icon = new T.Icon({
                        iconUrl: "../../static/fubiao.png",
                        iconSize: new T.Point(30, 30)
                    });
                };
                var latlng = new T.LngLat(dataItem.lon, dataItem.lat);
                // var text="<div><span>"+dataItem.name +"</span><span style='color:#FFA500;'>"+checks+ ":" +dataItem.val +"</span></div>";
                var text="<div style='color:#0e487c;font-weight: 700;'>"+checks+ ":" +dataItem.val +"</div>";
                // var text="<div style='color:#0e487c;font-weight: 700;background-color:rgba(0,0,0,0.5);padding:0 10px;'>"+checks+ ":" +dataItem.val +"</div>";
                
                if(checks==''){
                    var text="<div style='color:#0e487c;font-weight: 700;'>"+checks+"</div>";
                }else{
                    var text="<div class='addText'>"+checks+ ":" +dataItem.val +"</div>";
                };

                
                var label = new T.Label({
                    text: text,
                    position: latlng,
                    offset: new T.Point(0, 0)
                });
                label.setFontSize(size);
                map.addOverLay(label);
                var marker = new T.Marker(new T.LngLat(dataItem.lon, dataItem.lat), { icon: icon, item: dataItem });
                map.addOverLay(marker);
                marker.addEventListener("mouseover", addInFn);
                marker.addEventListener("click", getSiteFn);
            };
        };
        //添加信息框
        var infoWin = null;
        var setInfoOut = null;
        function addInFn(item) {
            window.clearTimeout(setInfoOut);
            removeInFn();
            var opt = item.target.options;
            var data = opt.item;
            var htm = '<div>' + data.name + '<div/>';
            // var htm = '<div>' + data.name + "<span style='color:#33CC00;'>" + checks + ":" + data.val + "</span>" + '<div/>';
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
        function getSiteFn(item) {
            removeInFn();
            siteId = item.target.options.item.id;
            siteName = item.target.options.item.name;
            checked = item.target.options.item.check;
            addIconFn();
            siteLineFn();
            http({
                url: url.rank,
                type: 'post',
                data: {
                    id: siteId
                },
                success: function (res) {
                    var data = res.data;
                    var sitename = data[0]['站名'];
                    $('#hide-tle').html(sitename);
                    $('#hide-tle').attr('title', sitename);
                    var str = '';
                    for (var i = 0; i < data.length; i++) {
                        var dataIdx = data[i];
                        for (var item in dataIdx) {
                            str += '<div>' +
                                '<p class="ltp">' + item + '</p>' +
                                '<p class="rtp" title=' + dataIdx[item] + '>' + dataIdx[item] + '</p>' +
                                '</div>'
                        };
                    };
                    $("#box_box").html(str);
                    lay.open({
                        type: 1,
                        area: "450px",
                        title: false,
                        shadeClose: true,
                        shade: 0.1,
                        content: $('.hide-box'),
                        time: 150000
                    });

                }
            })
            siteDataFn()
        }
        var el = '风速';
        // 站点小时数据
        function siteDataFn() {
            http({
                url: url.curve,
                type: 'get',
                data: {
                    el: el
                },
                success: function (res) {
                    var title = res.title;
                    var data = res.data;
                    $('#dl').empty();
                    $('#ul').empty();
                    var str_tle = '';
                    for (var t = 0; t < title.length; t++) {
                        str_tle += '<li>' + title[t] + '</li>'
                    };
                    $('#dl').html(str_tle);
                    var temp = data[0].map(function (col, i) {
                        return data.map(function (row) {
                            return row[i];
                        })
                    });
                    for (var d = 0; d < temp.length; d++) {
                        var str_data = '';
                        var dataItem = temp[d];
                        for (var i = 0; i < dataItem.length; i++) {
                            str_data += '<li title=\"' + dataItem[i] + '\">' + dataItem[i] + '</li>';
                        };
                        var str_ul = '<ul>' + str_data + '</ul>'
                        $('#ul').append(str_ul);
                    }

                },
                error: function (r) {
                    if (r.status == 400) {
                        var err = r.responseJSON;
                        var objArr = Object.keys(err);
                        var str = err[objArr[0]][0];
                        lay.msg(str);
                    }
                }
            });
        };








        //处理折线图的上限和下限
        function maxFn(data) {
            var min = data[0],
                max = data[0];
            for (var i = 0; i < data.length; i++) {
                var x = data[i];
                if (x < min) {
                    min = x;
                };
                if (x > max) {
                    max = x
                };
            };
            var min = min < 1 ? min : Math.floor(min - (min * 0.2));
            var max = max < 0 ? 1 : Math.ceil(Number(max) + (max * 0.2));
            return { min: min, max: max }
        };

        //数据曲线
        function siteLineFn() {
            http({
                url: url.curve,
                type: 'post',
                data: {
                    el: el,
                    id: siteId
                },
                success: function (res) {
                    var min = maxFn(res.alldata[0].data).min;
                    var max = maxFn(res.alldata[0].data).max;

                    var data = res.alldata;
                    var time = res.time;
                    var serArr = [],
                        nameArr = [];
                    var line_tle = siteName + '曲线数据';
                    for (var a = 0; a < data.length; a++) {
                        var dateItem = data[a];
                        itemName = dateItem.name;
                        var dataArr = [];
                        for (var d = 0; d < dateItem.data.length; d++) {
                            var dataIdx = dateItem.data[d];
                            dataArr.push({
                                value: dataIdx,
                                form: {
                                    unit: dateItem.unit,
                                    name: dateItem.name
                                }
                            });
                        };
                        var ojbk = {
                            data: dataArr,
                            name: itemName,
                            symbolSize: 8,
                            type: 'line',
                            smooth: true
                        };
                        serArr.push(ojbk);
                        nameArr.push(itemName);
                    };
                    myline.setOption({
                        yAxis: {
                            min: min,
                            max: max
                        },
                        title: {
                            text: line_tle
                        },
                        legend: {
                            data: nameArr
                        },
                        tooltip: {
                            position: ['50%', '10%'],
                            formatter: function (val) {
                                var res = "";
                                for (var i = 0; i < val.length; i++) {
                                    var dataItem = val[i].data;
                                    var form = dataItem.form;
                                    res += "<div>时间:" + val[i].name + "</div>" +
                                        "<div>" + form.name + ':' + dataItem.value + form.unit + "</div>";
                                };
                                return res;
                            }
                        },
                        xAxis: {
                            data: time
                        },
                        series: serArr
                    });
                }
            });
        };

        layForm.on('radio(reg)', function (data) {
            el = data.value;
            siteDataFn();
            siteLineFn();
        });

        var myline = echarts.init(document.getElementById('line'));
        function initLineFn() {
            var option = {
                title: {
                    x: 'center',
                    textStyle: {
                        color: '#07a6ff',
                    }
                },
                legend: {
                    icon: 'line',
                    top: 30,
                    textStyle: {
                        color: "#fff"
                    },
                    itemWidth: 10,
                    itemHeight: 30,
                },
                grid: {
                    left: '4%',
                    right: '2%',
                    top: '10%',
                    bottom: '5%',
                    containLabel: true
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        label: {
                            backgroundColor: '#07a6ff',
                        },
                    },
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    axisLabel: {
                        textStyle: {
                            color: '#07a6ff'
                        },
                        interval: 0,
                        rotate: 60
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#07a6ff'
                        }
                    }
                },
                yAxis: {
                    axisLabel: {
                        formatter: '{value}',
                        textStyle: {
                            color: '#07a6ff'
                        }
                    },
                    splitLine: {
                        lineStyle: {
                            color: '#07a6ff'
                        }
                    },
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: '#07a6ff'
                        }
                    }
                }
            };
            myline.setOption(option);
        };
        initLineFn();

        window.hideFn = function () {
            $("#alr").removeClass("layui-anim-fadein").addClass("layui-anim-fadeout");
            $("#site").show();
        };
        window.showFn = function () {
            $("#alr").removeClass("layui-anim-fadeout").addClass("layui-anim-fadein");
            $("#site").hide();
        };
        function alrFn() {
            http({
                url: url.alarms,
                type: 'get',
                data: {},
                success: function (res) {
                    var data = res.data;
                    $("#alr_box").empty();
                    if (data.length <= 0) {
                        hideFn();
                    };
                    for (var i = 0; i < data.length; i++) {
                        var dataItem = data[i];
                        var str = '<div class="item">' +
                            '<p class="site">' + dataItem.station + '</p>' +
                            '<p class="time">' + dataItem.time + '</p>' +
                            '<p class="elem">' + dataItem.el + dataItem.val + '</p>' +
                            // '<p class="eleval">' + dataItem.val + '</p>' +
                            '</div>';
                        $("#alr_box").append(str);
                    };
                }
            })
        };
        alrFn();
        setInt = setInterval(alrFn, 30000);

        // 刷新本页面
        window.reloadFn = function () {
            window.location.reload();
        };
    });
    e("see", {})
});
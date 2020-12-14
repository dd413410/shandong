
var shuzhitimer = false;

dojo.require("esri/map");
dojo.require("esri/layers/WMSLayer");
dojo.require("esri/layers/WMSLayerInfo");
dojo.require("esri/geometry/Extent");
$(document).ready(function () {
    //查询

    $('input:checkbox[name="shuzhi"]:checked').removeAttr("checked");
    function wmsLoad() {
        if (shuzhitimer)
            setTimeout(function () { $("#timeNext").trigger("click") }, 1000);
    }

    function GetDateString(a) {
        return a.getFullYear() + "-"
            + (a.getMonth() + 1 > 9 ? a.getMonth() + 1 : "0" + (a.getMonth() + 1)) + "-"
            + (a.getDate() > 9 ? a.getDate() : "0" + a.getDate()) + "&nbsp;"
            + (a.getHours() > 9 ? a.getHours() : "0" + a.getHours()) + ":"
            + "00";
    }

    //播放条上一时刻
    $("#timePre").click(function () {
        var index = $("#timeList .active").index();
        if (index == 0) {
            index = $("#timeList li").length - 1
        }
        else {
            index--;
        }
        $($("#timeList li")).eq(index).trigger("click")
    })

    //播放条下一时刻
    $("#timeNext").click(function () {
        var index = $("#timeList .active").index();
        if (index == $("#timeList li").length - 1) {
            index = 0
        }
        else {
            index++;
        }
        $($("#timeList li")).eq(index).trigger("click")
    })
    //播放开始
    $("#play").click(function () {
        if ($(this).hasClass("playing")) {
            $(this).removeClass("playing")
            shuzhitimer = false;
        }
        else {
            $(this).addClass("playing")
            shuzhitimer = true;
            setTimeout(function () { $("#timeNext").trigger("click") }, 1000);
        }
    })
    function SetPlayingLeft(a) {
        if (parseInt($("#timeList li").css("left")) == a)
            return;
        $("#timeList li").each(function (index, item) {
            $(item).css("left", (a += 110) + "px");
        })
    }
    $("input:checkbox[name='shuzhi']").change(function () {
        if (map.getLayer("shuzhimap"))
            map.removeLayer(map.getLayer("shuzhimap"))
        //播放条数据添加 
        $("#timeList").html("")
        if ($('input:checkbox[name="shuzhi"]:checked').length == 0) {
            $("#bft").hide();
            $("#shuzhiimg").hide();
            return;
        }
        $('input:checkbox[name="shuzhi"]:checked').removeAttr("checked");
        $(this).prop("checked", "checked");
        //播放条数据添加
        $("#timeList").html("")

        $('input:checkbox[name="shuzhimap"]:checked').removeAttr("checked");
        $(this).prop("checked", "checked");
        var width = -110
        var date = new Date()
        var timelength = parseInt($(this).attr("timeLength"))
        for (var i = 0; i < timelength - new Date().getHours(); i++) {
            $("#timeList").append('<li style="width:110px;position:absolute;left:' + (width += 110) + 'px;" id="' + date.getTime() + '" class="animation-time ng-scope ng-binding">' + GetDateString(date) + '</li>')
            date.setHours(date.getHours() + 1)
        }
        //播放条点击 时间
        $("#timeList li").click(function () {
            $("#timeList li").removeClass("active");
            $(this).addClass("active");
            SetPlayingLeft($(this).index() < 6 ? -110 : ($(this).index() - 5) * -110);
            //图层改变
            if (map.getLayer("shuzhimap"))
                map.removeLayer(map.getLayer("shuzhimap"))
            if (resourceInfo == undefined || resourceInfo == null) {
                var layer1 = new esri.layers.WMSLayerInfo({
                    name: '1',
                    title: 'Rivers'
                });
                var layer2 = new esri.layers.WMSLayerInfo({
                    name: '2',
                    title: 'Cities'
                });
                resourceInfo = {
                    extent: new esri.geometry.Extent(12518252.69901995, 3876426.889534112, 14866398.207939941, 5029708.772300545, {
                        wkid: 102100
                    }),
                    layerInfos: [layer1, layer2]
                };
            }
            //if ($('input:checkbox[name="shuzhi"]:checked').attr("polygon")) {
            //    var enArraw = $('input:checkbox[name="shuzhi"]:checked').attr("polygon").split(",");
            //    var extent = new esri.geometry.Extent(enArraw[0].split(" ")[0], enArraw[0].split(" ")[1], enArraw[2].split(" ")[0], enArraw[2].split(" ")[1], new esri.SpatialReference({ wkid: 4326 }));
            //    if (extent.ymin == "-90") {
            //        extent.ymin = "-89";
            //    }
            //    map.setExtent(extent);
            //}

            ////全图
            //var point = new esri.geometry.Point([120.329132, 36.063532]);
            //map.setZoom(11);
            //map.centerAt(point);



            var url = 'http://123.234.129.234:22345/oilmapwebservice20/drawEDS.aspx?format=image%2Fpng&styles=&grid=false&transparent=true&layers=100032&height=562&res_id=100032&width=1340&service=WMS&user_id=4&bbox=12666999.985146105%2C3112492.2471920033%2C15944619.758013591%2C4487135.763872248&srs=EPSG%3A3857&exceptions=application%2Fvnd.ogc.se_inimage&stride=AUTO%2C20&time=2016-06-10T20%3A00%3A00&session_id=4_vpwq82834VP827&version=1.1.1&Contour=false&xycolor=true&zlayer=1&legendbox=false&request=GetMap';

            var imgurl = "http://123.234.129.234:22345/oilmapwebservice20/drawEDS.aspx?grid=false&res_id=100028&user_id=4&exceptions=application/vnd.ogc.se_inimage&stride=AUTO,20&time=2018-07-30T00:00:00&session_id=4_vpwq82834VP827&Contour=false&xycolor=true&zlayer=6&legendbox=true&SERVICE=WMS&REQUEST=GetLegend&FORMAT=image/png&TRANSPARENT=TRUE&STYLES=&VERSION=1.3.0&layers=100028&CRS=EPSG:102100&BBOX=8814977.197440546,1816090.697827062,18124395.746346258,5842181.851662796&WIDTH=500&HEIGHT=100"
            url = changeURLArg(url, "res_id", $('input:checkbox[name="shuzhi"]:checked').val());
            url = changeURLArg(url, "layers", $('input:checkbox[name="shuzhi"]:checked').val());
            imgurl = changeURLArg(imgurl, "res_id", $('input:checkbox[name="shuzhi"]:checked').val());
            imgurl = changeURLArg(imgurl, "layers", $('input:checkbox[name="shuzhi"]:checked').val());
            var time = new Date(parseInt($(this).attr("id")))
            var endTimeM = time.getMonth() + 1;
            if (endTimeM < 10) {
                endTimeM = "0" + endTimeM;
            }
            var endTimeD = time.getDate();
            if (endTimeD < 10) {
                endTimeD = "0" + endTimeD;
            }
            var endTimeH = time.getHours();
            if (endTimeH < 10) {
                endTimeH = "0" + endTimeH;
            }
            url = changeURLArg(url, 'time', time.getFullYear() + "-" + endTimeM + "-" + endTimeD + "T" + endTimeH + "%3A" + "00" + "%3A" + "00");
            imgurl = changeURLArg(imgurl, 'time', time.getFullYear() + "-" + endTimeM + "-" + endTimeD + "T" + endTimeH + "%3A" + "00" + "%3A" + "00");
            
            var wmsLayer = new esri.layers.WMSLayer(url, {
                resourceInfo: resourceInfo,
                transparent: true,
                format: 'png',
                visibleLayers: $('input:checkbox[name="shuzhi"]:checked').val()
            });
            wmsLayer.id = "shuzhimap"
            map.addLayer(wmsLayer,1);

            wmsLayer.on("update", wmsLoad);
            $("#shuzhiimg").show();
            $("#shuzhiimg img").attr("src", imgurl)
        })
        $("#timeList li").eq(0).trigger("click")
        $("#bft").show();
        //全图
        //var point = new esri.geometry.Point([120.329132, 36.063532]);
        //map.setZoom(11);
        //map.centerAt(point);

    })
    //quxiao
    $("#quxiao").click(function () {
        $("#bg_pbox").hide();
        map.infoWindow.hide();
        $("svg").css("cursor", "default");
    })
    $("#queding").click(function () {
        if (isNaN(Date.parse($("#txt_End").val().toString())) || isNaN(Date.parse($("#txt_Begin").val().toString()))) {
            alert("起止时间不正确！");
            return;
        }
        else if (Date.parse($("#txt_End").val().toString()) < Date.parse($("#txt_Begin").val().toString())) {
            alert("起始时间不能大于终止时间！");
            return;
        }
        else {
            iden_tool = true
            $("svg").css("cursor", "Pointer");
        }
    });

})
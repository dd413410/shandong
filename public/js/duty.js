layui.define(function (e) {
    layui.use(["urls", "form"], function () {
        var http = layui.urls.http,
            url = layui.urls.url,
            $ = layui.$,
            lay = layui.layer;

        var zoom = 9;
        var map = new T.Map('map');
        map.centerAndZoom(new T.LngLat(121.7, 38), zoom);

        var live;
        var check = 0;
        function spListFn() {
            http({
                url: url.ld,
                type: 'get',
                data: {
                    type: "视频"
                },
                success: function (res) {
                    live = res.data;
                    setZxFn();
                    setLiveFn();
                }
            });
        };
        spListFn();

        function setZxFn(){
            var arr=[];
            for(var c=0;c<live.length;c++){
                var x=live[c].fields;
                arr.push(new T.LngLat(x.lon,x.lat));
            };
           map.setViewport(arr);
        };
        
        function setLiveFn() {
            map.clearOverLays();
            for (var i = 0; i < live.length; i++) {
                var dataItem = live[i].fields;
                dataItem.check = i;
                if (i == check) {
                    var icon = new T.Icon({
                        iconUrl: "../../static/shipin.png",
                        iconSize: new T.Point(60, 60)
                    });
                    var lat = dataItem.lon;
                    var lng = dataItem.lat;
                    // map.centerAndZoom(new T.LngLat(lat, lng), zoom);

                } else {
                    var icon = new T.Icon({
                        iconUrl: "../../static/shipin.png",
                        iconSize: new T.Point(30, 30)
                    });
                };
                marker = new T.Marker(new T.LngLat(dataItem.lon, dataItem.lat), { icon: icon, item: dataItem });
                map.addOverLay(marker);
                marker.addEventListener("mouseover", addInFn);
                marker.addEventListener("click", getSiteFn);
            };
        }
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
            var deta = item.target.options.item;
            check = deta.check;
            setLiveFn();
            playFn();
        };
        var v = document.getElementById("myvideo");
        function playFn() {
            $("#liveBox").show();
            v.src = "../../static/live.mp4";
            v.play();
        }
        window.hideFn = function () {
            if (!v.paused) {
                v.pause();
                $("#liveBox").hide();
            }
        }
    });
    e("duty", {})
});
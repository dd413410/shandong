layui.define(function (e) {
    layui.use(["urls", "form", "upload"], function () {
        var http = layui.urls.http,
            url = layui.urls.url,
            $ = layui.$,
            lay = layui.layer,
            layForm = layui.form,
            upload = layui.upload;
        var map = new T.Map('map');
        var zoom = 8;
        map.setMaxZoom(14);
        map.centerAndZoom(new T.LngLat(121.7, 38), zoom);
        var type = '1';
        var pol_a = [],//sar
            pol_b = [],//X波段
            pol_c = [],//光学
            pol_d = [];//高光谱

        layForm.on('select(type)', function (data) {
            type = data.value;
            $("#addForm")[0].reset();
            layForm.render();
            pol_a = [];
            pol_b = [];
            pol_c = [];
            pol_d = [];
            $(".analy_type").hide();
            switch (type) {
                case '1':
                    $(".analy_a").show();
                    break;
                case '2':
                    $(".analy_b").show();
                    break;
                default:
                    $(".analy_c").show();
            }
            return false;
        });
        // sar
        var load_a = [];
        upload.render({
            elem: '#sar',
            acceptMime: ".shp",
            exts: 'shp',
            field: 'file',
            url: url.up,
            choose: function (obj) {
                obj.preview(function (index, file, result) {
                    $("#sarn").val(file.name);
                    $("#sarn").attr("title", file.name);
                    $("#file_a").val(file.name);
                });
            },
            before: function (c) {
                load_a = layer.load(1, {
                    shade: [0.1, '#fff']
                });
            },
            done: function (res) {
                pol_a = res.data;
                layer.close(load_a);
            },
            error: function () {
                layer.close(load_a);
                lay.msg('解析shp文件失败!');
            }
        });
        // X波段
        var load_b = [];
        upload.render({
            elem: '#xbd',
            acceptMime: ".shp",
            accept: 'file',
            exts: 'shp',
            field: 'file',
            url: url.up,
            choose: function (obj) {
                obj.preview(function (index, file, result) {
                    $("#xbdn").val(file.name);
                    $("#xbdn").attr("title", file.name);
                    $("#file_b").val(file.name);
                });
            },
            before: function (c) {
                load_b = layer.load(1, {
                    shade: [0.1, '#fff']
                });
            },
            done: function (res) {
                pol_b = res.data;
                layer.close(load_b);
            },
            error: function () {
                layer.close(load_b);
                lay.msg('解析shp文件失败!');
            }
        });
        // 光学
        var load_c = [];
        upload.render({
            elem: '#wx',
            acceptMime: ".shp",
            accept: 'file',
            exts: 'shp',
            field: 'file',
            url: url.up,
            choose: function (obj) {
                obj.preview(function (index, file, result) {
                    $("#wxn").val(file.name);
                    $("#wxn").attr("title", file.name);
                    $("#file_c").val(file.name);
                });
            },
            before: function (c) {
                load_c = layer.load(1, {
                    shade: [0.1, '#fff']
                });
            },
            done: function (res) {
                pol_c = res.data;
                layer.close(load_c);
            },
            error: function () {
                layer.close(load_c);
                lay.msg('解析shp文件失败!');
            }
        });
        // 高光谱
        var load_b = [];
        upload.render({
            elem: '#ggp',
            acceptMime: ".shp",
            accept: 'file',
            exts: 'shp',
            field: 'file',
            url: url.up,
            choose: function (obj) {
                obj.preview(function (index, file, result) {
                    $("#ggpn").val(file.name);
                    $("#ggpn").attr("title", file.name);
                    $("#file_d").val(file.name);
                });
            },
            before: function (c) {
                load_b = layer.load(1, {
                    shade: [0.1, '#fff']
                });
            },
            done: function (res) {
                pol_d = res.data;
                layer.close(load_b);
            },
            error: function () {
                layer.close(load_a);
                lay.msg('解析shp文件失败!');
            }
        });

        var loadTip = null;

        layForm.on('submit(analBtn)', function (data) {
            /*
                type==1   acd
                type==2    bc
                type==3    cd
            */
            loadTip = lay.load(2, {
                shade: [0.5, '#000'],
                content: '正在进行融合分析',
                success: function (layero) {
                    layero.find('.layui-layer-content').css({
                        'padding-top': '40px',
                        'width': '200px',
                        'color': '#fff'
                    });
                }
            });

            switch (type) {
                case '1':
                    sarPolFn();
                    // wxPolFn();
                    // ggpPolFn();
                    $("#anal").val("SAR、光学、高光谱");
                    $("#area").val("0.33平方公里");
                    break;
                case '2':
                    xbdPolFn();
                    // wxPolFn();
                    $("#anal").val("X波段、光学");
                    $("#area").val("0.58平方公里");
                    break;
                default:
                    wxPolFn();
                    // ggpPolFn();
                    $("#anal").val("光学、高光谱");
                    $("#area").val("0.44平方公里");
                    
            };
            $("#alrBox").hide();
            $("#addanal").show();

            setZxFn();
            return false;
        });


        // 设置中心点
        function setZxFn() {
            var temp = pol_a.concat(pol_b).concat(pol_c).concat(pol_d);
            var arr=[];
            for(var c=0;c<temp.length;c++){
                console.log(temp[c])
                var x=temp[c];
                arr.push(new T.LngLat(x[0],x[1]));
            };
           map.setViewport(arr);
        };



        // type==1   acd
        // type==2    bc
        // type==3    cd

        //绘制sar面
        function sarPolFn() {
            var points = [];
            for (var i = 0; i < pol_a.length; i++) {
                var tempItem = pol_a[i];
                points.push(new T.LngLat(tempItem[0], tempItem[1]));
            };
            var polygon = new T.Polygon(points, {
                color: "#f29750",
                weight: 3,
                opacity: 0.5,
                fillColor: "#f29750",
                fillOpacity: 0.5
            });
            map.addOverLay(polygon);

            var lab = pol_a[pol_a.length - 1];
            var sarn = $("#sarn").val();
            var latlng = new T.LngLat(lab[0], lab[1]);
            var label = new T.Label({
                text: sarn,
                position: latlng,
                offset: new T.Point(-9, -20)
            });
            map.addOverLay(label);
            wxPolFn();
        };
        //绘制X波段面
        function xbdPolFn() {
            var points = [];
            for (var i = 0; i < pol_b.length; i++) {
                var tempItem = pol_b[i];
                points.push(new T.LngLat(tempItem[0], tempItem[1]))
            };
            var polygon = new T.Polygon(points, {
                color: "#003a6c",
                weight: 3,
                opacity: 0.5,
                fillColor: "#003a6c",
                fillOpacity: 0.5
            });
            map.addOverLay(polygon);

            var lab = pol_b[pol_b.length - 1];
            var xbdn = $("#xbdn").val();
            var latlng = new T.LngLat(lab[0], lab[1]);
            var label = new T.Label({
                text: xbdn,
                position: latlng,
                offset: new T.Point(-9, 10)
            });
            map.addOverLay(label);
            wxPolFn();
        };
        //绘制光学面
        function wxPolFn() {
            var points = [];
            for (var i = 0; i < pol_c.length; i++) {
                var tempItem = pol_c[i];
                points.push(new T.LngLat(tempItem[0], tempItem[1]))
            };
            var polygon = new T.Polygon(points, {
                color: "#b54334",
                weight: 3,
                opacity: 0.5,
                fillColor: "#b54334",
                fillOpacity: 0.5
            });
            map.addOverLay(polygon);

            var lab = pol_c[pol_c.length - 1];
            var wxn = $("#wxn").val();


            var latlng = new T.LngLat(lab[0], lab[1]);
            var label = new T.Label({
                text: wxn,
                position: latlng,
                offset: new T.Point(-9, 10)
            });
            map.addOverLay(label);
            type == 2 ? lay.close(loadTip) : ggpPolFn();
        };
        //绘制高光谱面
        function ggpPolFn() {
            var points = [];
            for (var i = 0; i < pol_d.length; i++) {
                var tempItem = pol_d[i];
                points.push(new T.LngLat(tempItem[0], tempItem[1]))
            };
            var polygon = new T.Polygon(points, {
                color: "#8e7437",
                weight: 3,
                opacity: 0.5,
                fillColor: "#8e7437",
                fillOpacity: 0.5
            });
            map.addOverLay(polygon);
            var lab = pol_d[pol_d.length - 1];
            var ggpn = $("#ggpn").val();
            var latlng = new T.LngLat(lab[0], lab[1]);
            var label = new T.Label({
                text: ggpn,
                position: latlng,
                offset: new T.Point(-9, 10)
            });
            map.addOverLay(label);
            lay.close(loadTip);
        };
        layForm.verify({
            name: function (val) {
                if (!val) {
                    return '请输入案例名';
                }
            },
            sarn: function (val) {
                if (type == 1) {
                    if (!val) {
                        return '请上传SAR文件';
                    }
                }
            },
            xbdn: function (val) {
                if (type == 2) {
                    if (!val) {
                        return '请上传X波段文件';
                    }
                }
            },
            wxn: function (val) {
                if (!val) {
                    return '请上传卫星光学文件';
                }
            },
            ggpn: function (val) {
                if (type == 1 || type == 3) {
                    if (!val) {
                        return '请上传高光谱文件';
                    }
                }
            }
        });
        var kxd = "";
        layForm.on('submit(addBtn)', function (data) {
            var data = data.field;
            data.type = type;
            data.sar = JSON.stringify(pol_a);
            data.xbd = JSON.stringify(pol_b);
            data.gx = JSON.stringify(pol_c);
            data.ggp = JSON.stringify(pol_d);
            kxd = data.kxd;
            http({
                url: url.an,
                type: "post",
                data: data,
                success: function (res) {
                    lay.msg('保存案例成功!')
                    $("#addanal").hide();

                    tipsFn();
                }
            })
            return false;
        });

        function tipsFn() {
            var tips = "";
            if (type == 1) {
                tips = "SAR、光学、高光谱:0.33平方公里;<span>置信度:<span style='color:#FFFF00;'>" + kxd + "</span>!</span>";
            } else if (type == 2) {
                tips = "X波段、光学:0.58平方公里;<span>置信度:<span style='color:#FFFF00;'>" + kxd + "</span>!</span>";
            } else {
                tips = "光学、高光谱:0.44平方公里;<span>置信度:<span style='color:#FFFF00;'>" + kxd + "</span>!</span>";
            };
            $("#text").html(tips);
            $(".alr_box").show();
        };


        $("#hide").click(function () {
            $(".alr_box").hide();
            $("#btn").show();
        });


        $("#btn").click(function () {
            $(".alr_box").show();
            $("#btn").hide();
        });


    });
    e("analy", {})
})
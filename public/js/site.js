layui.define(function (e) {
    layui.use(['urls', 'form', 'laypage', 'laydate', "element"], function () {
        var http = layui.urls.http,
            url = layui.urls.url,
            $ = layui.$,
            layForm = layui.form,
            lay = layui.layer,
            laypage = layui.laypage,
            laydate = layui.laydate,
            layEle = layui.element;
        var date = new Date();
        var y = date.getFullYear();
        var m = date.getMonth() + 1 >= 10 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1);
        var d = date.getDate() >= 10 ? date.getDate() : '0' + date.getDate();
        var max = y + '-' + m + '-' + d;

        var val = '浮标',
            page = 1,
            site = [];

        layEle.on('tab(tab)', function (e) {
            val = $(this).attr('tab-id');
            page = 1;
            siteListFn();
        });
        /*
            @@@数据列表接口
        */
        function siteListFn() {
            http({
                url: url.list,
                type: 'get',
                data: {
                    page_size: page,
                    type: val
                },
                success: function (res) {
                    $('#tbody').empty();
                    site = res.results;
                    var count = res.count;
                    $('#count').html(count);
                    count > 10 ? $('#pag').show() : $('#pag').hide();
                    for (var s = 0; s < site.length; s++) {
                        var str =
                            '<div class="layui-row tbody">' +
                            '<div title=\"' + site[s].ofType + '\">' + site[s].ofType + '</div>' +
                            '<div title=\"' + site[s].station + '\">' + site[s].station + '</div>' +
                            '<div title=\"' + site[s].stationCode + '\">' + site[s].stationCode + '</div>' +
                            '<div title=\"' + site[s].address + '\">' + site[s].address + '</div>' +
                            '<div title=\"' + site[s].lon + '\">' + site[s].lon + '</div>' +
                            '<div title=\"' + site[s].lat + '\">' + site[s].lat + '</div>' +
                            '<div title=\"' + site[s].Date + '\">' + site[s].Date + '</div>' +
                            '<div>' +
                            '<img onclick="operFn(2,' + site[s].id + ')" src="../../static/2.png" title="修改信息"/>' +
                            '<img onclick="dele(' + site[s].id + ')" src="../../static/4.png" title="删除"/>' +
                            '</div > ' +
                            '</div>';
                        $('#tbody').append(str);
                    };
                    laypage.render({
                        elem: 'pag',
                        count: count,
                        curr: page,
                        theme: '#5a98de',
                        jump: function (obj, is) {
                            if (!is) {
                                page = obj.curr;
                                siteListFn();
                            }
                        }
                    });
                }
            });
        };
        siteListFn();

        /*
            @@@搜索按钮以及关闭当前页面按钮
        */
        $('#close').click(function () {
            var index = parent.layer.getFrameIndex(window.name)
            parent.layer.close(index);
        });
        /*
            @@@判断是修改还是添加 1为添加,其他为修改
        */
        var or;
        window.operFn = function (t, id) {
            laydate.render({
                elem: '#Date',
                max: max
            });
            or = t;
            if (or == 1) {
                $('#tle').text('添加站点');
            } else {
                $('#tle').text('修改站点');
            };
            $("#addForm")[0].reset();
            layForm.render();
            $('#add').show();
            if (!!id) {
                for (var i = 0; i < site.length; i++) {
                    if (site[i].id == id) {
                        var item = site[i];
                        setValFn(item);
                    }
                }
            } else {
                $('#dibl').attr('disabled', false);
            };
        };
        /*
            @@@正则验证
        */
        layForm.verify({
            station: function (val) {
                if (!val) {
                    return '请输入站点名';
                }
            },
            stationCode: function (val) {
                if (!val) {
                    return '请输入站代码';
                }
            },

            address: function (val) {
                if (!val) {
                    return '请输入地点';
                }
            },
            lon: function (val) {
                if (!val) {
                    return '请输入经度';
                }
            },
            lat: function (val) {
                if (!val) {
                    return '请输入纬度';
                }
            },
            Date: function (val) {
                if (!val) {
                    return '请选择布放时间';
                }
            }
        });
        /*
            @@@提交按钮
        */
        layForm.on('submit(addBtn)', function (data) {
            var data = data.field;
            or == 1 ? delete data.id : '';
            if (or == 1) {
                http({
                    url: url.site,
                    type: 'post',
                    data: data,
                    success: function () {
                        lay.msg("添加站点成功!")
                        $("#add").hide();
                        siteListFn();
                    },
                    error: function (err) {
                        if (err == 400) {
                            lay.msg("该站点已存在!")
                        }
                    }
                })
            } else {
                http({
                    url: url.sitechange,
                    type: 'post',
                    data: data,
                    success: function (res) {
                        lay.msg('修改成功！');
                        $('#add').hide();
                        siteListFn();
                    },
                    error: function () {
                        lay.msg('修改站点信息失败！');
                    }
                });
            }
            return false;
        });
        /*
            @@@表单赋值
        */

        function setValFn(item) {
            layForm.val('addForm', {
                "id": item.id,
                "station": item.station,
                "stationCode": item.stationCode,
                "address": item.address,
                "ofType": item.ofType,
                "lon": item.lon,
                "lat": item.lat,
                "Date": item.Date
            });
            $('#dibl').attr('disabled', true);
        };
        /*
                @@@删除按钮
        */
        window.dele = function (e) {
            var infoMsg = lay.msg('此操作将永久删除该数据, 是否继续?', {
                time: 10000,
                shade: 0.5,
                btn: ['确定', '取消'],
                yes: function () {
                    http({
                        url: url.sitedele,
                        type: 'post',
                        data: {
                            id: e
                        },
                        success: function (res) {
                            lay.msg('删除成功！');
                            lay.close(infoMsg);
                            siteListFn();
                        }
                    });
                },
                btn2: function () {
                    lay.msg('已取消删除!');
                }
            });
        };
        /*
            @@@添加和修改页面的关闭按钮
        */
        window.closeFn = function () {
            $('#add').hide();
        };
    });
    e("site", {})
});
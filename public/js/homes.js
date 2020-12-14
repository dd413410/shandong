layui.define(function (e) {
    layui.use(["urls"], function () {
        var http = layui.urls.http,
            url = layui.urls.url,
            lay = layui.layer,
            $ = layui.$;
        var dateVal;
        dateVal = initDate();
        $('#date').html('当前日期:' + dateVal)
        setInterval(function () {
            dateVal = initDate();
            $('#date').html('当前日期:' + dateVal)
        }, 30000);
        function initDate() {
            var date = new Date();
            var y = date.getFullYear();
            var m = date.getMonth() + 1 >= 10 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1);
            var d = date.getDate() >= 10 ? date.getDate() : '0' + date.getDate();
            var date = y + '-' + m + '-' + d;
            return date;
        };
        var user = sessionStorage.user;
        $("#user").html(user);

        // 很有可能会删除
        var is=sessionStorage.is;
        if(is){
            $("#box").attr("src","./data/warn.html");
            $('#item_btn p').removeClass('add');
            $('#yuce').addClass('add');
        }else{
            $("#box").attr("src","./data/warn.html");
            $('#item_btn p').removeClass('add');
            $('#yiyou').addClass('add');
        };
        /*
            @@@更改iframe以及调用函数
        */
        $('#item_btn p').click(function () {
            var src = $(this).attr('src');
            var type = $(this).attr('type');
            if (type == 1) {
                sessionStorage.is = '';
                $('#item_btn p').removeClass('add');
                $(this).addClass('add');
                $('#box').attr('src', src);
            } else {
                lay.open({
                    type: 2,
                    title: false,
                    shade: 0.8,
                    closeBtn: 0,
                    area: ['75%', '680px'],
                    content: src
                });
            }
        });
        $("#openHtm").click(function () {
            lay.open({
                type: 2,
                title: false,
                shade: 0.8,
                closeBtn: 0,
                area: ['30%', '320px'],
                content: '../pages/data/users.html'
            });
        });
        // 接受子页面传过来的数值
        // window.setSiteFn = function (val) {
        //     $("#site").html(val);
        // };
        // 设置按钮的zIndex
        window.zIdxFn = function (x) {
            if (x == 1) {
                $('#box').css('zIndex', '406')
            } else {
                $('#box').css('zIndex', '400')
            }
        };
        window.clickFn = function () {
            sessionStorage.is = '';
            var base = layui.urls.base;
            var u = base + 'pages/home.html';
            window.top.location.href = u;
        };
        // 退出按钮
        window.outFn = function () {
            sessionStorage.is = '';
            // window.location.href = '../index.html';
            window.location.href = '../login.html';
            window.close();
        };
        // 刷新子页面
        window.load = function () {
            window.frames['box'].reloadFn();
        };
    });
    e("homes", {})
});
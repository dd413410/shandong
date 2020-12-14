layui.define(function (e) {
    layui.use(["urls", "form"], function () {
        var http = layui.urls.http,
            url = layui.urls.url,
            layForm = layui.form,
            lay = layui.layer,
            $ = layui.jquery;


        function trimFn(name) {
            var reg = /\S/;
            if (!name) {
                return false;
            } else {
                name.trim();
                return reg.test(name);
            }
        };
        layForm.verify({
            user: function (val) {
                if (!trimFn(val)) {
                    return '请输入用户名!';
                }
            },
            pass: function (val) {
                if (!trimFn(val)) {
                    return '请输入密码!';
                }
            }
        });
        var cate = 1;
        $(".check").click(function () {
            $(".check").removeClass("add");
            $(this).addClass("add");
            cate = $(this).attr("cate");
        });
        layForm.on('submit(login)', function (data) {
            var user = data.field.user;
            var pass = data.field.pass;
            var is = data.field.cate;
            if (is) {
                cate = data.field.cate;
            }
            // var cate = data.field.cate;
            http({
                url: url.login,
                type: 'post',
                data: {
                    username: user,
                    password: pass
                },
                success: function () {
                    sessionStorage.clear();
                    sessionStorage.user = user;
                    sessionStorage.is = '';
                    var url = './pages/home.html';
                    if (cate == 1) {
                        url = './pages/home.html';
                    } else {
                        url = './view/home.html';
                    };
                    window.location.href = url;
                },
                error: function (err) {
                    if (err == 400) {
                        lay.msg('账号密码错误!');
                    }
                }
            });
            return false;
        });
    });
    e("index", {})
});



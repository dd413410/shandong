layui.define(function (e) {
    layui.use(['urls', 'form'], function () {
        var http = layui.urls.http,
            url = layui.urls.url,
            $ = layui.$,
            layForm = layui.form,
            lay = layui.layer;
        $('#username').val(sessionStorage.user);
        layForm.verify({
            name: function (val) {
                if (!val) {
                    return '请输入实况IP名';
                }
            },
            ip: function (val) {
                var reg = /^(25[0-5]|2[0-4]\d|[0-1]?\d?\d)(\.(25[0-5]|2[0-4]\d|[0-1]?\d?\d)){3}$/;
                if (!val || !reg.test(val)) {
                    return '请输入正确的实况IP';
                }
            },
            pass: function (val) {
                if (!val) {
                    return '请输入此账号的当前密码';
                }
            },
            pass1: function (val) {
                if (!val || val.length < 8 || val.length > 20) {
                    return '请输入8位以上20位以下的新密码,并且不可存在空格';
                }
            },
            pass2: function (val) {
                var newPass = $('#pass1').val();
                if (val !== newPass) {
                    return '两次输入密码不一致';
                }
            }
        });
        layForm.on('submit(form)', function (d) {
            var data = {
                username: d.field.username,
                password: d.field.pass,
                password2: d.field.pass1,
                password3: d.field.pass2
            };
            http({
                url: url.changePass,
                type: 'post',
                data: data,
                success: function () {
                    lay.msg('修改密码成功');
                },
                error: function (r) {
                    if (r.status == 400) {
                        var err = r.responseJSON;
                        var objArr = Object.keys(err);
                        lay.msg(err[objArr[0]]);
                    }
                }
            });
            return false;
        });
        $('#close').click(function () {
			var index = parent.layer.getFrameIndex(window.name)
			parent.layer.close(index);
		});
    });

    e("users", {});
});

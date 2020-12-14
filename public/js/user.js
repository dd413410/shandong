layui.define(function (e) {
	layui.use(['urls', 'form', 'laypage'], function () {
		var http = layui.urls.http,
			url = layui.urls.url,
			$ = layui.$,
			layForm = layui.form,
			lay = layui.layer,
			laypage = layui.laypage;

 
		// function siteListFn() {
		// 	http({
		// 		url: url.checks,
		// 		type: 'get',
		// 		data: {
		// 			username: sessionStorage.user
		// 		},
		// 		success: function (res) {
		// 			var selelimi = '';
		// 			for (var j = 0; j < res.length; j++) {
		// 				selelimi += '<option value="' + res[j].station + '">' + res[j].station + '</option>';
		// 			};
		// 			$('#selelimi').html(selelimi);
		// 			layForm.render('select');
		// 		}
		// 	});
		// };
		// siteListFn();
		var userName = '',
			page = 1;
		function userListFn() {
			http({
				url: url.users,
				type: 'get',
				data: {
					name: userName,
					page_size: page
				},
				success: function (res) {
					$('#tbody').empty();
					var user = res.results;
					var count = res.count;
					$('#count').html(count);
					count > 10 ? $('#pag').show() : $('#pag').hide();
					for (var u = 0; u < user.length; u++) {
						var str = '';
						str =
							'<div class="layui-row tbody">' +
							'<div class="layui-col-xs4">' + user[u].username + '</div>' +
							'<div class="layui-col-xs4">' + user[u].create_time + '</div>' +
							'<div class="layui-col-xs4">' +
							'<button atr=' + user[u].username + ' type="button" class="layui-btn layui-btn-sm layui-btn-normal"><i class="layui-icon"></i> 删除</button>' +
							'</div>' +
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
								userListFn();
							}
						}
					});
				}
			});
		};
		userListFn();
		$("#sear").click(function () {
			userName = $('#look').val();
			page = 1;
			userListFn();
		});
		$(window).keyup(function (event) {
			if (event.keyCode == 13) {
				$("#sear").click();
			}
		});

		$("#addUser").click(function () {
			$("#addForm")[0].reset();
			$('#add').show();
		});

		//判断用户输入
		var userReg = /[a-zA-Z][1-9\._]*/;
		layForm.verify({
			username: function (val) {
				if (!val || !userReg.test(val)) {
					return '请输入账号,不可存在汉字或全为数字';
				} else {
					if (val.length > 8 || val.length < 5) {
						return '账号长度请保持在5-8位';
					}
				}
			},
			password: function (val) {
				if (!val || val.length < 8 || val.length > 20) {
					return '请输入8位以上20位以下的密码,并且不可存在空格';
				}
			},
			used: function (val) {
				var pass = $('#pass').val();
				if (val !== pass) {
					return '两次输入密码不一致';
				}
			},
			newPass: function (val) {
				if (!val) {
					return '请输入此账号的当前密码';
				}
			},
			password2: function (val) {
				if (!val || val.length < 8 || val.length > 20) {
					return '请输入8位以上20位以下的新密码,并且不可存在空格';
				}
			},
			password3: function (val) {
				var newPass = $('#pass2').val();
				if (val !== newPass) {
					return '两次输入密码不一致';
				}
			},
		});
		//添加人员
		layForm.on('submit(addSub)', function (data) {
			var data = data.field;
			delete data.used
			http({
				url: url.user,
				type: 'post',
				data: data,
				success: function (res) {
					lay.msg('添加成功');
					$('#add').hide();
					userListFn();
				},
				error: function (err) {
					if (err == 400) {
						lay.msg('此用户已存在!');
					}
				}
			});
			return false;
		});

		$("#tbody").on("click", "button", function () {
			var name = $(this).attr('atr');
			var infoMsg = lay.msg('此操作将永久删除该数据, 是否继续?', {
				time: 10000,
				shade: 0.5,
				btn: ['确定', '取消'],
				yes: function () {
					http({
						url: url.dele,
						type: 'post',
						data: {
							username: sessionStorage.user,
							name: name
						},
						success: function (res) {
							lay.msg('删除成功！');
							lay.close(infoMsg);
							userListFn();
						},
						error: function (err) {
							if (err.status == 400) {
								lay.msg(err.responseJSON.message)
							}
						}
					});
				},
				btn2: function () {
					lay.msg('已取消删除。');
				}
			});
		});

		window.closeFn = function (h) {
			$('#' + h).hide();
		};
		$('#close').click(function () {
			var index = parent.layer.getFrameIndex(window.name)
			parent.layer.close(index);
		});
	});
	e("user", {})
});
layui.define(function (e) {
  layui.use(['urls', 'form', 'laydate', 'laypage'], function () {
    var http = layui.urls.http,
      url = layui.urls.url,
      layForm = layui.form,
      lay = layui.layer,
      $ = layui.$,
      laydate = layui.laydate,
      laypage = layui.laypage;
    function checks() {
      http({
        url: url.checks,
        type: 'get',
        data: {
          username: sessionStorage.user
        },
        success: function (res) {
          var seleStr = '',
            chkStr = '';
          // for (var j = 0; j < res.length; j++) {
          //   seleStr += '<option value="' + res[j].station + '">' + res[j].station + '</option>';
          // }
          for (var s = 0; s < res.length; s++) {
            chkStr += '<input type="checkbox" class="check" name=' + res[s].id + ' lay-skin="primary" title=' + res[s].station +
              '>'
          }
          // $('#seleBox').html(seleStr);
          $('#check').html(chkStr);
          // layForm.render('select');
          layForm.render('checkbox');
        }
      });
    };
    checks();
    var val = '',
      page = 1,
      arr = [];
    function list() {
      http({
        url: url.peoples,
        type: 'get',
        data: {
          page_size: page,
          name: val
        },
        success: function (res) {
          $('#tbody').empty();
          arr = res.results;
          var count = res.count;
          $('#count').html(count);
          count > 10 ? $('#pag').show() : $('#pag').hide();
          for (var i = 0; i < arr.length; i++) {
            var str = '';
            var sex = arr[i].gender == true ? '男' : '女';
            var type = arr[i].type == true ? '正常' : '停用';
            str +=
              '<div class="layui-row tbody">' +
              '<div class="layui-col-xs1">' + arr[i].name + '</div>' +
              '<div class="layui-col-xs1">' + sex + '</div>' +
              '<div class="layui-col-xs1">' + arr[i].mobile + '</div>' +
              '<div class="layui-col-xs1">' + arr[i].address + '</div>' +
              '<div class="layui-col-xs1">' + arr[i].b_date + '</div>' +
              '<div class="layui-col-xs1">' + arr[i].enter_date + '</div>' +
              '<div class="layui-col-xs1">' + arr[i].out_date + '</div>' +
              '<div class="layui-col-xs1">' + type + '</div>' +
              '<div class="layui-col-xs2">' + arr[i].description + '</div>' +
              '<div class="layui-col-xs2">' +
              '<img onclick="matcFn(' + arr[i].id + ')" src="../../static/3.png" title="分配管理站点"/>' +
              '<img onclick="operFn(2,' + arr[i].id + ')" src="../../static/2.png" title="修改员工信息"/>' +
              '<img onclick="dele(' + arr[i].id + ')" src="../../static/4.png" title="删除"/>' +
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
                list();
              }
            }
          });
        }
      });
    };
    list();
    $("#sear").click(function () {
      val = $('#look').val();
      page = 1;
      list();
    });
    $(window).keyup(function (event) {
      if (event.keyCode == 13) {
        $("#sear").click();
      }
    });
    //判断用户输入
    layForm.verify({
      name: function (val) {
        if (!val) {
          return '请输入姓名';
        }
      },
      b_date: function (val) {
        if (!val) {
          return '请选择出生日期';
        }
      },
      enter_date: function (val) {
        if (!val) {
          return '请选择迁入日期';
        }
      },
      mobile: function (val) {
        if (!val || !(/^1[3456789]\d{9}$/.test(val))) {
          return '请输入正确联系方式';
        }
      },
      address: function (val) {
        if (!val) {
          return '请输入籍贯';
        }
      }
    });
    // 分配
    window.matcFn = function (id) {
      var check = $('.check');
      for (var d = 0; d < check.length; d++) {
        check[d].checked = false;
      }
      var sites;
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].id == id) {
          layForm.val('matcForm', {
            "delay": arr[i].delay_time
          });
          sites = arr[i].sites.split(',');
        }
      }
      for (var j = 0; j < sites.length; j++) {
        for (var k = 0; k < check.length; k++) {
          if (sites[j] == check[k].name) {
            check[k].checked = true;
          }
        }
      }
      layForm.render('checkbox');
      $('#masks').show();
      layForm.on('submit(matcsub)', function (data) {
        var check = data.field;
        var delay = check.delay;
        delete check.delay;
        var objArr = Object.keys(check);
        var str = objArr.join(',');
        http({
          url: url.change,
          type: 'post',
          data: {
            id: id,
            sites: str,
            delay_time: delay
          },
          success: function () {
            lay.msg('修改成功');
            $('#masks').hide();
            list();
          }
        });
        return false;
      });
    };

    layForm.on('checkbox(cheAll)', function (data) {
      var check = $('.check');
      if (data.elem.checked) {
        for (var c = 0; c < check.length; c++) {
          check[c].checked = true;
        }
      } else {
        for (var c = 0; c < check.length; c++) {
          check[c].checked = false;
        }
      }
      layForm.render('checkbox');
    });

    //添加和修改
    var or; //用于判断时从添加和修改哪个进入的
    window.operFn = function (e, id) {
      or = e;
      $("#infoForm")[0].reset(); //先重置一下表单
      layui.form.render();
      if (e == 1) {
        $('.is').hide(); //添加时不需要显示这些元素,修改时才显示
        $('#mask').show();
      } else {
        $('.is').show();
        for (var i = 0; i < arr.length; i++) {
          if (arr[i].id == id) {
            var item = arr[i];
            var gender = item.gender == true ? '男' : '女';
            var type = item.type == true ? '正常' : '停用';
            layForm.val('infoForm', {
              "id": item.id,
              "name": item.name,
              "gender": gender,
              "type": type,
              "mobile": item.mobile,
              "address": item.address,
              // "of_site": item.of_site,
              "description": item.description
            });
            $('#b_date').val(item.b_date);
            $('#enter_date').val(item.enter_date);
            $('#out_date').val(item.out_date);
            $('#mask').show();
          }
        }
      }
    };

    //添加和修改的提交
    layForm.on('submit(sub)', function (data) {
      var data = data.field;
      data.gender = data.gender == '男' ? true : false;
      data.type = data.type == '正常' ? true : false;
      if (or == 1) {
        delete data.out_date;
        delete data.id;
        http({
          url: url.people,
          type: 'post',
          data: data,
          success: function () {
            lay.msg('添加成功！');
            $('#mask').hide();
            list();
          }
        });
      } else {
        http({
          url: url.infoModi,
          type: 'post',
          data: data,
          success: function () {
            lay.msg('修改成功！');
            $('#mask').hide();
            list();
          }
        });
      };
      return false;
    });
    //删除
    window.dele = function (e) {
      var infoMsg = lay.msg('此操作将永久删除该数据, 是否继续?', {
        time: 10000,
        shade: 0.5,
        btn: ['确定', '取消'],
        yes: function () {
          http({
            url: url.peodele,
            type: 'post',
            data: {
              id: e
            },
            success: function () {
              lay.msg('删除成功！');
              lay.close(infoMsg);
              list()
            }
          });
        },
        btn2: function () {
          lay.msg('已取消删除。');
        }
      });
    };
    $('.maskHide').click(function () {
      $('.mask').hide();
    });
    $('#close').click(function () {
      var index = parent.layer.getFrameIndex(window.name)
      parent.layer.close(index);
    });
    laydate.render({
      elem: '#b_date'
    });
    laydate.render({
      elem: '#enter_date'
    });
    laydate.render({
      elem: '#out_date'
    });
  });
  e("info", {})
});

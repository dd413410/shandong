layui.define(function (e) {
  layui.use(["urls", "form", "element"], function () {
    var http = layui.urls.http,
      url = layui.urls.url,
      $ = layui.$,
      lay = layui.layer,
      layForm = layui.form,
      layEle = layui.element;

    var type = 1;
    layEle.on('tab(tab)', function (e) {
      type = $(this).attr('tab-id');
      type == 1 ? list() : lists();
    });
    var datas=[];
    function lists() {
      http({
        url: url.con,
        type: "get",
        data: {},
        success: function (res) {
          $("#tbody").empty();
          datas = res.data;
          var count = datas.length;
          $("#count").html(count);
          var thead = '<div class="layui-col-xs4">要素名</div>' +
            '<div class="layui-col-xs4">延迟时间(H)</div>' +
            '<div class="layui-col-xs4">操作</div>';
          $("#thead").html(thead);
          for (var i = 0; i < datas.length; i++) {
            var dataItem = datas[i].fields;
            var str = "";
            str =
              '<div class="layui-row tbody">' +
              '<div class="layui-col-xs4">' +
              dataItem.Type +
              "</div>" +
              '<div class="layui-col-xs4">' +
              dataItem.Time +
              "</div>" +
              '<div class="layui-col-xs4" id="' +
              datas[i].pk +
              '">' +
              '<img src="../../static/5.png" title="编辑"/>' +
              "</div>" +
              "</div>";
            $("#tbody").append(str);
          }
        }
      })
    };
    var id,
      arr = [];

    function list() {
      http({
        url: url.call,
        type: "get",
        data: {},
        success: function (res) {
          $("#tbody").empty();
          arr = res.results;
          var count = res.count;
          $("#count").html(count);
          var thead = '<div class="layui-col-xs3">要素名</div>' +
            '<div class="layui-col-xs3">上阈值告警</div>' +
            '<div class="layui-col-xs3">下阈值告警</div>' +
            '<div class="layui-col-xs3">操作</div>';
          $("#thead").html(thead);
          for (var i = 0; i < arr.length; i++) {
            var dataItem=arr[i];
            var str = "";
            str =
              '<div class="layui-row tbody">' +
              '<div class="layui-col-xs3">' +
              dataItem.element_name +
              "</div>" +
              '<div class="layui-col-xs3">' +
              dataItem.o_alarm +
              "</div>" +
              '<div class="layui-col-xs3">' +
              dataItem.u_alarm +
              "</div>" +
              '<div class="layui-col-xs3" id="' +
              dataItem.id +
              '">' +
              '<img src="../../static/5.png" title="编辑"/>' +
              "</div>" +
              "</div>";
            $("#tbody").append(str);
          }
        },
      });
    }
    list();




    var str;
    $("#tbody").on("click", "img", function () {
      var atr = $(this).parent().attr("id");
      atr ? (id = atr) : (id = "");
      if(type==1){
        var obj = {};
        for (var s = 0; s < arr.length; s++) {
          if (arr[s].id == id) {
            obj = arr[s];
          }
        }
        layForm.val("form", {
          elem: obj.element_name,
          topVal: obj.o_alarm,
          btmVal: obj.u_alarm
        });
        $(".mask").show();
      }else{
        var obj = {};
        for (var s = 0; s < datas.length; s++) {
          if (datas[s].pk == id) {
            obj = datas[s];
          }
        }
        str=obj.fields.Type;
        layForm.val("forms", {
          type: obj.fields.Type,
          time: ''
        });
        if(str=="浮标数据延迟预警阀值"){
          $("#place").attr("placeholder","请输入延迟时间(最低0.5H)")
        }else{
          $("#place").attr("placeholder","请输入延迟时间(最低1H)")
        };
        $(".masks").show();
      }
    });
    layForm.verify({
      topVal: function (val) {
        if (!val) {
          return "请输入上阀值";
        }
      },
      btmVal: function (val) {
        if (!val) {
          return "请输入下阀值";
        }
      },
      time: function (val) {
        if(str=="浮标数据延迟预警阀值"){
          if (val<0.5) {
            return "请输入正确的延迟时间,不可低于0.5H";
          }
        }else{
          if (val<1) {
            return "请输入正确的延迟时间,不可低于1H";
          }
        }
      }
    });

    layForm.on("submit(sub)", function (data) {
      var field = data.field;
      http({
        url: url.parchange,
        type: "post",
        data: {
          id: id,
          element_name: field.elem,
          o_alarm: field.topVal,
          u_alarm: field.btmVal
        },
        success: function () {
          $(".mask").hide();
          list();
        },
      });
      return false;
    });
    layForm.on("submit(subs)", function (data) {
      var field = data.field;
      http({
        url: url.con,
        type: "post",
        data: {
          id: id,
          type: field.type,
          time: field.time
        },
        success: function () {
          $(".masks").hide();
          lists();
        },
      });
      return false;
    });
    $("#maskHide").click(function () {
      $(".mask").hide();
    });
    $("#maskHides").click(function () {
      $(".masks").hide();
    });
    $("#close").click(function () {
      var index = parent.layer.getFrameIndex(window.name)
      parent.layer.close(index);
    });
  });
  e("call", {})
})
layui.define(['jquery', 'layer'], function (exports) {
  var $ = layui.$,
    lay = layui.layer,
    baseUrl = 'http://192.168.1.156:8002/';
  // baseUrl = 'http://152.136.151.201:8003/';
  var urls = {
    base: 'http://192.168.1.104:8088/dist/',
    // base: 'http://152.136.151.201:8003/static/dist/',
    http: function (val) {
      if (val.type == 'post') {
        val.contentType = 'application/x-www-form-urlencoded';
      };
      var url = val.url || '';
      var type = val.type || 'get';
      var data = val.data || {};
      var dataType = val.dataType || 'json';
      var async = val.async || true;
      $.ajax({
        url: url,
        type: type,
        headers: {
          'Content-Type': val.contentType
        },
        data: data,
        dataType: dataType,
        async: async,
        beforeSend: function () {
          val.beforeSend && val.beforeSend();
        },
        success: function (res) {
          val.success && val.success(res);
        },
        error: function (err) {
          var code = err.status;
          if (code == 404) {
            lay.msg('请求地址不存在!');
          } else {
            val.error && val.error(code);
          };
        },
        complete: function (r) {
          val.complete && val.complete(r.responseJSON);
        }
      });
    },
    url: {


      // 登录
      login: baseUrl + 'authorizations/',
      // 人员信息
      checks: baseUrl + 'checks/',
      peoples: baseUrl + 'peoples/',
      change: baseUrl + 'people/change/',
      people: baseUrl + 'people/',
      infoModi: baseUrl + 'people/modify/',
      peodele: baseUrl + 'people/delete/',
      // 站点信息
      site: baseUrl + 'site/',
      list: baseUrl + 'sites/',
      sitechange: baseUrl + 'site/change/',
      sitedele: baseUrl + 'site/delete/',

      // 用户管理
      users: baseUrl + 'users/',
      user: baseUrl + 'user/',
      dele: baseUrl + 'user/delete/',

      // 个人中心
      changePass: baseUrl + 'user/change/',


      //查询模式
      sites: baseUrl + 'getsi/sites/',
      curve: baseUrl + 'curve/',
      rank: baseUrl + 'rank/',
      alarms: baseUrl + 'alarms/',
      alarm: baseUrl + 'alarm/',


      ld: baseUrl + 'ld/',




      // 漂移预测
      yuce: baseUrl + 'yuce/',
      face: baseUrl + 'face/',

      rmyu: baseUrl + 'rmyu/',

      // 溢油遥感
      yaogan: baseUrl + 'yaogan/',
      cyan: baseUrl + 'cyan/',
      dyaogan: baseUrl + 'dyaogan/',
      load: baseUrl + 'upload/',

      monitor: baseUrl + 'monitor/',

      fore: baseUrl + 'fore/',
      receive: baseUrl + 'receive/',

      // 雷达
      radar: baseUrl + 'radar/',
      rdomp: baseUrl + 'rdomp/',


      call: baseUrl + 'parameters/',
      con: baseUrl + 'Con/',
      parchange: baseUrl + 'parameter/change/',

      import: baseUrl + 'import/',

      up: baseUrl + 'up/',

      an: baseUrl + 'an/',

      lst: baseUrl + 'lst/',

      rmrh: baseUrl + 'rmrh/',
    }
  };
  exports('urls', urls);
});
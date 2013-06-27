// Generated by CoffeeScript 1.4.0
/*
Variable Initialization
*/

var req_server, sys, watch_action;

sys = {
  time: 0,
  watch: null,
  user: null
};

/*
request to server
v: get_task, get_tasks, cancel_task, redownload_task, clear_tasks, pause_server
*/


req_server = function(v, data, success, failed) {
  if (data == null) {
    data = {};
  }
  data._ = Math.random();
  return $.ajax("http://" + ADDRESS + PATH + API.TASK + "?v=" + v, {
    type: "POST",
    data: data,
    dataType: "json",
    timeout: 2000,
    success: function(res) {
      if (res.code < 0) {
        return typeof failed === "function" ? failed(res) : void 0;
      } else {
        return typeof success === "function" ? success(res.value) : void 0;
      }
    },
    error: function(xhr, ajaxOptions, thrownError) {
      return typeof failed === "function" ? failed({
        code: -400
      }) : void 0;
    }
  });
};

/*
Watch Action
*/


watch_action = function() {
  return req_server("get_tasks", {
    time: sys.time
  }, function(data) {
    $("#control").addClass("online");
    $('body').removeClass('guest');
    $(data).each(function() {
      var target, tid;
      tid = parseInt(this.tid);
      target = $.task[tid];
      if (target == null) {
        return $.task.push({
          tid: this.tid,
          src_type: this.srcType,
          added_time: this.added_time,
          owner: this.owner,
          name: this.name,
          playlist: this.playlist,
          quality: this.quality,
          src: this.srcUrl,
          thumb: this.cover,
          time: this.time,
          status: 4,
          size: this.size,
          dl_size: this.dlSize,
          sub_task: this.subTaskTotal,
          sub_task_ok: this.subTaskOk
        });
      } else if (this.time >= target.time) {
        target.thumb = this.cover;
        target.time = this.time;
        target.status = this.status;
        target.quality = this.quality;
        target.size = this.size;
        target.dl_size = this.dlSize;
        target.sub_task = this.subTaskTotal;
        target.sub_task_ok = this.subTaskOk;
        if (this.time > sys.time) {
          return sys.time = this.time;
        }
      }
    });
    return sys.watch = setTimeout(watch_action, WATCH_TIME);
  }, function(res) {
    $("#control").removeClass("online");
    if (res.code === -2) {
      $('body').addClass('guest');
    }
    return sys.watch = setTimeout(watch_action, WATCH_TIME * 5);
  });
};

/*
Main
*/


$(function() {
  /*
    Initialization button
  */

  var load, login_action, sys_status, sys_user;
  $('#logo').click(function() {
    $('body').toggleClass('temp-green');
    if ($('body').hasClass('temp-green')) {
      _gaq.push(['_trackEvent', 'Configs', 'setColor', 'Green']);
      return $.cookie('temp', 'temp-green', {
        expiress: 365
      });
    } else {
      _gaq.push(['_trackEvent', 'Configs', 'setColor', 'Blue']);
      return $.removeCookie('temp');
    }
  });
  if ($.cookie('temp') === 'temp-green') {
    $('body').addClass('temp-green');
  }
  $(".box-nav .nav-refresh").click(function() {
    _gaq.push(['_trackEvent', 'Operate', 'Refresh', $.task.length]);
    $.task.reset();
    sys.time = 0;
    return load();
  });
  $(".box-nav .nav-clear").click(function() {
    _gaq.push(['_trackEvent', 'Operate', 'Clean', $.task.length]);
    req_server("clear_tasks", {
      time: sys.time
    });
    return $($.task).each(function() {
      if (!this) {
        return;
      }
      switch (this.status) {
        case STATUS.RELOAD:
        case STATUS.CANCEL:
        case STATUS.COMPLETE:
          if (sys.user === "admin" || this.owner === sys.user) {
            return this.del();
          }
      }
    });
  });
  $(".box-nav .nav-program").click(function() {
    return _gaq.push(['_trackEvent', 'Operate', 'Program', '']);
  });
  $(".box-nav .nav-fb").click(function() {
    return _gaq.push(['_trackEvent', 'Operate', 'Facebook', '']);
  });
  $(".box-nav .nav-ext").click(function() {
    return _gaq.push(['_trackEvent', 'Operate', 'Extension', '']);
  });
  $(".box-nav .nav-logout").click(function() {
    var data;
    _gaq.push(['_trackEvent', 'Operate', 'logout', sys.user]);
    data = {
      _: Math.random(),
      user: 'logout',
      pwd: 'logout'
    };
    sys.user = null;
    $('.login').removeClass('invalid');
    return $.ajax("http://" + ADDRESS + PATH + API.LOGIN + "?logout", {
      type: "POST",
      data: data,
      dataType: "json",
      timeout: 4000
    });
  });
  $('#dialog-chrome a').click(function() {
    _gaq.push(['_trackEvent', 'Check', 'Is not chrome', $('#dialog-chrome .donot').is(':checked')]);
    $('body').removeClass('no-chrome');
    if ($('#dialog-chrome .donot').is(':checked')) {
      $.cookie('donot-chrome', '1', {
        expiress: 365
      });
    }
    return true;
  });
  if (!($.browser.chrome === true || ($.cookie('donot-chrome') != null))) {
    $('body').addClass('no-chrome');
  }
  $('#dialog-ext a').click(function() {
    _gaq.push(['_trackEvent', 'Check', 'Not has ext', $('#dialog-ext .donot').is(':checked')]);
    $('body').addClass('has-ext');
    if ($('#dialog-ext .donot').is(':checked')) {
      $.cookie('donot-ext', '1', {
        expiress: 365
      });
    }
    return true;
  });
  if ($.browser.chrome !== true || ($.cookie('donot-ext') != null)) {
    $('body').addClass('has-ext');
  }
  $('#dialog-qpkg a, #dialog-error a').click(function() {
    $('body').removeClass('has-error no-qpkg');
    return true;
  });
  sys_status = function(listen) {
    return $.ajax("http://" + ADDRESS + PATH + API.INFO, {
      type: "POST",
      dataType: "json",
      data: {
        it: 'server'
      },
      timeout: 14000,
      success: function(res) {
        if (res.server != null) {
          if (res.server.qpkg_status !== 'TRUE') {
            $('body').addClass('no-qpkg');
          } else if (res.server.process_status !== 1 || res.server.server_status === 0) {
            $('body').addClass('has-error');
          } else {
            $('body').removeClass('no-qpkg has-error');
          }
          switch (res.server.server_status) {
            case 0:
              $('#control').attr('class', 'server-stopped');
              break;
            case 1:
              $('#control').attr('class', 'server-running');
              break;
            case 2:
              $('#control').attr('class', 'server-paused');
          }
        } else {
          $('body').addClass('has-error');
        }
        if (listen !== false) {
          return setTimeout(sys_status, 10000);
        }
      },
      error: function(xhr, ajaxOptions, thrownError) {
        if (listen !== false) {
          return setTimeout(sys_status, 10000);
        }
      }
    });
  };
  sys_status();
  sys_user = function(listen) {
    return $.ajax("http://" + ADDRESS + PATH + API.LOGIN + "?check", {
      type: "POST",
      dataType: "json",
      timeout: 14000,
      success: function(res) {
        if (res.status === "true") {
          sys.user = res.user;
        } else {
          $('body').addClass('guest');
        }
        if (listen !== false) {
          return setTimeout(sys_user, 10000);
        }
      },
      error: function(xhr, ajaxOptions, thrownError) {
        if (listen !== false) {
          return setTimeout(sys_user, 10000);
        }
      }
    });
  };
  sys_user();
  $.task.setListen(TASK.GROUP_CANCEL, function(tid) {
    if (tid.length > 0) {
      return req_server("cancel_task", {
        tid: tid
      });
    }
  });
  $.task.setListen(TASK.GROUP_RELOAD, function(tid) {
    if (tid.length > 0) {
      return req_server("redownload_task", {
        tid: tid
      });
    }
  });
  $.task.setListen(TASK.TASK_CANCEL, function(tid) {
    if (tid != null) {
      return req_server("cancel_task", {
        tid: [tid]
      });
    }
  });
  $.task.setListen(TASK.TASK_RELOAD, function(tid) {
    if (tid != null) {
      return req_server("redownload_task", {
        tid: [tid]
      });
    }
  });
  login_action = function() {
    var data, pwd, user;
    user = $('#username').val();
    pwd = $('#password').val();
    data = {
      _: Math.random(),
      user: user,
      pwd: pwd
    };
    $('.login').removeClass('invalid');
    $('.login').addClass('proceed');
    return $.ajax("http://" + ADDRESS + PATH + API.LOGIN, {
      type: "POST",
      data: data,
      dataType: "json",
      timeout: 4000,
      success: function(res) {
        if (String(res) === 'true') {
          $('body').removeClass('guest');
        } else {
          $('.login').addClass('invalid');
          $('body').addClass('guest');
        }
        sys.user = user;
        return $('.login').removeClass('proceed');
      },
      error: function(xhr, ajaxOptions, thrownError) {
        $('.login').removeClass('proceed');
        return $('body').addClass('guest');
      }
    });
  };
  $('.login').keypress(function(e) {
    var key;
    key = e.keyCode || e.which;
    if (key === 13) {
      return login_action();
    }
  });
  $('#login-submit').click(login_action);
  $('.login .remember').click(function() {
    return $(this).toggleClass('checked');
  });
  $("#control").click(function() {
    sys_status(false);
    if ($(this).hasClass('server-stopped')) {
      return false;
    }
    req_server('pause_server');
    return $(this).toggleClass("server-paused");
  });
  /*
    System load
  */

  load = function() {
    if (sys.watch != null) {
      clearTimeout(sys.watch);
      delete sys.watch;
    }
    return sys.watch = setTimeout(watch_action, WATCH_TIME);
  };
  return load();
});

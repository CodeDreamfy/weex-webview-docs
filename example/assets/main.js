$(function() {
  let functions = null;

  // Event
  const $js_initBtn = $(".js_initBtn");
  const $js_initCallHandle = $(".js_initCallHandle");
  const $js_firstStatus = $(".js_firstStatus");
  const $js_connecStatus = $(".js_connecStatus");
  const $js_status = $(".js_status");
  const $js_onlineStatus = $(".js_onlineStatus");
  const $js_commandStatus = $(".js_commandStatus");

  $js_initBtn.on("click", function() {
    sendNotify({ type: "initParam" });
    $js_initCallHandle.html("请求已发出，正等待回复");
  });
  $(".js_str_publish").on("click", function() {
    sendNotify({
      type: "command",
      data: {
        task_id: (+new Date() + "").slice(0, 7), // 可使用uuid的库来生成
        function: functions["STRING"].index, // function index
        type: "STRING", // 功能点类型
        value: "食屎啦你" // 功能点值
      }
    });
  });
  $(".js_bool_publish").on("click", function() {
    sendNotify({
      type: "command",
      data: {
        task_id: (+new Date() + "").slice(0, 7), // 可使用uuid的库来生成
        function: functions["BOOLEAN"].index, // function index
        type: "BOOLEAN", // 功能点类型
        value: true // 功能点值
      }
    });
  });
  $(".js_enum_publish").on("click", function() {
    sendNotify({
      type: "command",
      data: {
        task_id: (+new Date() + "").slice(0, 7), // 可使用uuid的库来生成
        function: functions["ENUM"].index, // function index
        type: "ENUM", // 功能点类型
        value: 1 // 功能点值
      }
    });
  });
  $(".js_number_publish").on("click", function() {
    sendNotify({
      type: "command",
      data: {
        task_id: (+new Date() + "").slice(0, 7), // 可使用uuid的库来生成
        function: functions["INTEGER"].index, // function index
        type: "INTEGER", // 功能点类型
        value: 1 // 功能点值
      }
    });
  });
  $(".js_buff_publish").on("click", function() {
    sendNotify({
      type: "command",
      data: {
        task_id: (+new Date() + "").slice(0, 7), // 可使用uuid的库来生成
        function: functions["BUFFER"].index, // function index
        type: "BUFFER", // 功能点类型
        value: "12fcb" // 功能点值
      }
    });
  });
  window.addEventListener("message", event => {
    let payload = event.data;
    switch (payload.type) {
      case "initParams":
        $js_initCallHandle.html(JSON.stringify(payload.data));
        functions = formatFun(payload.embed.functions);
        break;
      case "connectStatus":
        $js_connecStatus.html("连接状态：" + payload.data.status);
        break;
      case "command_resp":
        $js_commandStatus.html("命令下发状态" + payload.data.result);
        break;
      case "status":
        $js_status.html("连接状态：" + payload.data);
        break;
      case "first-status":
        $js_firstStatus.html(JSON.stringify(payload.data));
        break;
      case "online":
        $js_onlineStatus.html("设备在线状态：" + payload.data.status);
        break;
      default:
        break;
    }
  });

  function formatFun(func) {
    let Func = {};
    if (!func) return Func;
    Array.prototype.map.call(func, function(el) {
      Func[el.type] = el;
    });
    return Func;
  }

  function sendNotify(data) {
    window.parent.postMessage(data, "*");
  }
});

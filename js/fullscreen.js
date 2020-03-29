(function () {
  var runPrefixMethod = function (element, method) {
    var usablePrefixMethod;
    ["webkit", "moz", "ms", "o", ""].forEach(function (prefix) {
      if (usablePrefixMethod) return;
      if (prefix === "") {
        // 无前缀，方法首字母小写
        method = method.slice(0, 1).toLowerCase() + method.slice(1);

      }

      var typePrefixMethod = typeof element[prefix + method];

      if (typePrefixMethod + "" !== "undefined") {
        if (typePrefixMethod === "function") {
          usablePrefixMethod = element[prefix + method]();
        } else {
          usablePrefixMethod = element[prefix + method];
        }
      }
    });

    return usablePrefixMethod;
  };

  if (typeof window.screenX === "number") {
    var eleFull = document.querySelector(".full");
    eleFull.addEventListener("click", function cb() {
      if (runPrefixMethod(document, "FullScreen") || runPrefixMethod(document, "IsFullScreen")) {
        runPrefixMethod(document, "CancelFullScreen");
        this.title = this.title.replace("退出", "");
      } else if (runPrefixMethod(this, "RequestFullScreen")) {
        this.title = this.title.replace("点击", "点击退出");
      }
      eleFull.removeEventListener("click", cb);
    });
  } else {
    alert("爷，现在是年轻人的时代，您就暂且休息去吧~~");
  }
})();
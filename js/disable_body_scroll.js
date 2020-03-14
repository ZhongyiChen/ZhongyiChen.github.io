/**
 * @author       chenzhongyi <chenzhongyi.net>
 * @copyright    2020 Zhongyi Chen.
 */

(function disableBodyScroll() {
  // 如果不是移动端，则什么也不做
  if (!navigator.userAgent.match(/AppleWebKit.*Mobile.*/)) {
    return;
  }

  var isPassiveSupported = false;
  try {
    var options = Object.defineProperty({}, "passive", {
      get: function() {
        isPassiveSupported = true;
      }
    });
    window.addEventListener("test", null, options);
  } catch(err) {
    // TODO
  }

  // 默认所有元素均不可滚动
  document.body.addEventListener('touchmove', function bodyTouchmoveCb(evt) {
    if (!evt._isScroller) {
      evt.preventDefault();
    }
  }, isPassiveSupported ? {
    capture: false,
    passive: false,
  } : false);

  function enableElementScroll(el) {
    el.addEventListener('touchstart', function elTouchstartCb() {
      var top = this.scrollTop;
      var totalScroll = this.scrollHeight;
      var currentScroll = top + this.offsetHeight;

      if (top === 0) {
        this.scrollTop = 1;
      } else if (currentScroll === totalScroll) {
        this.scrollTop = top - 1;
      }
    });
    el.addEventListener('touchmove', function elTouchmoveCb(evt) {
      if (this.offsetHeight < this.scrollHeight) {
        evt._isScroller = true;
      }
    });
  }

  var doms = Array.prototype.slice.call(
    document.querySelectorAll("[data-enable-scroll]")
  );

  for (var i = 0, len = doms.length; i < len; i++) {
    enableElementScroll(doms[i]);
  }
}());
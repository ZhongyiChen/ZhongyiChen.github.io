window.Utils = {
  /**
   * 判断是否拥有某类
   */
  hasClass: function(el, cls) {
    if (el.classList) return el.classList.contains(cls);
    var cur = ' ' + Utils.getClassName(el) + ' ',
      tar = ' ' + cls + ' ';
    if (cur.indexOf(tar) >= 0) return true;
    return false;
  },
  /**
   * 用于为元素添加CSS类
   * 对于支持classList属性的浏览器，可用classList相关Api进行操作
   * 对于不支持classList属性的浏览器（如IE9，IE10的svg标签），可用setAttribute手动设置类
   */
  addClass: function(el, cls) {
    if (el.classList) {
      el.classList.add(cls)
      return;
    }
    var cur = ' ' + Utils.getClassName(el) + ' ';
    if (cur.indexOf(' ' + cls + ' ') < 0) {
      el.setAttribute('class', (cur + cls).trim());
    }
  },
  /**
   * 用于为元素移除CSS类
   * 对于支持classList属性的浏览器，可用classList相关Api进行操作
   * 对于不支持classList属性的浏览器（如IE9，IE10的svg标签），可用setAttribute手动设置类
   */
  removeClass: function(el, cls) {
    if (el.classList) {
      el.classList.remove(cls)
    } else {
      var cur = ' ' + Utils.getClassName(el) + ' ',
        tar = ' ' + cls + ' '
      while (cur.indexOf(tar) >= 0) {
        cur = cur.replace(tar, ' ')
      }
      el.setAttribute('class', cur.trim())
    }
  },
  /**
   * 切换类
   */
  toggleClass: function(el, cls) {
    if (el.classList) {
      el.classList.toggle(cls);
      return;
    }
    if (Utils.hasClass(el, cls)) {
      Utils.removeClass(el, cls);
      return;
    }
    Utils.addClass(el, cls);
  },
  /**
   * 用于获取元素的CSS类
   * 对于普通dom元素，可凭属性className进行获取
   * 对于svg元素，可凭属性className.baseVal进行获取
   */
  getClassName: function(el) {
    return (el.className instanceof SVGAnimatedString ? el.className.baseVal : el.className)
  },
  /**
   * 获取整数区间的随机数
   */
  getRandomAmongScope: function(min, max) {
    if (min === max) {
      return min;
    }
  
    var range = max - min + 1;
    var rand = Math.random();
  
    return (min + Math.floor(rand * range));
  },
  /**
   * 判断是否为数组
   */
  isTrueArray: function(arr) {
    if (typeof Array.isArray === 'function') {
      return Array.isArray(arr);
    }
    return Object.prototype.toString.call(arr) === '[object Array]';
  },
  /**
   * 对数组进行洗牌
   */
  shuffleArray: function(arr) {
    if (!Utils.isTrueArray(arr)) {
      throw new Error('shuffleArray 的参数必须为数组');
    }
    arr.sort(function (a, b) {
      return Math.random() > .5 ? -1 : 1;
    });
  },
};
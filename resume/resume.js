var utils = {
  /**
   * 用于为元素添加CSS类
   * 对于支持classList属性的浏览器，可用classList相关Api进行操作
   * 对于不支持classList属性的浏览器（如IE9，IE10的svg标签），可用setAttribute手动设置类
   */
  addClass: function(el, cls) {
    if (el.classList) {
      el.classList.add(cls)
    } else {
      var cur = ' ' + utils.getClassName(el) + ' '
      if (cur.indexOf(' ' + cls + ' ') < 0) {
        el.setAttribute('class', (cur + cls).trim())
      }
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
      var cur = ' ' + utils.getClassName(el) + ' ',
        tar = ' ' + cls + ' '
      while (cur.indexOf(tar) >= 0) {
        cur = cur.replace(tar, ' ')
      }
      el.setAttribute('class', cur.trim())
    }
  },
  /**
   * 用于获取元素的CSS类
   * 对于普通dom元素，可凭属性className进行获取
   * 对于svg元素，可凭属性className.baseVal进行获取
   */
  getClassName: function(el) {
    return (el.className instanceof SVGAnimatedString ? el.className.baseVal : el.className)
  }
}

window.addEventListener('load', function winLoaded() {
  var navBar = document.getElementById('navBar');
  var navUl = document.getElementById('navUl');
  navBar.addEventListener('click', function navBarClickCb() {
    if (1 === +this.dataset.collapse) {
      utils.removeClass(navBar, 'collapse');
      utils.removeClass(navUl, 'collapse');
      this.dataset.collapse = 0;
    } else {
      utils.addClass(navBar, 'collapse');
      utils.addClass(navUl, 'collapse');
      this.dataset.collapse = 1;
    }
  });
});
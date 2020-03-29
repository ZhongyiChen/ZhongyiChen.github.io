window.addEventListener('load', function winLoaded() {
  var navBar = document.getElementById('navBar');
  var navUl = document.getElementById('navUl');

  var Utils = window.Utils;
  
  navBar.addEventListener('click', function navBarClickCb() {
    if (1 === +this.dataset.collapse) {
      Utils.removeClass(navBar, 'collapse');
      Utils.removeClass(navUl, 'collapse');
      this.dataset.collapse = 0;
    } else {
      Utils.addClass(navBar, 'collapse');
      Utils.addClass(navUl, 'collapse');
      this.dataset.collapse = 1;
    }
  });
});
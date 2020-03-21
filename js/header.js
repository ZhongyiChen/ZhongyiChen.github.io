window.addEventListener('load', function winLoaded() {
  var navBar = document.getElementById('navBar');
  var navUl = document.getElementById('navUl');

  var utils = window.utils;
  
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
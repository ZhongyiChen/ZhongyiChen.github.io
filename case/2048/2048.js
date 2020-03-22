/**
 * 游戏的具体实现
 */
function Game2048() {
  var $ = window.$;
  var utils = window.utils;

  var $container = $('.container');
  var $list = $container.find('li');
  var $list_b = $container.find('li b');

  this.preItems = [         // 手指滑动前的各项
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
  ];
  this.curItems = [         // 手指滑动后的各项
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
  ];
  this.rows = 4;            // 行数
  this.cols = 4;            // 列数
  this.emptyCells = [];     // 空项下标的集合

  // 初始化，随机找两个格子放置两个 2
  this.init = function() {
    this.filterEmptyCells();
    utils.shuffleArray(this.emptyCells);

    var beginCells = this.emptyCells.slice(0, 2);
    var i = 0;
    var len = beginCells.length;

    for (; i < len; i++) {
      this.fillOneCell(beginCells[i], 2);
    }
    this.render();

    return this;
  };

  // 把数组的数字渲染到对应的 DOM 上
  this.render = function(cb) {
    var i = 0;
    var len = this.curItems.length;
    var curItem = 0;
    for (; i < len; i++) {
      curItem = this.curItems[i]
      if (this.preItems[i] === curItem) {
        continue;
      }
      this.preItems[i] = curItem;
      $list.eq(i)
        .removeClass()
        .addClass('item-' + curItem);
      $list_b.eq(i)
        .text(curItem);
    }
    cb && cb();

    return this;
  }

  // 找到数字为 0 的项的下标集合
  this.filterEmptyCells = function() {
    var i = 0;
    var len = this.curItems.length;

    this.emptyCells.length = 0;     // 先清空
    for (; i < len; i++) {
      if (0 === this.curItems[i]) {
        this.emptyCells.push(i);
      }
    }

    return this;
  }

  // (随机)选择一个空格子填充数字
  this.fillOneCell = function(index, num) {
    if (index < 0) {
      index = utils.getRandomAmongScope(0, this.emptyCells.length - 1);
    }
    this.curItems[this.emptyCells[index]] = num;
    this.render();
    
    return this;
  }

  // 检测能否正向移动
  this._affirmMoveForward = function(items) {
    var i = 0;
    var len = items.length;
    var pre = 0;
    for (i = 0; i < len; i++) {
      if (!items[i]) {
        if (pre) {
          return true;
        }
      } else {
        if (items[i] === pre) {
          return true;
        }
        pre = items[i];
      }
    }
    return false;
  }

  // 检测能否反向移动
  this._affirmMoveReverse = function(items) {
    var i = 0;
    var len = items.length;
    var pre = 0;
    for (i = len - 1; i >= 0; i--) {
      if (!items[i]) {
        if (pre) {
          return true;
        }
      } else {
        if (items[i] === pre) {
          return true;
        }
        pre = items[i];
      }
    }
    return false;
  }

  // 正向移动(某列向下/某行向右)
  this._moveForward = function(items) {
    var arr = [];
    var i = 0;
    var len = items.length;
    var pre = 0;
    var cur = 0;
    for (i = len - 1; i >= 0; i--) {
      if (!items[i]) {
        cur = 0;
        continue;
      }
      cur = items[i];
      if (!pre) {
        pre = cur;
        continue;
      }
      if (pre === cur) {
        arr.unshift(pre * 2);
        pre = 0;
        continue;
      }
      arr.unshift(pre);
      pre = cur;
    }
    if (pre) {
      arr.unshift(pre);
    }
    for (i = arr.length; i < len; i++) {
      arr.unshift(0);
    }

    return arr;
  }

  // 逆向移动(某列向上/某行向左)
  this._moveReverse = function(items) {
    var arr = [];
    var i = 0;
    var len = items.length;
    var pre = 0;
    var cur = 0;
    for (i = 0; i < len; i++) {
      if (!items[i]) {
        cur = 0;
        continue;
      }
      cur = items[i];
      if (!pre) {
        pre = cur;
        continue;
      }
      if (pre === cur) {
        arr.push(pre * 2);
        pre = 0;
        continue;
      }
      arr.push(pre);
      pre = cur;
    }
    if (pre) {
      arr.push(pre);
    }
    for (i = arr.length; i < len; i++) {
      arr.push(0);
    }

    return arr;
  }

  // 移动后
  this._moveDone = function() {
    this.render();
    this.filterEmptyCells();
    this.fillOneCell(-1, 2);
  }

  // 往左移
  this.moveLeft = function() {
    var isMoved = false;      // 是否移动过
    var items = [];
    for (var i = 0; i < this.rows; i++) {
      items.length = 0;
      for (var j = 0; j < this.cols; j++) {
        items.push(this.curItems[i * this.cols + j]);
      }
      if (!this._affirmMoveReverse(items)) {
        continue;
      }
      isMoved = true;
      items = this._moveReverse(items);
      for (var k = 0; k < this.cols; k++) {
        this.curItems[i * this.cols + k] = items[k];
      }
    }
    isMoved && this._moveDone();

    return this;
  }

  // 往右移
  this.moveRight = function() {
    var isMoved = false;      // 是否移动过
    var items = [];
    for (var i = 0; i < this.rows; i++) {
      items.length = 0;
      for (var j = 0; j < this.cols; j++) {
        items.push(this.curItems[i * this.cols + j]);
      }
      if (!this._affirmMoveForward(items)) {
        continue;
      }
      isMoved = true;
      items = this._moveForward(items);
      for (var k = 0; k < this.cols; k++) {
        this.curItems[i * this.cols + k] = items[k];
      }
    }
    isMoved && this._moveDone();

    return this;
  }

  // 往上移
  this.moveUp = function() {
    var isMoved = false;      // 是否移动过
    var items = [];
    for (var j = 0; j < this.cols; j++) {
      items.length = 0;
      for (var i = 0; i < this.rows; i++) {
        items.push(this.curItems[i * this.cols + j]);
      }
      if (!this._affirmMoveReverse(items)) {
        continue;
      }
      isMoved = true;
      items = this._moveReverse(items);
      for (var k = 0; k < this.rows; k++) {
        this.curItems[k * this.cols + j] = items[k];
      }
    }
    isMoved && this._moveDone();

    return this;
  }

  // 往下移
  this.moveDown = function() {
    var isMoved = false;      // 是否移动过
    var items = [];
    for (var j = 0; j < this.cols; j++) {
      items.length = 0;
      for (var i = 0; i < this.rows; i++) {
        items.push(this.curItems[i * this.cols + j]);
      }
      if (!this._affirmMoveForward(items)) {
        continue;
      }
      isMoved = true;
      items = this._moveForward(items);
      for (var k = 0; k < this.cols; k++) {
        this.curItems[k * this.cols + j] = items[k];
      }
    }
    isMoved && this._moveDone();

    return this;
  }

  // 防止新手调用时忘记用 new 操作符
  if (this instanceof Game2048) {
    return this;
  } else {
    return new Game2048();
  }
};


window.onload = function() {
  var $container = $('.container');
  var game = new Game2048();

  // 往左滑
  $container.on('swipeLeft', function(event) {
    game.moveLeft();
  });
  
  // 往右滑
  $container.on('swipeRight', function(event) {
    game.moveRight();
  });
  
  // 往上滑
  $container.on('swipeUp', function(event) {
    game.moveUp();
  });
  
  // 往下滑
  $container.on('swipeDown', function(event) {
    game.moveDown();
  });


  // 游戏正式开始
  game.init();
};
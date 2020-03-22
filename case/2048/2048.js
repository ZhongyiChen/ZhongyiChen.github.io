/**
 * 游戏的具体实现
 */
function Game2048() {
  var $ = window.$;
  var utils = window.utils;

  var $container = $('.container');
  var $list = $container.find('li');
  var $list_b = $container.find('li b');

  this._preItems = [            // 手指滑动前的各项
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
  ];
  this._curItems = [            // 手指滑动后的各项
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
  ];
  this._rows = 4;               // 行数
  this._cols = 4;               // 列数
  this._emptyCells = [];        // 空项下标的集合
  this._moveLocked = false;       // 移动锁
  this.canMoveLeft = false;     // 能否往左移
  this.canMoveRight = false;    // 能否往右移
  this.canMoveUp = false;       // 能否往上移
  this.canMoveDown = false;     // 能否往下移

  this.gameLose = false;        // 游戏是否已经失败
  this.gameWin = false;         // 游戏是否已经胜利

  // 初始化，随机找两个格子放置两个 2
  this.init = function() {
    this._filterEmptyCells();
    utils.shuffleArray(this._emptyCells);

    var beginCells = this._emptyCells.slice(0, 2);
    var i = 0;
    var len = beginCells.length;

    for (; i < len; i++) {
      this._fillOneCell(beginCells[i], 2);
    }
    this._render();
    this._affirmMoveDirection();

    return this;
  };

  // 把数组的数字渲染到对应的 DOM 上
  this._render = function(cb) {
    var i = 0;
    var len = this._curItems.length;
    var curItem = 0;
    for (; i < len; i++) {
      curItem = this._curItems[i]
      if (this._preItems[i] === curItem) {
        continue;
      }
      this._preItems[i] = curItem;
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
  this._filterEmptyCells = function() {
    var i = 0;
    var len = this._curItems.length;

    this._emptyCells.length = 0;     // 先清空
    for (; i < len; i++) {
      if (0 === this._curItems[i]) {
        this._emptyCells.push(i);
      }
    }

    return this;
  }

  // (随机)选择一个空格子填充数字
  this._fillOneCell = function(index, num) {
    if (index < 0) {
      index = utils.getRandomAmongScope(0, this._emptyCells.length - 1);
    }
    this._curItems[this._emptyCells[index]] = num;
    this._render();
    
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

  // 检测各个方向的移动可能
  this._affirmMoveDirection = function() {
    var i = 0;
    var j = 0;
    var items = [];
    // 默认各个方向是不能移动的
    this.canMoveLeft = false;
    this.canMoveRight = false;
    this.canMoveUp = false;
    this.canMoveDown = false;
    // 检测往左/右移的情况
    for (i = 0; i < this._rows; i++) {
      items.length = 0;
      for (j = 0; j < this._cols; j++) {
        items.push(this._curItems[i * this._cols + j]);
      }
      if (this._affirmMoveReverse(items)) {
        this.canMoveLeft = true;
      }
      if (this._affirmMoveForward(items)) {
        this.canMoveRight = true;
      }
      if (this.canMoveLeft && this.canMoveRight) {
        break;
      }
    }
    // 检测往上/下移的情况
    for (j = 0; j < this._cols; j++) {
      items.length = 0;
      for (i = 0; i < this._rows; i++) {
        items.push(this._curItems[i * this._cols + j]);
      }
      if (this._affirmMoveReverse(items)) {
        this.canMoveUp = true;
      }
      if (this._affirmMoveForward(items)) {
        this.canMoveDown = true;
      }
      if (this.canMoveUp && this.canMoveDown) {
        break;
      }
    }

    return this;
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
    this._render();
    this._filterEmptyCells();
    this._fillOneCell(-1, 2);
    this._affirmMoveDirection();
    if (
      this.canMoveLeft ||
      this.canMoveRight ||
      this.canMoveUp ||
      this.canMoveDown
    ) {
      this._moveLocked = false;      // 解锁
      return this;
    }
    this.gameLose = true;
    // console.log('不幸失败了！');

    return this;
  }

  // 往左/右移
  this.moveHorizontal = function(isLeft) {
    if (this._moveLocked) {
      return;
    }
    this._moveLocked = true;      // 先锁上

    var items = [];
    for (var i = 0; i < this._rows; i++) {
      items.length = 0;
      for (var j = 0; j < this._cols; j++) {
        items.push(this._curItems[i * this._cols + j]);
      }
      if (isLeft) {
        items = this._moveReverse(items);
      } else {
        items = this._moveForward(items);
      }
      for (var k = 0; k < this._cols; k++) {
        this._curItems[i * this._cols + k] = items[k];
      }
    }
    this._moveDone();

    return this;
  }

  // 往上/下移
  this.moveVertical = function(isUp) {
    if (this._moveLocked) {
      return;
    }
    this._moveLocked = true;      // 先锁上

    var items = [];
    for (var j = 0; j < this._cols; j++) {
      items.length = 0;
      for (var i = 0; i < this._rows; i++) {
        items.push(this._curItems[i * this._cols + j]);
      }
      if (isUp) {
        items = this._moveReverse(items);
      } else {
        items = this._moveForward(items);
      }
      for (var k = 0; k < this._rows; k++) {
        this._curItems[k * this._cols + j] = items[k];
      }
    }
    this._moveDone();

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

  var swipeListener = function(direction) {
    if (game.gameLose) {
      return;
    }
    switch (direction) {
      case 1:       // left
        game.moveHorizontal(true);
        break;
      case 2:       // right
        game.moveHorizontal(false);
        break;
      case 3:       // up
        game.moveVertical(true);
        break;
      case 4:       // down
        game.moveVertical(false);
        break;
    }
  }

  // 往左滑
  $container.on('swipeLeft', function(event) {
    swipeListener(1);
  });
  
  // 往右滑
  $container.on('swipeRight', function(event) {
    swipeListener(2);
  });
  
  // 往上滑
  $container.on('swipeUp', function(event) {
    swipeListener(3);
  });
  
  // 往下滑
  $container.on('swipeDown', function(event) {
    swipeListener(4);
  });


  // 游戏正式开始
  game.init();
};
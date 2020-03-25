/**
 * 游戏的具体实现
 */
function Game2048() {
  var $ = window.$;
  var Utils = window.Utils;
  var Anim = window.Anim;

  var $container = $('.container');
  var $list_li = $container.find('li');
  var $list_div = $container.find('li div');
  var $list_b = $container.find('li div b');

  // 得到各个格子相对方盒的位置
  var itemPositions = $list_li.map(function(index, li) {
    return $(li).position();
  });

  this.LEFT = 1;                // 各个方向的代号
  this.RIGHT = 2;
  this.UP = 3;
  this.DOWN = 4;
  this._curDirection = 0;       // 当前滑动的方向
  this._animTime = 100;         // 动画时间(毫秒)
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
  this._moveLocked = false;     // 移动锁
  this._maxItem = 2;            // 最大的项
  this.canMoveLeft = false;     // 能否往左移
  this.canMoveRight = false;    // 能否往右移
  this.canMoveUp = false;       // 能否往上移
  this.canMoveDown = false;     // 能否往下移

  this.gameLose = false;        // 游戏是否已经失败
  this.gameWin = false;         // 游戏是否已经胜利

  // 初始化，随机找两个格子放置两个 2
  this.init = function() {
    this._filterEmptyCells();
    Utils.shuffleArray(this._emptyCells);

    var beginCells = this._emptyCells.slice(0, 2);
    var i = 0;
    var len = beginCells.length;

    for (; i < len; i++) {
      this._fillOneCell(beginCells[i], 2);
    }
    this._render();
    this._affirmMoveDirection();

    return this;
  }

  // 某一格的移动动画
  this._animateCell = function(curIndex, preIndex, isHorizontal) {
    var curPos = itemPositions[curIndex];
    var prePos = itemPositions[preIndex];
    var x = 0;
    var y = 0;
    var $curDiv = $list_div.eq(curIndex);
    var $preDiv = $list_div.eq(preIndex);
    var $curLi = $list_li.eq(curIndex);
    var $dom = $preDiv.clone(false);
    if (isHorizontal) {
      x = prePos.left - curPos.left;
      $dom.css({
        '-webkit-transform': 'translateX(' + x + 'px)',
        'transform': 'translateX(' + x + 'px)',
        'z-index': 2,
      });
      $dom.css();
    } else {
      y = prePos.top - curPos.top;
      $dom.css({
        '-webkit-transform': 'translateY(' + y + 'px)',
        'transform': 'translateY(' + y + 'px)',
        'z-index': 2,
      });
    }
    $curDiv.hide();
    $curLi.prepend($dom);
    Anim(x || y, 0, this._animTime, 'Linear', (function(val, isEnd) {
      if (isEnd) {
        $curDiv.show();
        setTimeout(function() {
          $dom.remove();
        });
        return;
      }
      if (isHorizontal) {
        $dom.css({
          '-webkit-transform': 'translateX(' + val + 'px)',
          'transform': 'translateX(' + val + 'px)',
        });
      } else {
        $dom.css({
          '-webkit-transform': 'translateY(' + val + 'px)',
          'transform': 'translateY(' + val + 'px)',
        });
      }
    }).bind(this));
  }

  // 正向动画(某列向下/某行向右)
  this._animateForward = function(items) {
    if (!this._curItems[items[0]]) {
      return;
    }
    var isHorizontal = Math.abs(items[1] - items[0]) === 1;
    var curIndex = 0;       // items 的项，即 _curItems 的下标
    var curItem = 0;        // _curItems 的项
    var preIndex_1 = 0;     // items 的项，即 _preItems 的下标
    var preItem_1 = 0;      // _preItems 的项
    var preIndex_2 = 0;     // items 的项，即 _preItems 的下标
    var preItem_2 = 0;      // _preItems 的项
    var i = 0;
    var j = 0;
    var len = items.length;

    for (; i < len && j < len;) {
      if (!curItem) {
        curIndex = items[i];
        curItem = this._curItems[curIndex];
        if (!curItem) {
          i++;
          continue;
        }
      }
      if (!preItem_1) {
        preIndex_1 = items[j];
        preItem_1 = this._preItems[preIndex_1];
        if (!preItem_1) {
          j++;
          continue;
        }
      }
      if (curItem === preItem_1) {
        this._animateCell(curIndex, preIndex_1, isHorizontal);
        curItem = 0;
        preItem_1 = preItem_2 = 0;
        i++;
        j++;
        continue;
      }
      if (!preItem_2) {
        j++;            // 先指向下一个
        preIndex_2 = items[j];
        preItem_2 = this._preItems[preIndex_2];
        if (!preItem_2) {
          continue;
        }
      }
      this._animateCell(curIndex, preIndex_2, isHorizontal);
      this._animateCell(curIndex, preIndex_1, isHorizontal);
      curItem = 0;
      preItem_1 = preItem_2 = 0;
      i++;
      j++;
    }
  }

  // 滑动后的动画
  this._animateCells = function() {
    var items = [];
    switch (this._curDirection) {
      case this.LEFT:
      case this.RIGHT:
        for (var i = 0; i < this._rows; i++) {
          items.length = 0;
          for (var j = 0; j < this._cols; j++) {
            items.push(i * this._cols + j);
          }
          if (this._curDirection === this.RIGHT) {
            items.reverse();
          }
          this._animateForward(items);
        }
        break;
      case this.UP:
      case this.DOWN:
        for (var j = 0; j < this._cols; j++) {
          items.length = 0;
          for (var i = 0; i < this._rows; i++) {
            items.push(i * this._cols + j);
          }
          if (this._curDirection === this.DOWN) {
            items.reverse();
          }
          this._animateForward(items);
        }
        break;
    }
  }

  // 把数组的数字渲染到对应的 DOM 上
  this._render = function(cb) {
    var i = 0;
    var len = this._curItems.length;
    var curItem = 0;
    if (this._curDirection) {   // 如果有滑动方向
      this._animateCells();
    }
    for (; i < len; i++) {
      curItem = this._curItems[i]
      if (this._preItems[i] === curItem) {
        continue;
      }
      this._preItems[i] = curItem;
      $list_div.eq(i)
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
  this._fillOneCell = function(i, num) {
    var index = 0;
    if (i < 0) {
      i = Utils.getRandomAmongScope(0, this._emptyCells.length - 1);
    }
    index = this._emptyCells[i];

    this._curItems[index] = num;
    this._curDirection = 0;       // 渲染前先重置移动方向
    var delayTime = this.animTime + 50;
    this._render(function() {
      var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
      $list_div.eq(index)
        .off(animationEnd)
        .css({
          '-webkit-animate-delay': delayTime + 'ms',
          'animate-delay': delayTime + 'ms',
        })
        .addClass('item-emerge')
        .one(animationEnd, function() {
          $(this).removeClass('item-emerge');
        });
    });
    
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

  this._updateMaxItem = function(num) {
    if (this._maxItem >= num) {
      return;
    }
    this._maxItem = num;
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
        this._updateMaxItem(pre * 2);
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

  // 移动后
  this._moveDone = function() {
    this._render();
    this._filterEmptyCells();
    this._fillOneCell(-1, 2);
    this._affirmMoveDirection();
    if (this._maxItem === 2048) {
      // console.log('恭喜你！成功到达 2048！');
    }
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
  this.moveHorizontal = function(direction) {
    if (this._moveLocked) {
      return;
    }
    this._moveLocked = true;      // 先锁上
    this._curDirection = direction;

    var items = [];
    for (var i = 0; i < this._rows; i++) {
      items.length = 0;
      for (var j = 0; j < this._cols; j++) {
        items.push(this._curItems[i * this._cols + j]);
      }
      if (direction === this.LEFT) {
        items.reverse();
        items = this._moveForward(items);
        items.reverse();
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
  this.moveVertical = function(direction) {
    if (this._moveLocked) {
      return;
    }
    this._moveLocked = true;      // 先锁上
    this._curDirection = direction;

    var items = [];
    for (var j = 0; j < this._cols; j++) {
      items.length = 0;
      for (var i = 0; i < this._rows; i++) {
        items.push(this._curItems[i * this._cols + j]);
      }
      if (direction === this.UP) {
        items.reverse();
        items = this._moveForward(items);
        items.reverse();
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
      case game.LEFT:
        if (!game.canMoveLeft) {
          break;
        }
        game.moveHorizontal(game.LEFT);
        break;
      case game.RIGHT:
        if (!game.canMoveRight) {
          break;
        }
        game.moveHorizontal(game.RIGHT);
        break;
      case game.UP:
        if (!game.canMoveUp) {
          break;
        }
        game.moveVertical(game.UP);
        break;
      case game.DOWN:
        if (!game.canMoveDown) {
          break;
        }
        game.moveVertical(game.DOWN);
        break;
    }
  }

  // 往左滑
  $container.on('swipeLeft', function(event) {
    swipeListener(game.LEFT);
  });
  
  // 往右滑
  $container.on('swipeRight', function(event) {
    swipeListener(game.RIGHT);
  });
  
  // 往上滑
  $container.on('swipeUp', function(event) {
    swipeListener(game.UP);
  });
  
  // 往下滑
  $container.on('swipeDown', function(event) {
    swipeListener(game.DOWN);
  });


  // 游戏正式开始
  game.init();
};
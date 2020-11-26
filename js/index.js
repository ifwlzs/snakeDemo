var sw = 20, //一个方块的宽
	sh = 20,
	tr = 30, //行数
	td = 30;
//蛇和食物的实例
var snake = null,
	food = null,
	game = null,
	speed = 200,
	speedVariance = 2;
//简单的速度差为200，普通的速度差为100，困难的速度差为50

function Square(x, y, classname) {
	this.x = x * sw;
	this.y = y * sh;
	this.class = classname;
	//方块队形的DOM元素
	this.viewContent = document.createElement('div');
	this.viewContent.className = this.class;
	//方块的父级
	this.parent = document.getElementById('snakeWrap');

}
//创建方块DOM
Square.prototype.create = function() {
	this.viewContent.style.position = 'absolute';
	this.viewContent.style.width = sw + 'px';
	this.viewContent.style.height = sh + 'px';
	this.viewContent.style.left = this.x + 'px';
	this.viewContent.style.top = this.y + 'px';
	//dom的append方法 把方块添加到页面中
	this.parent.appendChild(this.viewContent);
};
//删除方块DOM
Square.prototype.remove = function() {
	this.parent.removeChild(this.viewContent);
}
//蛇
function Snake() {
	//蛇头的信息
	this.head = null;
	//蛇身方块的位置
	this.pos = []
	//蛇尾的信息
	this.tail = null;
	//蛇走的方向，用一个对象来表示
	this.directionNum = {
		left: {
			x: -1,
			y: 0,
			rotate: 180 //旋转蛇头
		},
		right: {
			x: 1,
			y: 0,
			rotate: 0
		},
		up: {
			x: 0,
			y: -1,
			rotate: -90
		},
		down: {
			x: 0,
			y: 1,
			rotate: 90
		}
	}
}
//初始化
Snake.prototype.init = function() {
	//创建蛇头
	var snakeHead = new Square(2, 0, 'snakeHead');
	snakeHead.create();
	//存储蛇头信息
	this.head = snakeHead;
	this.pos.push([2, 0]);
	//蛇身
	var snakeBody = new Square(1, 0, 'snakeBody');
	snakeBody.create();
	this.pos.push([1, 0]);
	//蛇尾
	var snakeTail = new Square(0, 0, 'snakeBody');
	snakeTail.create();
	this.tail = snakeTail;
	this.pos.push([0, 0]);

	//形成链表关系，实现蛇的整体运动
	snakeHead.last = null;
	snakeHead.next = snakeBody;
	snakeBody.last = snakeHead;
	snakeBody.next = snakeTail;
	snakeTail.last = snakeBody;
	snakeTail.next = null;

	//给蛇添加一条属性，用来表示蛇走的方向， 默认向右
	this.direction = this.directionNum.right;
}
//获取蛇头的下个位置
Snake.prototype.getNextPos = function() {

	var nextPos = [
		this.head.x / sw + this.direction.x,
		this.head.y / sh + this.direction.y
	]
	//下个点是自己，代表撞到了自己，游戏结束
	var selfCollied = false;
	this.pos.forEach(function(value) {
		if(value[0] == nextPos[0] && value[1] == nextPos[1]) {
			//如果数组中的两个数据都相等，就
			selfCollied = true;
		}
	});
	if(selfCollied) {
		//console.log('撞到自己了');
		this.strategies.die.call(this);
		return;
	}

	//下个点是墙，代表撞到了墙，游戏结束
	if(nextPos[0] < 0 || nextPos[0] >= td || nextPos[1] < 0 || nextPos[1] >= tr) {
		//console.log('撞墙了')
		this.strategies.die.call(this);
		return;
	}
	//下个点是食物，身体++
	if(food && food.pos[0] == nextPos[0] && food.pos[1] == nextPos[1]) {
		//如果这个条件成立说明现在蛇头要走的下一个点是食物的那个点
		//console.log('撞到食物了！');
		this.strategies.eat.call(this);
		return;
	}
	//下个点啥都没有，走

	//this.strategies.move.call(this, false);
	this.strategies.move.call(this);
};

//游戏结束
Snake.prototype.strategies = {
	//format用于判断蛇尾是否需要删除,删除为0
	move: function(format) {
		//创建新的身体到旧蛇头的位置
		var newBody = new Square(this.head.x / sw, this.head.y / sh, 'snakeBody');
		//更新链表的关系
		newBody.next = this.head.next;
		newBody.next.last = newBody;
		newBody.last = null;
		//删除旧蛇头
		this.head.remove();
		newBody.create();
		//蛇头生成点
		var newHead = new Square(this.head.x / sw + this.direction.x,
			this.head.y / sh + this.direction.y, 'snakeHead');
		newHead.create();
		//更新蛇头存储
		newHead.next = newBody;
		newHead.last = null;
		newBody.last = newHead;
		newHead.viewContent.style.transform = 'rotate(' + this.direction.rotate + 'deg)';
		newHead.create();
		//pos数组更新
		this.pos.splice(0, 0, [this.head.x / sw + this.direction.x,
			this.head.y / sh + this.direction.y
		]);
		//更新头的数据
		this.head = newHead;
		if(!format) {
			this.tail.remove();
			this.tail = this.tail.last;
			this.pos.pop();
		}

	},
	eat: function() {
		this.strategies.move.call(this, true);
		createFood();
		game.score++;
		if(game.score >= game.highScore) {
			game.highScore = game.score;
			document.getElementById('highScore').innerText = game.highScore;
		}
		document.getElementById('score').innerText = game.score;
		//吃到食物后，进行加速，加速规则为基础速度-间隔
		game.level = Math.floor(game.score / 3);
		document.getElementById('level').innerText = game.level;
		speed -= speedVariance
		//console.log(game.level);
		//console.log(speed);
		game.pause();
		game.start(speed);
	},
	die: function() {
		//console.log('die');
		game.over();
	}
}
snake = new Snake();

//创建食物
function createFood() {
	var x = null,
		y = null;
	//判读食物坐标是否在蛇的身上
	var include = true;
	while(include) {
		x = Math.round(Math.random() * (td - 1));
		y = Math.round(Math.random() * (tr - 1));
		snake.pos.forEach(function(value) {
			if(x != value[0] && y != value[1]) {
				include = false;
			}
		});

	}

	food = new Square(x, y, 'food');
	//存储食物的坐标
	food.pos = [x, y];
	//判断场上有无食物，有就直接改坐标
	var foodDom = document.querySelector('.food');
	if(foodDom) {
		console.log(foodDom);
		foodDom.style.left = x * sw + 'px';
		foodDom.style.top = y * sh + 'px';
	} else {
		food.create();
	}

}

function Game() {
	this.timer = null;
	this.score = 0;
	this.highScore;
	this.level = 0;
}
Game.prototype.init = function() {

	snake.init();
	createFood();
	//开始游戏后 锁住困难选择选项，直到游戏结束
	document.querySelector('#select').disabled = true
	//设置速度200 100 50
	if(document.querySelector('#select').selectedIndex == 1) {
		speed = 100;
	}
	if(document.querySelector('#select').selectedIndex == 2) {
		speed = 50;
	}
	console.log(speedVariance)
	document.onkeydown = function(ev) {
		//按下左键.且蛇不往右
		if(ev.which == 37 && snake.direction != snake.directionNum.right) {
			snake.direction = snake.directionNum.left;
		} else if(ev.which == 38 && snake.direction != snake.directionNum.down) {
			snake.direction = snake.directionNum.up;
		} else if(ev.which == 39 && snake.direction != snake.directionNum.left) {
			snake.direction = snake.directionNum.right;
		} else if(ev.which == 40 && snake.direction != snake.directionNum.up) {
			snake.direction = snake.directionNum.down;
		}
	}
	this.start(speed);
}
Game.prototype.start = function(speed) {
	this.timer = setInterval(function() {
		snake.getNextPos();
	}, speed);
}
Game.prototype.pause = function() {
	clearInterval(this.timer);
}
Game.prototype.over = function() {
	clearInterval(this.timer);
	alert('你顺利的通过了' + this.level + '关,你的得分为' + this.score)
	document.getElementById('score').innerText = 0;
	if(localStorage.snakeHighScore < game.highScore) {
		localStorage.snakeHighScore = game.highScore
		document.getElementById('highScore').innerText = localStorage.snakeHighScore;
	}
	document.querySelector('#select').disabled = false
	var snakeWrap = document.getElementById('snakeWrap');
	snakeWrap.innerHTML = '';
	snake = new Snake();
	game = new Game();

	game.highScore = localStorage.snakeHighScore;
	var startBtnWrap = document.querySelector('.startBtn');
	startBtnWrap.style.display = 'block';
}
//开启游戏
game = new Game();
var startBtn = document.querySelector('.startBtn button');
startBtn.onclick = function() {
	startBtn.parentNode.style.display = 'none';
	game.init();
};

//暂停
var snakeWrap = document.getElementById('snakeWrap');
var pauseBtn = document.querySelector('.pauseBtn button');
snakeWrap.onclick = function() {
	game.pause();
	pauseBtn.parentNode.style.display = 'block';
}
pauseBtn.onclick = function() {
	game.start(speed);
	pauseBtn.parentNode.style.display = 'none';
}
//判断本地是否有snakeHighScore的值，没有就手动赋值为0，有就显示到页面中
if(typeof(localStorage.snakeHighScore) == "undefined" || localStorage.snakeHighScore == undefined) {
	localStorage.snakeHighScore = 0;
	//console.log(localStorage.snakeHighScore);
	document.getElementById('highScore').innerText = localStorage.snakeHighScore;
	game.highScore = 0;
} else {
	game.highScore = localStorage.snakeHighScore;
	document.getElementById('highScore').innerText = localStorage.snakeHighScore;
}
//console.log(speed)
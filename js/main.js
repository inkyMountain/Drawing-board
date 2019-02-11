var context = canvas.getContext("2d");
canvasAutoFit();
context.lineWidth = 4;
var istouchsupported = "ontouchstart" in window;
var using = false;  //判断是否在使用画板
var points = [];  //存储鼠标运动时，经过的点。
var dateValues = [];  //存储date对象，原计划用于判断鼠标运动速度。太麻烦了，就没弄了。
var moveCount = 0;  //用于计数鼠标移动时产生的点的数量
var point = function (x, y) {  //定义点对象
    this.x = x;
    this.y = y;
    this.alter = ((point)=> {
        this.x = point.x;
        this.y = point.y;
    })
}
var EVENTS = {
    POINTER_DOWN : istouchsupported ? 'touchstart' : 'mousedown',
    POINTER_UP   : istouchsupported ? 'touchend'   : 'mouseup',
    POINTER_MOVE : istouchsupported ? 'touchmove'  : 'mousemove'
};
listenPointer(canvas);






//----------------------------函数封装--------------------------------------------------------------------------

/**
 * 监听鼠标或触摸事件，包括down，move，up三种状态。EVENTS对象用于判断设备是否支持触摸。
 * @param {需要监听的目标节点} aim 
 */
function listenPointer(aim) {
    aim.addEventListener(EVENTS.POINTER_DOWN, (event) => {
        using = !using;
        points.push(
        new point(istouchsupported? event.changedTouches[0].screenX: event.clientX,
            istouchsupported? event.changedTouches[0].screenY: event.clientY)
        );
        drawCircle(points[0], context.lineWidth/2.5);
        console.log(EVENTS.POINTER_DOWN);
    });

    aim.addEventListener(EVENTS.POINTER_MOVE, (event) => {
        console.log(event);
        if (!using) {return;};
        if (points.length >= 2) {
            points.shift();
        };
        points.push(
            new point(istouchsupported? event.changedTouches[0].screenX: event.clientX,
                istouchsupported? event.changedTouches[0].screenY: event.clientY)
            );
            if (context.lineWidth < 5) {
                drawLine(points[0], points[1]);
            }else{
                drawDotLine(points[0], points[1]);
            };
        console.log(EVENTS.POINTER_MOVE);
    });
    aim.addEventListener(EVENTS.POINTER_UP, (event) => {
        if (!using) {
            return;
        };
        points[1].x = istouchsupported? event.changedTouches[0]: event.clientX;
        points[1].y = istouchsupported? event.changedTouches[0]: event.clientY;
        drawLine(points[0], points[1]);
        drawCircle(points[1], context.lineWidth/2.5);
        console.log(EVENTS.POINTER_UP);
        using = !using;
        points = [];
        });
    };
    

/**
 * 画一条直线
 * @param {起始点} fromPoint 
 * @param {终点} toPoint 
 */
function drawLine(fromPoint, toPoint) {
    context.beginPath();
    // context.lineWidth = styles.width;
    context.moveTo(fromPoint.x, fromPoint.y);
    context.lineTo(toPoint.x, toPoint.y);
    context.stroke();
}

/**
 * 画一个圆
 * @param {圆心} centerPoint 
 * @param {半径} radius 
 */
function drawCircle(centerPoint, radius) {
    context.beginPath();
    // context.lineWidth = styles.width;
    context.arc(centerPoint.x, centerPoint.y, radius, 0, Math.PI*2, true);
    context.fill();
}
/**
 * 画一条贝塞尔曲线
 * @param {起始点} fromPoint 
 * @param {参考点1} cpPoint1 
 * @param {参考点2} cpPoint2 
 * @param {终点} toPoint 
 */
function drawCurve(fromPoint, cpPoint1, cpPoint2, toPoint) {
    context.beginPath();
    context.moveTo(fromPoint.x, fromPoint.y);
    context.bezierCurveTo(cpPoint1.x, cpPoint1.y, cpPoint2.x, cpPoint2.y, toPoint.x, toPoint.y);
    context.stroke();
}

/**
 * 提供两个点，在两点之间画出较多的圆点，成一条直线。
 * @param {起始点} fromPoint 
 * @param {终点} toPoint 
 */
function drawDotLine(fromPoint, toPoint) {  //把mousemove两个点之间，用较多的圆点填充，直到变成一根直线。
    var midPoints = [];
    var length = calculatepathLength(fromPoint, toPoint);
    var part = parseInt(length) / context.lineWidth * 80;
    var intervalX = (toPoint.x - fromPoint.x) / part;
    var intervalY = (toPoint.y - fromPoint.y) / part;
    midPoints.push(fromPoint);
    for (let i = 1; i <= part; i++) {
        midPoints.push(new point(fromPoint.x + intervalX * i, fromPoint.y + intervalY*i));
    };
    midPoints.push(toPoint);
    for (let i = 0; i < midPoints.length; i++) {
        drawCircle(midPoints[i], context.lineWidth / 2);
    }
}
/**
 * 与上个函数类似
 * @param {起始点} fromPoint 
 * @param {终点} toPoint 
 */
function fastDotLine(fromPoint, toPoint) {  //尝试优化drawDotLine，把靠近两点的地方用点画，中间部分直接用直线。
    var midPoints = [];
    var length = calculatepathLength(fromPoint, toPoint);
    var part = parseInt(length) / context.lineWidth;
    var intervalX = (toPoint.x - fromPoint.x) / part;
    var intervalY = (toPoint.y - fromPoint.y) / part;
    midPoints.push(fromPoint);
    for (let i = 1; i <= part; i++) {
        midPoints.push(new point(fromPoint.x + intervalX * i, fromPoint.y + intervalY*i));
    };
    midPoints.push(toPoint);
    drawDotLine(midPoints[0], midPoints[2]);
    drawDotLine(midPoints[midPoints.length - 3], midPoints[midPoints.length - 1]);
    drawLine(midPoints[2],midPoints[midPoints.length - 3]);
}

/**
 * 自动调整Canvas大小。刚调用时调整一次，并监听resize事件
 */
function canvasAutoFit() {
    canvasResize();
    window.onresize = (() => {
        canvasResize();
    })
    function canvasResize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
}
/**
 * 计算两点之间的直线距离  但是上面没有用到这个函数。
 * @param {起始点} lastPoint 
 * @param {终点} currentPoint 
 */
function calculatepathLength(lastPoint, currentPoint) {  //计算两点之间的长度
    let width = Math.abs(currentPoint.x - lastPoint.x);
    let height = Math.abs(currentPoint.y - lastPoint.y);
    let pathLength = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
    return pathLength;
}


/**
 * 计算从一点到另外一点的速度  但是上面没有用到这个函数。
 * @param {起始点} fromPoint 
 * @param {终点} toPoint 
 * @param {起始点毫秒值} startValue 
 * @param {终点毫秒值} endValue 
 */
function speed(fromPoint, toPoint, startValue, endValue) {  //计算两点速度
    return calculatepathLength(fromPoint, toPoint)/(endValue - startValue)*1000;
}


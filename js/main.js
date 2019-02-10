canvasAutoFit();
var context = canvas.getContext("2d");
context.lineWidth = 20;
var istouchsupported = "ontouchstart" in window;
var using = false;
var points = [];
var moveCount = 0;
var point = function (x, y) {
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
 * 监听鼠标或触摸事件。结合EVENTS对象，自动判断设备是否支持触摸。
 * @param {需要监听的目标节点} aim 
 */
function listenPointer(aim) {
    aim.addEventListener(
        EVENTS.POINTER_DOWN, (event) => {
            using = !using; 
            points.push(  
                new point(istouchsupported? event.touches[0].screenX: event.clientX,
                    istouchsupported? event.touches[0].screenY: event.clientY)
            );
            console.log(EVENTS.POINTER_DOWN);
            // console.log(event);
        });
        aim.addEventListener(
            EVENTS.POINTER_MOVE, (event) => {
                if (!using) {
                    return;
                };
                if (points.length >= 2) {
                    points.shift();
                };
                points.push(  
                    new point(istouchsupported? event.touches[0].screenX: event.clientX,
                        istouchsupported? event.touches[0].screenY: event.clientY)
                );
                drawDotLine(points[0], points[1]);
                console.log(EVENTS.POINTER_MOVE);
            // console.log(event);
        });
    aim.addEventListener(
        EVENTS.POINTER_UP, (event) => {
            if (!using) {
                return;
            };
            // console.log(event);
            points[1].x = istouchsupported? "stop": event.clientX;
            points[1].y = istouchsupported? "stop": event.clientY;
            if (points[1].x === "stop") {
                using = !using;
                points = [];
                return;
            }
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

function drawCircle(centerPoint, radius) {
    context.beginPath();
    // context.lineWidth = styles.width;
    context.arc(centerPoint.x, centerPoint.y, radius, 0, Math.PI*2, true);
    context.fill();
}

function drawCurve(fromPoint, cpPoint, toPoint) {
    context.beginPath();
    context.moveTo(fromPoint.x, fromPoint.y);
    context.quadraticCurveTo(cpPoint.x, cpPoint.y, toPoint.x, toPoint.y);
    context.stroke();
}

function drawDotLine(fromPoint, toPoint) {
    var midPoints = [];
    var length = calculatepathLength(fromPoint, toPoint);
    var part = parseInt(length) / context.lineWidth * 100;
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

function calculatepathLength(lastPoint, currentPoint) {
    let width = Math.abs(currentPoint.x - lastPoint.x);
    let height = Math.abs(currentPoint.y - lastPoint.y);
    let pathLength = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
    return pathLength;
}


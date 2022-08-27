import React from "react"
import store from './model'
import { actions } from './model'
import { OPRATION } from './model'
import '../overlays/Overlay.css'

export class Canvas extends React.Component {
    margins = [];
    safeRect = {}
    withBleedRect = {}

    render() {
        return (
            <canvas ref={this.canvas} className="canvas" width={"600px"} height={"600px"}></canvas>
        )
    }

    constructor() {
        super()
        this.canvas = React.createRef()
        this.downX = 0
        this.downX = 0
        this.downY = 0
        this.upX = 0
        this.upY = 0

        this.isMouseDown = false
        this.state = store.getState()
        store.subscribe(() => {
            this.setState(store.getState())
        })

    }


    componentDidMount() {
        /** @type {HTMLCanvasElement} */
        const canvas = this.canvas.current
        const context = canvas.getContext('2d')
        context.strokeStyle = "#FF0000"
        context.lineWidth = 1

        // context.strokeRect(5, 5, canvas.width - 10, canvas.height - 10)
        console.log("canvas w=", canvas.width, "canvas height = ", canvas.height)
        var rect = {
            left: 0,
            top: 0,
            width: 0,
            height: 0,
        }

        const slop = 10
        var HANDLE = {
            NEW: "0",
            LEFT: "1",
            TOP: "2",
            RIGHT: "3",
            BOTTOM: "4",
            MOVE: "5"
        }

        var handle = HANDLE.NEW


        var downRect
        var currentRect


        canvas.onmousedown = (e) => {
            this.isMouseDown = true
            this.downX = e.offsetX
            this.downY = e.offsetY

            downRect = { ...rect }

            switch (this.state.opration) {
                case OPRATION.CONTENT_RECT:
                    this.handle = checkHandle(e)
                    break;
                case OPRATION.LEFT_TOP:
                    this.margins[0] = this.downX
                    this.margins[1] = this.downY
                    break;
                case OPRATION.RIGHT_TOP:
                    this.margins[2] = this.downX
                    this.margins[3] = this.downY
                    break;
                case OPRATION.RIGHT_BOTTOM:
                    this.margins[4] = this.downX
                    this.margins[5] = this.downY
                    break;
                case OPRATION.LEFT_BOTTOM:
                    this.margins[6] = this.downX
                    this.margins[7] = this.downY
                    break;


            }


        }

        function mapRectInImage(imageWidth, imageHeight, canvasWidth, canvasHeight, rect) {
            let rectInImage = {}
            if (imageHeight / imageWidth > canvasHeight / canvasWidth) {
                let scale = (imageHeight / canvasHeight)
                rectInImage.left = (rect.left - (canvasWidth - imageWidth / imageHeight * canvasWidth) / 2) * scale
                rectInImage.top = rect.top * scale
                rectInImage.right = (rect.left + rect.width - (canvasWidth - imageWidth / imageHeight * canvasWidth) / 2) * scale
                rectInImage.bottom = (rect.top + rect.height) * scale

            } else {
                let scale = (imageWidth / canvasWidth)
                rectInImage.left = rect.left * scale
                rectInImage.top = (rect.top - (canvasHeight - imageHeight / imageWidth * canvasHeight) / 2) * scale
                rectInImage.right = (rect.left + rect.width) * scale
                rectInImage.bottom = (rect.top + rect.height - (canvasHeight - imageHeight / imageWidth * canvasHeight) / 2) * scale
            }
            return rectInImage;
        }

        function mapPointInImage(imageWidth, imageHeight, canvasWidth, canvasHeight, point) {
            let pointInImage = []
            if (imageHeight / imageWidth > canvasHeight / canvasWidth) {
                let scale = (imageHeight / canvasHeight)
                pointInImage[0] = (point[0] - (canvasWidth - imageWidth / imageHeight * canvasWidth) / 2) * scale
                pointInImage[1] = point[1] * scale

            } else {
                let scale = (imageWidth / canvasWidth)
                pointInImage[0] = point[0] * scale
                pointInImage[1] = (point[1] - (canvasHeight - imageHeight / imageWidth * canvasHeight) / 2) * scale

            }
            return pointInImage;
        }

        const updateJSon = () => {
            let json = {}
            json.width = this.state.image.width
            json.height = this.state.image.height
            let rect = this.withBleedRect
            let imageWidth = this.state.image.width
            let imageHeight = this.state.image.height
            let canvasWidth = this.canvas.current.width
            let canvasHeight = this.canvas.current.height
            //image is thinner than canvas
            let reactWidthBleedingInImage = mapRectInImage(imageWidth, imageHeight, canvasWidth, canvasHeight, rect)
            json.left = reactWidthBleedingInImage.left - 1
            json.top = reactWidthBleedingInImage.top - 1
            json.right = reactWidthBleedingInImage.right + 1
            json.bottom = reactWidthBleedingInImage.bottom + 1
            json.margins = []

            let safeRectInImage = mapRectInImage(imageWidth, imageHeight, canvasWidth, canvasHeight, this.safeRect)
            // let safeRectInImage = mapRectInImage()
            let mappedMargin = []
            spliceArr(this.margins, 2).forEach((point, index) => {
                let pointInImage = mapPointInImage(imageWidth, imageHeight, canvasWidth, canvasHeight, point)
                mappedMargin[index * 2] = pointInImage[0]
                mappedMargin[index * 2 + 1] = pointInImage[1]
            })
            mappedMargin.forEach((number, index) => {
                switch (index) {
                    case 0:
                        json.margins[0] = number - safeRectInImage.left
                        break;
                    case 1:
                        json.margins[1] = number - safeRectInImage.top
                        break;
                    case 2:
                        json.margins[2] = number - safeRectInImage.right
                        break;
                    case 3:
                        json.margins[3] = number - safeRectInImage.top
                        break;
                    case 4:
                        json.margins[4] = number - safeRectInImage.right
                        break;
                    case 5:
                        json.margins[5] = number - safeRectInImage.bottom
                        break;
                    case 6:
                        json.margins[6] = number - safeRectInImage.left
                        break;
                    case 7:
                        json.margins[7] = number - safeRectInImage.bottom
                        break;
                }

            })
            if (json.margins.length == 0) {
                json.margins = [0, 0, 0, 0, 0, 0, 0, 0]
            }
            Object.keys(json).forEach((key) => {
                if (!isNaN(json[key])) {
                    json[key] = Math.round(json[key])
                }
                if ("margins" == key) {
                    let margins = json[key]
                    for (let i = 0; i < margins.length; i++) {
                        margins[i] = Math.round(margins[i])
                    }
                }

            })
            store.dispatch(actions.updateJson(JSON.stringify(json)))

        }

        function checkHandle(e) {
            if (e.offsetY >= rect.top && e.offsetY <= (rect.top + rect.height)) {
                if (Math.abs(e.offsetX - rect.left) < slop) {
                    return HANDLE.LEFT
                } else if (Math.abs(e.offsetX - (rect.left + rect.width)) < slop) {
                    return HANDLE.RIGHT
                } else if (Math.abs(e.offsetY - rect.top) < slop) {
                    return HANDLE.TOP
                } else if (Math.abs(e.offsetY - (rect.top + rect.height)) < slop) {
                    return HANDLE.BOTTOM
                } else if (e.offsetX > rect.left && e.offsetX < rect.left + rect.width) {
                    return HANDLE.MOVE
                }
            } else if (e.offsetX >= rect.left && e.offsetX <= (rect.left + rect.width)) {
                if (Math.abs(e.offsetY - rect.top) < slop) {
                    return HANDLE.TOP
                } else if (Math.abs(e.offsetY - (rect.top + rect.height)) < slop) {
                    return HANDLE.BOTTOM
                } else if (Math.abs(e.offsetX - rect.left) < slop) {
                    return HANDLE.LEFT
                } else if (Math.abs(e.offsetX - (rect.left + rect.width)) < slop) {
                    return HANDLE.RIGHT
                } else if (e.offsetY > rect.top && e.offsetY < rect.top + rect.height) {
                    return HANDLE.MOVE
                }
            } else {
                return HANDLE.NEW
            }
        }

        const updateNewRect = (e) => {
            rect.left = this.downX;
            rect.top = this.downY;
            rect.width = e.offsetX - this.downX;
            if (this.state.ratio != 0) {
                rect.height = rect.width / this.state.ratio;
            } else {
                rect.height = e.offsetY - this.downY
            }

            drawMove(context, rect);
        }

        const handleLeft = (e) => {
            rect.left = e.offsetX;
            rect.width = downRect.width + (this.downX - e.offsetX);
            if (this.state.ratio != 0) {
                rect.height = rect.width / this.state.ratio;
            } else {
                rect.height = downRect.height + e.offsetY - this.downY;
            }
            drawMove(context, rect);
        }
        const handleRight = (e) => {
            rect.width = downRect.width + (e.offsetX - this.downX);
            if (this.state.ratio != 0) {
                rect.height = rect.width / this.state.ratio;
            } else {
                rect.height = downRect.height + e.offsetY - this.downY;
            }
            rect.left = e.offsetX - rect.width
            drawMove(context, rect);

        }

        const handleTop = (e) => {
            rect.top = e.offsetY;
            rect.height = downRect.height + (this.downY - e.offsetY);
            if (this.state.ratio != 0) {
                rect.width = rect.height * this.state.ratio;
            } else {
                rect.width = downRect.width + e.offsetX - this.downX;
            }
            drawMove(context, rect);
        }

        const handleBottom = (e) => {
            rect.height = downRect.height + (e.offsetY - this.downY);
            if (this.state.ratio != 0) {
                rect.width = rect.height * this.state.ratio;
            } else {
                rect.width = downRect.width + e.offsetX - this.downX;
            }
            rect.top = e.offsetY - rect.height
            drawMove(context, rect);

        }

        const handleMoveByKeyBoard = (e) => {
            console.log(e)
            // eslint-disable-next-line default-case 
            switch (e.key) {
                case "ArrowLeft":
                    rect.left = rect.left - 1
                    rect.right = rect.right - 1
                    drawMove(context, rect)
                    break;
                case "ArrowRight":
                    rect.left = rect.left + 1
                    rect.right = rect.right + 1
                    drawMove(context, rect)
                    break;
                case "ArrowUp":
                    rect.top = rect.top - 1
                    rect.bottom = rect.bottom - 1
                    drawMove(context, rect)
                    break;
                case "ArrowDown":
                    rect.top = rect.top + 1
                    rect.bottom = rect.bottom + 1
                    drawMove(context, rect)
                    break;


            }
        }

        const handleMove = (e) => {
            rect.left = downRect.left + (e.offsetX - this.downX)
            rect.top = downRect.top + (e.offsetY - this.downY)
            rect.width = downRect.width
            rect.height = downRect.height
            drawMove(context, rect);
        }



        canvas.onmouseout = (e) => {
            this.isMouseDown = false
        }
        canvas.onmousemove = (e) => {
            if (this.isMouseDown && this.state.opration == OPRATION.CONTENT_RECT) {
                if (this.handle == HANDLE.LEFT) {
                    handleLeft(e);
                } else if (this.handle == HANDLE.RIGHT) {
                    handleRight(e)
                } else if (this.handle == HANDLE.TOP) {
                    handleTop(e)
                } else if (this.handle == HANDLE.BOTTOM) {
                    handleBottom(e)
                } else if (this.handle == HANDLE.MOVE) {
                    handleMove(e)
                } else {
                    updateNewRect(e);
                }


            }


        }

        document.onkeydown = (e) => {
            handleMoveByKeyBoard(e)


        }

        canvas.onmouseup = (e) => {
            this.isMouseDown = false
            //updateJSon()
            drawState(context)

        }

        const drawMove = (draw, rect) => {
            this.safeRect = { ...rect }
            if (this.state.ratio == 0) {
                this.withBleedRect = { ...this.safeRect }
            } else {
                this.withBleedRect.left = this.safeRect.left - (this.safeRect.width / this.state.w * this.state.bw)
                this.withBleedRect.top = this.safeRect.top - (this.safeRect.height / this.state.h * this.state.bh)
                this.withBleedRect.width = (this.safeRect.width / this.state.w) * (Number.parseFloat(this.state.w) + this.state.bw * 2)
                this.withBleedRect.height = (this.safeRect.height / this.state.h) * (Number.parseFloat(this.state.h) + this.state.bh * 2)
            }

            drawState(draw)
        }

        const drawState = (draw) => {
            updateJSon()
            context.clearRect(0, 0, canvas.width, canvas.height)
            drawRect(draw, this.withBleedRect)
            drawRect(draw, this.safeRect)
            spliceArr(this.margins, 2).map(
                (point) => {
                    draw.fillRect(point[0], point[1], 2, 2)
                    
                }
            )
        }
        
        const drawRect = (context, rect) => {

            context.strokeRect(rect.left - 1, rect.top - 1, rect.width + 2, rect.height + 2)
            
        }


        var spliceArr = function (arr, num) {
            let reArr = []
            arr.map(item => {
                if (!reArr[reArr.length - 1] || reArr[reArr.length - 1].length === num) { // 新行添加
                    reArr.push([])
                }

                if (reArr[reArr.length - 1].length !== num) { // 长度不够则添加
                    reArr[reArr.length - 1].push(item)
                }

            })
            return reArr
        }
    }


}

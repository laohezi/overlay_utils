import React from "react"
import store from './model'
import { actions } from './model'
import { OPRATION } from './model'
import '../overlays/Overlay.css'
import { type } from "@testing-library/user-event/dist/type"

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

        var keystep = 0.25







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
            json.left = reactWidthBleedingInImage.left
            json.top = reactWidthBleedingInImage.top 
            json.right = reactWidthBleedingInImage.right
            json.bottom = reactWidthBleedingInImage.bottom 
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

        /**
         * 
         * @param {import("react").KeyboardEvent} e 
         */
        const handleKeyEvent = (e) => {
            console.log(e)
            
            //e.preventDefault()
            const  state = this.state
            function handleRightByKey(e) {
                if (e.key == "ArrowLeft"){
                    
                    rect.right = rect.right-keystep
                    rect.width = rect.width -keystep
                    if (state.ratio != 0) {
                        rect.height = rect.width / state.ratio;
                    }


                }else if (e.key == "ArrowRight"){
            
                    rect.right = rect.right+keystep
                    rect.width = rect.width +keystep
                    if (state.ratio != 0) {
                        rect.height = rect.width /state.ratio;
                    }

                }
                drawMove(context, rect);

            }
        
            function handleLeftByKey(e) {
                if (e.key == "ArrowLeft"){
                    rect.left = rect.left-keystep
                    rect.width = rect.width +keystep
                    if (state.ratio != 0) {
                        rect.height = rect.width / state.ratio;
                    }


                }else if (e.key == "ArrowRight"){
                    rect.left = rect.left+keystep
                    rect.width = rect.width -keystep
                    if (state.ratio != 0) {
                        rect.height = rect.width /state.ratio;
                    }

                }
                drawMove(context, rect);
            }

            function handleMoveByKey(e) {
                console.log('this is',this)
                switch (e.key) {
                    case "ArrowLeft":
                        rect.left = rect.left - keystep
                        rect.right = rect.right - keystep
                        drawMove(context, rect)
                        break;
                    case "ArrowRight":
                        rect.left = rect.left + keystep
                        rect.right = rect.right + keystep
                        drawMove(context, rect)
                        break;
                    case "ArrowUp":
                        rect.top = rect.top - keystep
                        rect.bottom = rect.bottom - keystep
                        drawMove(context, rect)
                        break;
                    case "ArrowDown":
                        rect.top = rect.top + keystep
                        rect.bottom = rect.bottom + keystep
                        drawMove(context, rect)
                        break;
                }
            }
           
            function handleTopByKey(e) {
                if (e.key == "ArrowUp") {
                    rect.top = rect.top - keystep
                    rect.height = rect.height + keystep
                    if (state.ratio != 0) {
                        rect.width = rect.height * state.ratio;
                    }


                } else if (e.key == "ArrowDown") {
                    rect.top = rect.top + keystep
                    rect.height = rect.height - keystep
                    if (state.ratio != 0) {
                        rect.width = rect.height * state.ratio;
                    }

                }
                drawMove(context, rect);

            }

            function handleBottomByKey(e) {
                if (e.key == "ArrowUp") {
                    rect.bottom = rect.bottom - keystep
                    rect.height = rect.height - keystep
                    if (state.ratio != 0) {
                        rect.width = rect.height * state.ratio;
                    }


                } else if (e.key == "ArrowDown") {
                    rect.bottom = rect.bottom + keystep
                    rect.height = rect.height + keystep
                    if (state.ratio != 0) {
                        rect.width = rect.height * state.ratio;
                    }

                }
                drawMove(context, rect);
            }

            // eslint-disable-next-line default-case
            switch (this.handle){
                case HANDLE.MOVE :
                    handleMoveByKey(e)
                    break;
                case HANDLE.LEFT :
                    handleLeftByKey(e)
                    break;
                case HANDLE.RIGHT :
                    handleRightByKey(e)
                    break;
                case HANDLE.TOP :
                    handleTopByKey(e)
                    break;
                case HANDLE.BOTTOM :
                    handleBottomByKey(e)
                    break;
            }

        }
        const handleMouseMove = (e)=>{
            let state = this.state
            let downX = this.downX
            let downY = this.downY
            function handleLeft(e) {
                rect.left = e.offsetX;
                rect.width = downRect.width + (downX - e.offsetX);
                if (state.ratio != 0) {
                    rect.height = rect.width / state.ratio;
                } else {
                    rect.height = downRect.height + e.offsetY - downY;
                }
                drawMove(context, rect);
            }

            function handleRight(e) {
                rect.width = downRect.width + (e.offsetX - downX);
                if (state.ratio != 0) {
                    rect.height = rect.width / state.ratio;
                } else {
                    rect.height = downRect.height + e.offsetY - downY;
                }
                rect.left = e.offsetX - rect.width
                drawMove(context, rect);
            }

            function handleTop(e) {
                rect.top = e.offsetY;
                rect.height = downRect.height + (downY - e.offsetY);
                if (state.ratio != 0) {
                    rect.width = rect.height * state.ratio;
                } else {
                    rect.width = downRect.width + e.offsetX - downX;
                }
                drawMove(context, rect);
            }

            function handleBottom(e) {
                rect.height = downRect.height + (e.offsetY - downY);
                if (state.ratio != 0) {
                    rect.width = rect.height * state.ratio;
                } else {
                    rect.width = downRect.width + e.offsetX - downX;
                }
                rect.top = e.offsetY - rect.height
                drawMove(context, rect);
            }

            function handleMove(e) {
                rect.left = downRect.left + (e.offsetX - downX)
                rect.top = downRect.top + (e.offsetY - downY)
                rect.width = downRect.width
                rect.height = downRect.height
                drawMove(context, rect);
            }

            function updateNewRect(e) {
                rect.left = downX;
                rect.top = downY;
                rect.width = e.offsetX - downX;
                if (state.ratio != 0) {
                    rect.height = rect.width / state.ratio;
                } else {
                    rect.height = e.offsetY - downY
                }

                drawMove(context, rect);
            }

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
        const handleMouseDown =(e)=>{
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


        canvas.onmousedown = handleMouseDown
        canvas.onmousemove = handleMouseMove
        canvas.onmouseout = (e) => {
            this.isMouseDown = false
        }
        canvas.onmouseup = (e) => {
            this.isMouseDown = false
            //updateJSon()
            drawState(context)

        }

        document.onkeydown = handleKeyEvent



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
                    draw.fillRect(point[0]-0.5, point[1]-0.5, 1, 1)
                    
                }
            )
        }
        
        /**
         * @param {CanvasRenderingContext2D} p1
         * 
         */
        const drawRect = (context, rect) => {
            context.lineWidth = 1 
            context.strokeRect(rect.left , rect.top, rect.width , rect.height )
                      
        }


        var spliceArr = function (arr, num) {
            let reArr = []
            arr.map(item => {
                if (!reArr[reArr.length - 1] || reArr[reArr.length - 1].length === num) { 
                    reArr.push([])
                }

                if (reArr[reArr.length - 1].length !== num) { 
                    reArr[reArr.length - 1].push(item)
                }

            })
            return reArr
        }
    }




}

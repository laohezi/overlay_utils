import React from "react"
import store from './model'
import { actions } from './model'
import { OPRATION } from './model'
import '../overlays/Overlay.css'

export class ButtonArea extends React.Component {
    constructor(props) {
        super(props)
        this.state = store.getState()
        store.subscribe(()=>{
            this.setState(
                store.getState()
            )
        })
    }

    onClick = (ACTION) => {
        console.log('button area' + ACTION)
        store.dispatch(
            actions.updateAction(ACTION)
        )
    }
    changeW = (e) => {

        store.dispatch(
            actions.updateSize(
                {
                    w: e.target.value,
                    h: this.state.h
                }
            )
        )

    }
    changeH = (e) => {


        store.dispatch(
            actions.updateSize(
                {
                    w: this.state.w, h: e.target.value
                }
            )
        )

    }

    changeBleedW = (e) => {


        store.dispatch(
            actions.updateBleed(
                {
                    bw: e.target.value, bh: this.state.bh
                }
            )
        )


    }

    changeBleedH = (e) => {

        store.dispatch(
            actions.updateBleed(
                {
                    bw: this.state.bw, bh: e.target.value
                }
            )
        )


    }
    render() {
        return (
            <div>
                <div>
                    size:
                    <input value={this.state.w} onChange={this.changeW} />
                    :
                    <input value={this.state.h} onChange={this.changeH} />
                </div>

                <div>
                    bleed:
                    <input value={this.state.bw} onChange={this.changeBleedW} />
                    :
                    <input value={this.state.bh} onChange={this.changeBleedH} />
                </div>
                <div>
                    <button onClick={() => this.onClick(OPRATION.CONTENT_RECT)}> content  area</button>

                </div>
                <form>
                    magins
                    <input type={"radio"} name={"action"} onClick={() => this.onClick(OPRATION.LEFT_TOP)} />
                    <input type={"radio"} name={"action"} onClick={() => this.onClick(OPRATION.RIGHT_TOP)} />
                    <input type={"radio"} name={"action"} onClick={() => this.onClick(OPRATION.RIGHT_BOTTOM)} />
                    <input type={"radio"} name={"action"} onClick={() => this.onClick(OPRATION.LEFT_BOTTOM)} />


                </form>
            </div >)
    }


}


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
    changePw =(e)=>{
        store.dispatch(
            actions.updatePSize(
                {
                    pw:e.target.value
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

    getPh = () => {
        if (this.state != undefined) {
            const state = this.state;
            const ph = (Number.parseFloat(state.h) + Number.parseFloat(state.bh)*2) / (Number.parseFloat(state.w) + Number.parseFloat(state.bw)*2) * Number.parseFloat(state.pw);
            return ph
        }
    }
    render() {
        return (
            <div>
                <div>
                <text style={{display:'block'}}>transparent area(safe area size)</text>
                    <input value={this.state.w} onChange={this.changeW} />
                    :
                    <input value={this.state.h} onChange={this.changeH} />
                </div>

                <div>
                <text style={{display:'block'}}>bleed</text>
                    <input value={this.state.bw} onChange={this.changeBleedW} />
                    :
                    <input value={this.state.bh} onChange={this.changeBleedH} />
                </div>
                <div>
                <text style={{display:'block'}}>printable(size with bleeding)</text>
                    <input value={this.state.pw} onChange={this.changePw} />
                    :
                    <input value={this.getPh()} />
                </div>
                

                <div>
                    <button onClick={() => this.onClick(OPRATION.CONTENT_RECT)}> transparent  area</button>

                </div>
                <form>
                    <text style={{display:'block'}}>margins</text>
                    
                    <input type={"radio"} id ={"left_top"} name={"action"} onClick={() => this.onClick(OPRATION.LEFT_TOP)} />
                    <label className={"radio_lable"} for ={"left_top"} >left_top</label>               
                    <input type={"radio"} id ={"right_top"} name={"action"} onClick={() => this.onClick(OPRATION.RIGHT_TOP)} />
                    <label className={"radio_lable"} for ={"right_top"} >right_top</label>
                    <input type={"radio"} id ={"right_bottom"} name={"action"} onClick={() => this.onClick(OPRATION.RIGHT_BOTTOM)} />
                    <label className={"radio_lable"} for ={"right_bottom"} >right_bottom</label>
                    <input type={"radio"} id ={"left_bottom"} name={"action"} onClick={() => this.onClick(OPRATION.LEFT_BOTTOM)} />
                    <label className={"radio_lable"} for ={"left_bottom"} >left_bottom</label>


                </form>
            </div >)
    }


}

      
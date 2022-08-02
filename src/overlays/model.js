import { legacy_createStore as createStore } from "redux";

export var OPRATION = {
    CONTENT_RECT: 'content_rect',
    TRSPARENT_RECT: 'transparent_rect',
    LEFT_TOP: 'left_top',
    RIGHT_TOP: 'right_top',
    LEFT_BOTTOM: 'left_bottom',
    RIGHT_BOTTOM: 'right_bottom'

}
const initState = {
    opration: OPRATION.CONTENT_RECT,
    ratio: 1.0,
    w: 1.0,
    h: 1.0,
    bw:0,
    bh:0,
    json:"",
    margins:[0,0,0,0,0,0,0,0],
    image:{}
}

const rootReducer = (state, action) => {
    switch (action.type) {
        case "UPDATE_ACTION":
            return {
                ...state, opration: action.payload
            }
        case "UPDATE_SIZE":
            let ratio =1.0
            if(action.payload.w!=0 && action.payload.h!=0){
                ratio = action.payload.w/action.payload.h
            } 
            return {
                ...state, w: action.payload.w, h: action.payload.h,ratio:ratio
            }
            case "UPDATE_BLEED":
            return {
                ...state, bw: action.payload.bw, bh: action.payload.bh
            }
        case "UPDATE_IMAGE":
            return {
                ...state, image: action.payload
            }

        case "UPDATE_JSON":
            return {
                ...state, json: action.payload
            }
        default:
            return initState

    }



}

export const actions = {
    updateAction: (newAction) => (
        {
            type: "UPDATE_ACTION",
            payload: newAction
        }
    ),

    updateSize: (newSize) => ({
        type: "UPDATE_SIZE",
        payload: newSize
    }),

    updateBleed: (bleed) => ({
        type: "UPDATE_BLEED",
        payload: bleed
    }),
    updateImage: (img) => ({
        type: "UPDATE_IMAGE",
        payload: img
    }),

    updateJson: (json) => ({
        type: "UPDATE_JSON",
        payload: json
    })

}

export default createStore(rootReducer, initState)




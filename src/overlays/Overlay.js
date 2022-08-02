import React, {createRef} from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import '../overlays/Overlay.css'
import './model.js'
import store from './model'
import {actions} from './model'
import {OPRATION} from './model'
import {Canvas} from './Canvas';
import {ButtonArea} from './ButtonArea';


export class OverlayUtils extends React.Component {
    constructor(props) {
        super(props)
        //  this.onClickAction = this.onClickAction.bind(this)
        this.state = store.getState()
        store.subscribe(() => {
            this.setState(store.getState())
        })

    }


    render() {
        return (<div>
            <ContentArea/>

            <JsonArea json={this.state.json}/>

            <ButtonArea/>

        </div>);
    }

}

class JsonArea extends React.Component {

    render() {
        return (
            <div>{this.props.json}</div>
        );
    }
}

class ContentArea extends React.Component {


    constructor(props) {
        super(props)
        this.state = store.getState()
        store.subscribe(() => {
            this.setState(store.getState())
        })
        this.imageAra = React.createRef()
    }

    drop = (e) => {
        e.preventDefault()
        const items = e.dataTransfer.items;
        if (!items.length) return;
        if (items[0].kind === 'file' && items[0].webkitGetAsEntry().isFile) {
            const pathFile = URL.createObjectURL(items[0].getAsFile());
            console.log(pathFile)
            let imageInfo = {}
            imageInfo.src = pathFile
            store.dispatch(actions.updateImage(imageInfo))
        }
    }

    onLoad = (e) => {
        let image = this.imageAra.current
        let imageInfo = {}
        imageInfo.src = image.src
        imageInfo.width = image.naturalWidth
        imageInfo.height = image.naturalHeight
        store.dispatch(actions.updateImage(imageInfo))
    }

    render() {
        return <div className='content' onDragEnter={(e) => e.preventDefault()}
                    onDrop={this.drop}
                    onDragOver={(e) => e.preventDefault()}>
            <img ref={this.imageAra} className="image_area" src={this.state.image.src} onLoad={this.onLoad}
            >
            </img>
            <Canvas
            />
        </div>
    }

}







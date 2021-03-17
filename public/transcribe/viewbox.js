/* Page Components for Image Transcription
 * @author cubap
 */

import { findLine } from "./transcribe-utils.js";

class RrViewbox extends HTMLElement {

    static get observedAttributes() {
        return ['rr-selector'];
    }

    viewLine(selectorOverride) {
        const line = this.line || this.canvas && findLine(this.canvas.otherContent[0].resources)
        this.selector = selectorOverride || (line.on || line.target).split("xywh=")[1]
        const viewportWidth = this.clientWidth
        let [x, y, w, h] = this.selector.split(",").map(d => parseInt(d))
        if (this.show === "below") {
            y += h
        }
        const selectorToPage = w / viewportWidth
        const imgFrame = this.shadowRoot.querySelector(".img-frame")
        imgFrame.style.width = `${this.canvas.width / selectorToPage}px`
        imgFrame.style.top = `-${y / selectorToPage}px`
        imgFrame.style.left = `-${x / selectorToPage}px`
        if (this.show === "self") {
            this.style.height = `${h * viewportWidth / w}px`
            let src = this.canvas.images[0].resource['@id']
            if (src.includes("full/full/")){
                let bookmark = this.shadowRoot.querySelector('.bookmark') || {}
                bookmark.style = ""
                let pct = `pct:${100*x/this.canvas.width},${100*y/this.canvas.height},${100*w/this.canvas.width},${100*h/this.canvas.height}`
                setTimeout(()=>bookmark.style = `background-image:url(${src.replace("full/full",pct+"/full")});`,500)
            }
        }
    }
    constructor() {
        super()

        this.attachShadow({ mode: 'open' })

        this.src = this.getAttribute("rr-imgsrc") || "https://via.placeholder.com/800x90?text=No+rr-src+Provided"
        this.show = this.getAttribute("rr-show") || "self"

        this.bufferPixels = 15

        document.addEventListener("showline", event => {
            this.line = event.detail.line
            this.viewLine()
        })

        const shadowStyle = document.createElement("style")
        const headStyle = document.createElement("style")
        headStyle.textContent = `
        rr-viewbox {
            display: block;
            position:relative;
            width: calc(100% - ${this.bufferPixels * 2}px);
            overflow: hidden;
            z-index:2;
            transition: height .5s;
            padding: ${this.bufferPixels}px;
            flex: 4 1 auto;
        }
        rr-viewbox[rr-show='below'] {
            z-index:1;
            overflow:visible;
        }
        `
        shadowStyle.textContent = `
        img {
            display: block;
            width: 100%;
            z-index: inherit;
        }
        div.img-frame {
            position: absolute;
            left: 0%;
            top: 0%;
            margin: ${this.bufferPixels}px;
            transition: left .5s, top .5s, width .5s;
        }
        div.bookmark {
            height: 100%;
            width: 100%;
            position: relative;
            z-index: 3;
            border-radius: ${this.bufferPixels / 3}px;
            opacity: 1 !important;
            box-shadow: 0 0 0 1px #a64129, 0 0 ${this.bufferPixels / 3}px black;
            background-size: calc(100% + 31px);
            background-position: 0px -1px;
            background-repeat: no-repeat;
        }`
        this.shadowRoot.appendChild(shadowStyle)
        document.head.appendChild(headStyle)
    }
    connectedCallback() {
        const loadImage = () => {
            const image = new Image()
            image.onload = e => {
                // check image for fit
                // const imageRatio = image.naturalWidth / image.naturalHeight
                // // TODO: access real canvas data
                // const canvasRatio = this.canvas.width / this.canvas.height
                // if (Math.abs(imageRatio - canvasRatio) > .0001) {
                //     throw new Error("This image does not match the canvas. We do not supoprt that yet.")
                // }
                this.shadowRoot.querySelectorAll(".bookmark,.img-frame").forEach(el => el.remove()) // reset
                if (this.show === "self") {
                    // add bookmark if missing
                    const bookmark = document.createElement("div")
                    bookmark.classList.add("bookmark")
                    this.shadowRoot.appendChild(bookmark)
                }
                const img = document.createElement("img")
                img.src = image.src
                const imgFrame = document.createElement("div")
                imgFrame.classList.add("img-frame")
                imgFrame.appendChild(img)
                this.shadowRoot.append(imgFrame)

                // call first lineview
                this.viewLine()
            }
            image.src = this.canvas.images[0].resource['@id']
        }

        document.addEventListener("showcanvas", event => {
            this.canvas = event.detail.canvas
            loadImage()
        })

        document.addEventListener("showline", event => {
            this.line = event.detail.line
            this.viewLine()
        })
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "rr-selector" && (oldValue !== newValue)) {
            this.selector = newValue
            this.viewLine(newValue)
        }
    }
}

customElements.define("rr-viewbox", RrViewbox)

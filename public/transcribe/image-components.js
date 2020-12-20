/**
 * Page Components for Image Transcription
 * @author cubap
 */

class RrViewbox extends HTMLElement {
    getManifest() {
        return (this.manifest || this.closest('[rr-manifest]'))
            ? this.manifest || this.closest('[rr-manifest]').getAttribute("rr-manifest")
            : ""
    }
    getCanvas() {
        return (this.canvas || this.closest('[rr-canvas]'))
            ? this.canvas || this.closest('[rr-canvas]').getAttribute("rr-canvas")
            : ""
    }
    getSelector() {
        return (this.selector || this.closest('[rr-selector]'))
            ? this.selector || this.closest('[rr-selector]').getAttribute("rr-selector")
            : ""
    }
    getLine() {
        return (this.line || this.closest('[rr-line]'))
            ? this.line || this.closest('[rr-line]').getAttribute("rr-line")
            : ""
    }
    constructor() {
        super()

        this.attachShadow({ mode: 'open' })

        this.src = this.getAttribute("rr-imgsrc") || "https://via.placeholder.com/800x90?text=No+rr-src+Provided"
        this.manifest = this.getManifest()
        this.selector = this.getSelector()
        this.canvas = this.getCanvas()
        this.line = this.getLine()
        this.show = this.getAttribute("rr-show") || "self"
        this.presentation = {}

        this.bufferPixels = 15

        this.addEventListener("scrolltoline", this.viewLine)

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
            border: thin solid #A64129;
            opacity: 1 !important;
            box-shadow: 0 0 ${this.bufferPixels / 3}px black;
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
                // const canvasRatio = this.presentation.canvas.width / this.presentation.canvas.height
                // if (Math.abs(imageRatio - canvasRatio) > .0001) {
                //     throw new Error("This image does not match the canvas. We do not supoprt that yet.")
                // }

                if (this.show === "self") {
                    // add bookmark
                    const bookmark = document.createElement("div")
                    bookmark.classList.add("bookmark")
                    this.shadowRoot.appendChild(bookmark)
                }
                // add image
                const img = document.createElement("img")
                img.src = image.src
                const imgFrame = document.createElement("div")
                imgFrame.classList.add("img-frame")
                imgFrame.appendChild(img)
                this.shadowRoot.append(imgFrame)

                // call first lineview
                this.viewLine()
            }
            image.src = this.src
        }
        if (this.presentation.manifest) {
            loadImage()
        } else {
            fetch(this.manifest)
                .then(response => {
                    if (response.ok) {
                        return response.json()
                    } else {
                        throw Error(response.statusText)
                    }
                })
                .then(manifest => {
                    this.presentation.manifest = manifest
                    this.presentation.canvas = manifest.sequences[0].canvases[0]
                    this.src = this.presentation.canvas.images[0].resource['@id']
                    loadImage()
                })
        }
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "rr-line" && (oldValue !== newValue)) {
            this.dispatchEvent(new CustomEvent("scrolltoline", { detail: { line: newValue } }))
        }
    }

    resolveLine(lineId = this.getLine()) {
        for (const line of this.presentation.canvas.otherContent[0].resources) {
            if (line['@id'] === lineId) return line
        }
        return this.presentation.canvas.otherContent[0].resources[0]
    }

    viewLine(event) {
        const line = this.resolveLine(event && event.detail.line)
        this.selector = (line.on || line.target).split("xywh=")[1]
        const viewportWidth = this.clientWidth
        let [x, y, w, h] = this.selector.split(",").map(d => parseInt(d))
        if (this.show === "below") {
            y += h
        }
        const selectorToPage = w / viewportWidth
        const imgFrame = this.shadowRoot.querySelector(".img-frame")
        imgFrame.style.width = `${this.presentation.canvas.width / selectorToPage}px`
        imgFrame.style.top = `-${y / selectorToPage}px`
        imgFrame.style.left = `-${x / selectorToPage}px`
        if (this.show === "self") {
            this.style.height = `${h * viewportWidth / w}px`
        }
    }
}

customElements.define("rr-viewbox", RrViewbox)
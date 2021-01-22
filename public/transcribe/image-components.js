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
    setLine(id) {
        this.line = id
        this.setAttribute('rr-line', id)
    }
    static get observedAttributes() {
        return ['rr-manifest', 'rr-canvas', 'rr-line', 'rr-selector'];
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
                    this.presentation.canvas = findCanvas(this.canvas)
                    this.src = this.presentation.canvas.images[0].resource['@id']
                    loadImage()
                })
        }
        const findCanvas = id => {
            if (typeof id === "string") {
                for (const c of this.presentation.manifest.sequences[0].canvases) {
                    if(c['@id'] === id) return c
                }
            } else {
                return this.presentation.manifest.sequences[0].canvases[0]
            }
        } 
        const navigateHandler = event => {
            const toNextLineId = (el) => {
                const c = this.presentation.canvas
                const currentLine = el.line
                const newLine = c.otherContent[0].resources[c.otherContent[0].resources.findIndex(i => i['@id'] === currentLine) + 1]
                if (!newLine) {
                    // throw Error("There is no next line on this list.")
                }
                toLine(el, newLine['@id'])
            }
            const toPreviousLineId = (el) => {
                const c = this.presentation.canvas
                const currentLine = el.line
                const newLine = c.otherContent[0].resources[c.otherContent[0].resources.findIndex(i => i['@id'] === currentLine) - 1]
                if (!newLine) {
                    // throw Error("There is no previous line on this list.")
                }
                toLine(el, newLine['@id'])
            }
            const toLine = (el, id) => {
                if (typeof id !== "string") {
                    throw Error("This is not an id or uri that I recognize:", id)
                }
                this.setLine(id)
            }
            const goto = event.detail.goto
            switch (goto.type) {
                case "line":
                    if (this.presentation.canvas) {
                        const lineElem = typeof this.line === "string" ? this : this.closest('[rr-line]')
                        switch (goto.id) {
                            case "next":
                                toNextLineId(lineElem)
                                break
                            case "previous":
                                toPreviousLineId(lineElem)
                                break
                            default:
                                toLine(lineElem, goto.id)
                        }
                    } else {
                        console.error("No Canvas is stored in memory.")
                    }
                    break
                case "canvas":
                    const canvasElem = typeof this.canvas === "string" ? this : this.closest('[rr-canvas]')
                    break
            }
        }
        document.addEventListener("navigate", navigateHandler)
    }
    attributeChangedCallback(name, oldValue, newValue) {
        console.log("cat")
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

class RrWorkspace extends HTMLElement {
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

        this.manifest = this.getManifest()
        this.selector = this.getSelector()
        this.canvas = this.getCanvas()
        this.line = this.getLine()
        this.presentation = {}

        this.bufferPixels = 15

        this.addEventListener("scrolltoline", this.viewLine)

        const shadowStyle = document.createElement("style")
        shadowStyle.textContent = `
        workspace {
            display: block;
            background-color: #ffffff;
            width: 100vw;
            flex: 1 1 auto;
            box-shadow: 0 0 1em rgba(0,0,0,.5);
            z-index: 5;
        }`
        this.shadowRoot.appendChild(shadowStyle)
        const transcriptlet = document.createElement("textarea")
        transcriptlet.value = this.text
    }
    connectedCallback() {

        if (this.presentation.manifest) {
            console.log("already loaded manifest")
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
                    this.presentation.canvas = this.getCanvas() || manifest.sequences[0].canvases[0]
                    this.text = this.presentation.canvas.otherContent[0].resources[0].resource['cnt:chars']
                })
        }
        const bkBtn = document.createElement("button")
        const fwdBtn = document.createElement("button")
        [bkBtn, fwdBtn].forEach(b => b.setAttribute("role", "button"))
        bkBtn.addEventListener("click")
        this.shadowRoot.append(bkBtn, fwdBtn)
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "rr-line" && (oldValue !== newValue)) {
            const newLocal = "scrolltoline"
            this.dispatchEvent(new CustomEvent(newLocal, { detail: { line: newValue } }))
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

customElements.define("rr-workspace", RrWorkspace)


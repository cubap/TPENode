/**
 * Page Components for Image Transcription
 * @author cubap
 */

import {
    getLabel,
    navigateToLine,
    resolveResource
} from "./transcribe-utils.js";

class RrInfo extends HTMLElement {
    constructor() {
        super()

        this.attachShadow({ mode: 'open' })

        document.addEventListener("showline", event => {
            this.line = event.detail.line
            this.shadowRoot.querySelector(".line-label").innerHTML = getLabel(this.line, "")
            const lines = this.shadowRoot.querySelectorAll(".line-select option")
            lines.forEach(el => {
                if (el.value === this.line['@id']) {
                    el.setAttribute("selected", true)
                } else {
                    el.removeAttribute("selected")
                }
            })
        })
        document.addEventListener("showcanvas", event => {
            this.canvas = event.detail.canvas
            this.shadowRoot.querySelector(".canvas-label").innerHTML = getLabel(this.canvas, "")
            if (this.canvas.otherContent[0] && !this.canvas.otherContent[0].resources) {
                resolveResource(this.canvas.otherContent[0], true)
                    .then(list => {
                        this.canvas.otherContent[0] = list
                        this.shadowRoot.querySelector(".line-select").innerHTML =
                            this.canvas.otherContent[0].resources.reduce((a, b, i) => a += `<option value="${b['@id']}">${getLabel(b, i + 1)}</option>`, ``)
                    })
            } else {
                this.shadowRoot.querySelector(".line-select").innerHTML =
                    this.canvas.otherContent[0].resources.reduce((a, b, i) => a += `<option value="${b['@id']}">${getLabel(b, i + 1)}</option>`, ``)
            }
            const canvases = this.shadowRoot.querySelectorAll(".canvas-select option")
            canvases.forEach(el => {
                if (el.value === this.canvas['@id']) {
                    el.setAttribute("selected", true)
                } else {
                    el.removeAttribute("selected")
                }
            })
        })
        document.addEventListener("loadedmanifest", event => {
            this.manifest = event.detail.manifest
            this.shadowRoot.querySelector(".manifest-label").innerHTML = getLabel(this.manifest, "")
            this.shadowRoot.querySelector(".canvas-select").innerHTML =
                this.manifest.sequences[0].canvases.reduce((a, b, i) => a += `<option value="${b['@id']}">${getLabel(b, i + 1)}</option>`, ``)
        })

        const headStyle = document.createElement("style")
        headStyle.textContent = `
        rr-info {
            display: flex;
            background-color: #ffffff;
            position: fixed;
            z-index: 15;
            bottom: 0;
            left: 0;
            padding: .5em;
        }`

        const shadowStyle = document.createElement("style")
        shadowStyle.textContent = `
        `

        document.head.appendChild(headStyle)

        this.shadowRoot.innerHTML = `
            <div class="manifest-label"></div>
            <div class="line-label"></div>
            <select class="line-select"></select>
            <div class="canvas-label"></div>
            <select class="canvas-select"></select>
        `
        this.shadowRoot.appendChild(shadowStyle)

        this.shadowRoot.addEventListener("input", event => {
            if (event.target.classList.contains("line-select") || event.target.classList.contains("canvas-select")) {
                const type = event.target.classList.contains("line-select") ? "line" : "canvas"
                navigateToLine(type, event.target.value, this)
            }
            return event
        })
    }
    connectedCallback() { return }
    attributeChangedCallback(name, oldValue, newValue) { return }
}

customElements.define("rr-info", RrInfo)

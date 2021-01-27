/**
 * Page Components for Image Transcription
 * @author cubap
 */

import {
    navigateForwardOneLine,
    navigateBackOneLine
} from './transcribe-utils.js'

class RrWorkspace extends HTMLElement {
    setText(text) {
        this.text = text
        this.shadowRoot.querySelector("textarea").value = this.text
    }
    static get observedAttributes() {
        return ['rr-canvas', 'rr-line', 'rr-selection'];
    }
    constructor() {
        super()

        this.attachShadow({ mode: 'open' })

        this.bufferPixels = 15

        document.addEventListener("showline", event => {
            this.setText(event.detail.line.resource['cnt:chars'])
            this.line = event.detail.line
            this.lineReceived = true
            setTimeout(() => delete this.lineReceived, 1000)
        })
        document.addEventListener("showcanvas", event => {
            setTimeout(() => {
                if (!this.lineReceived) {
                    this.setText(event.detail.canvas.otherContent[0].resources[0].resource['cnt:chars'])
                }
            }, 200)
        })

        const headStyle = document.createElement("style")
        headStyle.textContent = `
        rr-workspace {
            display: flex;
            background-color: #ffffff;
            width: 100vw;
            flex: 1 1 auto;
            box-shadow: 0 0 1em rgba(0,0,0,.5);
            z-index: 5;
        }`

        const shadowStyle = document.createElement("style")
        shadowStyle.textContent = `
        textarea {
            flex-grow: 1;
        }`

        document.head.appendChild(headStyle)
        const transcriptlet = `<textarea>${this.text || ""}</textarea>`
        const prevbutton = `        
        <button role="button" class="selectPreviousLine">⬆</button>
        `
        const nextbutton = `        
        <button role="button" class="selectNextLine">⬇</button>
        `
        this.shadowRoot.innerHTML = prevbutton + transcriptlet + nextbutton
        this.shadowRoot.appendChild(shadowStyle)

        this.shadowRoot.addEventListener("click", event => {
            const btns = event.target.classList
            if (btns.contains('selectPreviousLine')) {
                navigateBackOneLine(event, this)
            } else if (btns.contains('selectNextLine')) {
                navigateForwardOneLine(event, this)
            }
            return event
        })
        this.shadowRoot.addEventListener("keydown", event => {
            if (event.target.tagName === "TEXTAREA") {
                if (event.key === "Tab") {
                    if (event.target.value !== this.text) {
                        this.dispatchEvent(new CustomEvent("changelinetext", { bubbles: true, detail: { text: event.target.value, line: this.line } }))
                    }
                    event.preventDefault()
                    if (event.shiftKey) { // backup
                        navigateBackOneLine(event, this)
                    } else {
                        navigateForwardOneLine(event, this)
                    }
                }
            }
            return event
        })
        this.shadowRoot.addEventListener("change", event => {
            if (event.target.tagName === "TEXTAREA" && (event.target.value !== this.text)) {
                this.dispatchEvent(new CustomEvent("changelinetext", { bubbles: true, detail: { text: event.target.value, line: this.line } }))
            }
            return event
        })
    }
    connectedCallback() { return }
    attributeChangedCallback(name, oldValue, newValue) { return }
}

customElements.define("rr-workspace", RrWorkspace)

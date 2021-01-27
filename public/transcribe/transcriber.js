/**
 * Page Components for Image Transcription
 * @author cubap
 */

import {
    findCanvas,
    findLine
} from './transcribe-utils.js'

class RrTranscriber extends HTMLElement {

    static get observedAttributes() {
        return ['rr-manifest', 'rr-canvas', 'rr-line'];
    }

    constructor() {
        super()

        const headStyle = document.createElement("style")
        headStyle.textContent = `
        rr-transcriber {
            margin: 0;
            display: flex;
            flex-direction: column;
            overflow: visible;
            height: 100%;
            position: relative;
        }
        `
        document.head.appendChild(headStyle)

        const navigateHandler = event => {
            if (!this.manifest) {
                throw new Error("There is no Manifest. Unable to navigate.")
            }
            const canvases = this.manifest.sequences[0].canvases
            if (!this.canvas) {
                this.canvas = findCanvas(canvases)
            }
            const lines = this.canvas.otherContent[0].resources
            if (!this.line) {
                this.line = findLine(lines)
            }

            const toSibling = (collection, current, direction) => {
                if (typeof current === "string") {
                    current = collection.find(i => i['@id'] === current)
                }
                const sib = collection[collection.findIndex(i => Object.is(i, current)) + direction]
                if (sib && sib['@id']) {
                    // expecting only "oa:Annotation","Annotation","sc:Canvas","iiif:Canvas","Canvas"
                    this.setAttribute(new RegExp(/annotation/i).test(current["@type"]) ? "rr-line" : "rr-canvas", sib['@id'])
                } else {
                    console.warn("No action taken. Not found: ", sib, collection)
                }
            }

            const goto = event.detail.goto
            switch (goto.type) {
                case "line":
                    switch (goto.id) {
                        case "next":
                            toSibling(lines, this.line, 1)
                            break
                        case "previous":
                            toSibling(lines, this.line, -1)
                            break
                        default:
                            toSibling(lines, goto.id, 0)
                    }
                    break
                case "canvas":
                    switch (goto.id) {
                        case "next":
                            toSibling(canvases, this.canvas, 1)
                            break
                        case "previous":
                            toSibling(canvases, this.canvas, -1)
                            break
                        default:
                            toSibling(canvases, goto.id, 0)
                    }
                    break
            }
        }
        /**
         * Accept user change to line text and update the corresponding line Annotation in the 
         * Canvas held in memory. The reference is preserved, no need to go find this.canvas.
         * @param {change} event input Textarea changed
         */
        function updateLine(event) {
            event.detail.line.resource['cnt:chars'] = event.detail.text;
            return event;
        }
        this.addEventListener("navigate", navigateHandler)
        this.addEventListener("changelinetext", updateLine)
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "rr-manifest" && (oldValue !== newValue)) {
            fetch(newValue)
                .then(response => {
                    if (response.ok) {
                        return response.json()
                    } else {
                        throw Error(response.statusText)
                    }
                })
                .then(manifest => {
                    this.manifest = manifest
                    this.setAttribute('rr-canvas', manifest.sequences[0].canvases[0]['@id'])
                    this.dispatchEvent(new CustomEvent("loadedmanifest", { bubbles: true, detail: { manifest: manifest } }))
                })
        }
        else if (name === "rr-canvas" && (oldValue !== newValue)) {
            const updateCanvas = () => {
                if (!this.manifest) { return }
                this.canvas = findCanvas(this.manifest.sequences[0].canvases, newValue)
                this.dispatchEvent(new CustomEvent("showcanvas", { bubbles: true, detail: { canvas: this.canvas } }))
                clearInterval(uc)
            }

            if (!this.manifest) {
                var uc = setInterval(updateCanvas, 200)
            } else {
                updateCanvas()
            }
        }
        else if (name === "rr-line" && (oldValue !== newValue)) {
            const updateLine = () => {
                if (!this.canvas) { return }
                this.line = findLine(this.canvas.otherContent[0].resources, newValue)
                this.dispatchEvent(new CustomEvent("showline", { bubbles: true, detail: { line: this.line } }))
                clearInterval(ul)
            }

            if (!this.canvas) {
                var ul = setInterval(updateLine, 200)
            } else {
                updateLine()
            }
        }
    }
}

customElements.define("rr-transcriber", RrTranscriber)

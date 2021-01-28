/**
 * Page Components for Image Transcription
 * @author cubap
 */

class IiifDrop extends HTMLElement {
    constructor() {
        super()

        this.addEventListener("click", event => {
            const uri = document.createElement("INPUT")
            uri.type = "url"
            uri.value = prompt("New Manifest URI:")
            if (uri.reportValidity()){
                this.dispatchEvent(new CustomEvent("changemanifest", { bubbles: true, detail: { manifest: uri.value } }))
            }
        })

        const headStyle = document.createElement("style")
        headStyle.textContent = `
        iiif-drop {
            display: block;
            position: fixed;
            z-index: 15;
            bottom: 0;
            right: 0;
            padding: .5em;
        }`

        document.head.appendChild(headStyle)

        this.innerHTML = `
            <img alt="update uri" title="Click to change Manifest" src="/images/logo-iiif-34x30.png" >
        `
    }
    connectedCallback() { return }
    attributeChangedCallback(name, oldValue, newValue) { return }
}

customElements.define("iiif-drop", IiifDrop)

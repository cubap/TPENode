const prevLineButtons = document.getElementsByClassName("selectPreviousLine")
const nextLineButtons = document.getElementsByClassName("selectNextLine")

if (prevLineButtons.length) {
    Array.from(prevLineButtons).forEach(el => el.addEventListener("click", navigateBackOneLine))
}
if (nextLineButtons.length) {
    Array.from(nextLineButtons).forEach(el => el.addEventListener("click", navigateForwardOneLine))
}

function navigateBackOneLine(event, onElem) {
    navigateToLine("line", "previous", onElem)
}

function navigateForwardOneLine(event, onElem) {
    navigateToLine("line", "next", onElem)
}

function navigateToLine(type, line, el = document) {
    const NavigateEvent = new CustomEvent("navigate", {
        bubbles: true,
        detail: {
            goto: {
                id: line,
                type: type
            }
        }
    })
    el.dispatchEvent(NavigateEvent)
}

function findCanvas(canvases, id) {
    if (typeof id === "string") {
        for (const c of canvases) {
            if (c['@id'] === id) return c
        }
        return canvases[0]
    } else {
        return canvases[0]
    }
}

function findLine(lines, id) {
    if (typeof id === "string") {
        for (const l of lines) {
            if (l['@id'] === id) return l
        }
        return lines[0]
    } else {
        return lines[0]
    }
}

function getLabel(obj, fallback=""){
    let label = obj.label || obj.title || obj.name || String(fallback)
    if(typeof label === "string") { return label }
    label = [].concat(...(label.none || label.en || Object.keys(label)[0])).join("")
    if(typeof label === "string") { return label }
    return fallback
}

export {
    navigateForwardOneLine,
    navigateBackOneLine,
    navigateToLine,
    findCanvas,
    findLine,
    getLabel
}
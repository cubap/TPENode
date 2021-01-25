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

export {
    navigateForwardOneLine,
    navigateBackOneLine
}
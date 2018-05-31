let Quill = require('quill')

let quill = new Quill('#editor', {
    theme: 'snow',
    placeholder: 'Hello Denali. Would you like to play a game?'
});

const dummy = (() => {
    fetch('doc.json')
        .then(r => r.json())
        .then((initialDoc) => {
            quill.setContents(initialDoc)
        })
})()


if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
}

quill.on('text-change', (delta, oldDelta, source) => {
    // navigator.serviceWorker.controller.postMessage({ text: oldDelta.compose(delta) })
});
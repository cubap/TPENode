/**
 * @module DEER Data Encoding and Exhibition for RERUM (DEER)
 * @author Patrick Cuba <cubap@slu.edu>
 * @author Bryan Haberberger <bryan.j.haberberger@slu.edu>
 * @version 0.11

 * This code should serve as a basis for developers wishing to
 * use TinyThings as a RERUM proxy for an application for data entry,
 * especially within the Eventities model.
 * @see tiny.rerum.io
 */

// Identify an alternate config location or only overwrite some items below.
import { default as DEER } from 'https://centerfordigitalhumanities.github.io/deer/js/deer-config.js'

// Overwrite or add certain values to the configuration to customize.

// new templates
DEER.TEMPLATES.selected = (obj,options={}) => {
    const canvas = obj.sequences[0].canvases[options.index || 0]
    let imgURL = canvas.images[0].resource['@id']
    let annotation = canvas.otherContent[0].resources[0]

    if(/full\/full/.test(imgURL)){
        let dims = annotation.on.split("xywh=")[1].split(",")
        dims[0] = dims[0]/canvas.width*100
        dims[2] = dims[2]/canvas.width*100
        dims[1] = dims[1]/canvas.height*100
        dims[3] = dims[3]/canvas.height*100
        imgURL = imgURL.replace("full","pct:"+dims.join(",")).replace("full","max")
    }
    const height = canvas.height
    return {
        html:`<img src=${imgURL}>`,
        then: (el) => {
            el.style.height = height
        }
    }
}

DEER.TEMPLATES.osd = (obj, options = {}) => {
    if (!window.OpenSeadragon) {
        let scrip1 = document.createElement("script")
        scrip1.setAttribute("src", "https://cdn.jsdelivr.net/npm/openseadragon@2.4/build/openseadragon/openseadragon.min.js")
        document.body.append(scrip1)
        
        let scrip2 = document.createElement("script")
        scrip2.setAttribute("src", "https://cdn.jsdelivr.net/npm/@recogito/annotorious-openseadragon@2.1.0/dist/openseadragon-annotorious.min.js")
        document.body.append(scrip2)
    }

    const imgURL = obj.sequences[0].canvases[options.index || 0].images[0].resource['@id']
    return {
        html: ``,
        then: (el) => {
            const seaInt = window.setInterval(() => {
                if (window.OpenSeadragon && window.OpenSeadragon.Annotorious) {
                    window.OSD = OpenSeadragon({
                        element: el,
                        visibilityRatio:0,
                        constrainDuringPan:true,
                        overlays:[],
                        showHomeControl:false,
                        showNavigationControl:false,
                        showZoomControl:false,
                        showFullPageControl:false,
                        showSequenceControl:false,
                        prefixUrl: "https://cdn.jsdelivr.net/npm/openseadragon@2.4/build/openseadragon/images/",
                        tileSources: {
                            type: 'image',
                            url: imgURL,
                            buildPyramid: false,
                            crossOriginPolicy: 'Anonymous',
                            ajaxWithCredentials: false
                        },
                        ajaxHeaders:{}
                    })
                    window.ANNO = OpenSeadragon.Annotorious(OSD,{
                        readonly:true
                    })
                    OSD.viewport.fitHorizontally()
                    let annotations = obj.sequences[0].canvases[options.index || 0].otherContent[0].resources
                    annotations.forEach(a=>{
                        // setup for Annotorius
                        a.target = a.on || a.target || ""
                        a.type = 'Annotation'
                        a.id = a['@id']
                        a.body = {
                            type: "TextualBody",
                            value: a.resource['cnt:chars']
                        }
                        let scale = obj.sequences[0].canvases[options.index || 0].width / document.body.clientWidth
                        let selector = "xywh="+(a.target.split("#")[1].split("=")[1].split(",").map(num=>num*scale)).join(",")
                        a.target = {
                            source: a.target.split("#")[0],
                            selector: {
                                type:"FragmentSelector",
                                value:selector,
                                conformsTo:"http://www.w3.org/TR/media-frags/"
                            }
                        }
                    })
                    ANNO.setAnnotations(annotations)
                    ANNO.fitBounds(annotations[0]['@id'],true)

                    window.clearInterval(seaInt)
                }
            }, 200)
        }
    }
}

DEER.TEMPLATES.cat = (obj) => `<h5>${obj.name}</h5><img src="http://placekitten.com/300/150" style="width:100%;">`

// sandbox repository URLS
DEER.URLS = {
    BASE_ID: "http://devstore.rerum.io/v1",
    CREATE: "http://tinydev.rerum.io/app/create",
    UPDATE: "http://tinydev.rerum.io/app/update",
    QUERY: "http://tinydev.rerum.io/app/query",
    OVERWRITE: "http://tinydev.rerum.io/app/overwrite",
    SINCE: "http://devstore.rerum.io/v1/since"
}
// Render is probably needed by all items, but can be removed.
// CDN at https://centerfordigitalhumanities.github.io/deer/releases/
import { initializeDeerViews } from 'https://centerfordigitalhumanities.github.io/deer/releases/alpha-.11/deer-render.js'

// Record is only needed for saving or updating items.
// CDN at https://centerfordigitalhumanities.github.io/deer/releases/
import { initializeDeerForms } from 'https://centerfordigitalhumanities.github.io/deer/releases/alpha-.11/deer-record.js'

// fire up the element detection as needed
try {
    initializeDeerViews(DEER)
    initializeDeerForms(DEER)
} catch (err) {
    // silently fail if render or record is not loaded
}


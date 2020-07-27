import * as React from "react"
import { UsfmEditor } from "../src/components/UsfmEditor";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils"
import MarkerInfoMap from '../src/utils/MarkerInfoMap';
import { UsfmMarkers } from "../src/utils/UsfmMarkers";
import { slateToUsfm } from "../src/transforms/slateToUsfm";

let container = null

beforeEach(() => {
    container = document.createElement("div")
    document.body.appendChild(container)
})

afterEach(() => {
    unmountComponentAtNode(container)
    container.remove()
    container = null
})

// it("should render tags correctly", async () => {
//     console.log(UsfmMarkers)
//     await act(() => {
//         console.debug("running")
//         fetch('../usfm.sty')
//             .then(response => console.debug(response.text()))
//         // render(<UsfmEditorTest readOnly={true} />, container)
//     })
//     // expect(ReactEditor.isReadOnly(editor)).toBe(true)
// })

let output = null
const onChange = (o) => output = o

const UsfmEditorTest = ({usfmString}) => {
    return <UsfmEditor
        readOnly={false}
        usfmString={usfmString}
        onChange={onChange}
        identification={{}}
        onIdentificationChange={jest.fn()}
        onEditorChange={jest.fn()}
    />
}

// function paragraphToUsfmRec(marker, occured) {
//     const info = MarkerInfoMap.get(marker)
//     const thisUsfm = paragraphToUsfm(marker)
//     if (info.occursUnder.length == 0 ||
//         info.occursUnder.some(m => occured.indexOf(m) >= 0)) {
//         return paragraphToUsfm(marker)
//     }
//     const parent = info.occursUnder[0]
//     return paragraphToUsfmRec(parent, occured) + 
//         paragraphToUsfm(marker)
// }

function paragraphToUsfm(marker) {
    switch (marker) {
        case UsfmMarkers.CHAPTERS_AND_VERSES.c:
            return `\\c 1`
        case UsfmMarkers.CHAPTERS_AND_VERSES.v:
            return `\\v 1 Verse 1`
        default:
            return `\\${marker}`
    }
}

function characterOrNoteToUsfm(marker) {
    const info = MarkerInfoMap.get(marker)
    const parent = info.occursUnder[0]
    return paragraphToUsfm(parent) + 
        ' ' +
        `Test \\${marker} ${marker}_content\\${info.endMarker} Test`
}

function markerToUsfm(marker) {
    const info = MarkerInfoMap.get(marker)

    if (info.styleType == 'character' ||
        info.styleType == 'note'
    ) {
        return characterOrNoteToUsfm(marker)
    }
    return paragraphToUsfm(marker) + ` ${marker}_content`
}

it("should render tags correctly", () => {

    let usfm = ''
    MarkerInfoMap.forEach( (value, key, map) => {
        usfm = usfm + markerToUsfm(key) + '\n'
    })
    usfm = usfm.trim()
    console.debug(usfm)

    act(() => {
        render(<UsfmEditorTest usfmString={usfm} />, container)
    })
    // while (!output) { }
    expect(output).toEqual(usfm)
})
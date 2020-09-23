import * as React from "react"
import { ReactEditor } from 'slate-react'
import { BasicUsfmEditor } from "../src/components/BasicUsfmEditor";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils"
import { UsfmEditor } from "../src/components/UsfmEditor";

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

it("should be readonly", () => {
    testReadOnly(true)
})

it("should not be readonly", () => {
    testReadOnly(false)
})

const UsfmEditorTest = React.forwardRef(({readOnly}, ref) => (
    <BasicUsfmEditor
        readOnly={readOnly}
        usfmString={'test'}
        onChange={jest.fn()}
        identification={{}}
        onIdentificationChange={jest.fn()}
        ref={ref}
    />
))

function testReadOnly(readOnly) {
    const editor = new UsfmEditor()
    act(() => {
        render(<UsfmEditorTest readOnly={readOnly} ref={editor.childEditorRef} />, container)
    })
    expect(ReactEditor.isReadOnly(editor.baseEditor())).toBe(readOnly)
}
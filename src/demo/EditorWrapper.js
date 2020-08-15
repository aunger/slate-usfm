import * as React from "react";
import { Editor, Transforms } from "slate";
import { UsfmMarkers } from "../utils/UsfmMarkers";
import NodeRules from "../utils/NodeRules";

/**
 * The EditorWrapper class wraps any editor and implements the USFM Editor API.
 * The API methods can be called on any EditorWrapper, regardless of where
 * the wrapper is in the editor hierarchy.
 * 
 * This class provides a react ref that must be passed into the 'ref' prop of a
 * child EditorWrapper component. The ref provides access to the lowest-level
 * editor via the editor() function. However, it should not be necessary to call 
 * the editor() function directly. It is used by the API functions.
 */
export class EditorWrapper extends React.Component {
    constructor(props) {
        super(props)

        /* Pass this into the 'ref' prop of a child EditorWrapper component */
        this.editorRef = React.createRef()

        /* Returns the base (lowest-level) editor. This is the slate editor. */
        this.editor = () => this.editorRef.current.editor()

        this.getMarksAtCursor = () => {
            if (!this.editorRef.current || !this.editor().selection) return []
            return Editor.marks(this.editor())
        }

        this.addMarkAtCursor = (mark) => {
            if (!this.editor().selection) return
            Editor.addMark(this.editor(), mark, true)
        }

        this.removeMarkAtCursor = (mark) => {
            if (!this.editor().selection) return
            Editor.removeMark(this.editor(), mark)
        }

        this.getParagraphTypesAtCursor = () => {
            if (!this.editorRef.current || !this.editor().selection) return []
            let types = []
            const nodes = Editor.nodes(this.editor())
            let entry = nodes.next()
            while (!entry.done) {
                const node = entry.value[0]
                if (UsfmMarkers.isParagraphType(node)) {
                    types = types.concat(node.type)
                }
                entry = nodes.next()
            }
            return types
        }

        this.setParagraphTypeAtCursor = (marker) => {
            if (!this.editor().selection) return
            Transforms.setNodes(
                this.editor(),
                { type: marker },
                { match: NodeRules.isFormattableBlockType }
            )
        }
    }
}
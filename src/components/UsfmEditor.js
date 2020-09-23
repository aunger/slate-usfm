import * as React from "react";
import { Editor, Transforms } from "slate";
import { UsfmMarkers } from "../utils/UsfmMarkers";
import NodeRules from "../utils/NodeRules";

/**
 * The UsfmEditor class implements the USFM Editor API.
 * The API methods can be called on any UsfmEditor, regardless of where
 * the editor is in the editor hierarchy.
 * 
 * This class provides a react ref that must be passed into the 'ref' prop of a
 * child UsfmEditor component. The ref provides access to the lowest-level
 * editor via the baseEditor() function. However, it should not be necessary to call 
 * the baseEditor() function directly. It is used by the API functions.
 */
export class UsfmEditor extends React.Component {
    constructor(props) {
        super(props)

        /* Pass this into the 'ref' prop of a child UsfmEditor component */
        this.childEditorRef = React.createRef()

        /* Returns the base (lowest-level) editor. This is the slate editor. */
        this.baseEditor = () => this.childEditorRef.current.baseEditor()

        this.getMarksAtCursor = () => {
            if (!this.childEditorRef.current || !this.baseEditor().selection) return []
            return Editor.marks(this.baseEditor())
        }

        this.addMarkAtCursor = (mark) => {
            if (!this.baseEditor().selection) return
            Editor.addMark(this.baseEditor(), mark, true)
        }

        this.removeMarkAtCursor = (mark) => {
            if (!this.baseEditor().selection) return
            Editor.removeMark(this.baseEditor(), mark)
        }

        this.getParagraphTypesAtCursor = () => {
            if (!this.childEditorRef.current || !this.baseEditor().selection) return []
            let types = []
            const nodes = Editor.nodes(this.baseEditor())
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
            if (!this.baseEditor().selection) return
            Transforms.setNodes(
                this.baseEditor(),
                { type: marker },
                { match: NodeRules.isFormattableBlockType }
            )
        }
    }
}
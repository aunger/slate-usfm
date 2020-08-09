import { Transforms, Editor, Path, Range, Location } from "slate";
import { ReactEditor } from 'slate-react'
import { DOMNode } from "slate-react/dist/utils/dom";
import { MyEditor } from "./MyEditor"
import { UsfmMarkers } from "../../utils/UsfmMarkers";

export const SelectionTransforms = {
    selectDOMNodeStart,
    selectNextSiblingNonEmptyText,
    moveToEndOfLastLeaf
}

const { select } = Transforms
Transforms.select = (editor: Editor, target: Location) => {
    if (Range.isRange(target) &&
        Range.isExpanded(target) &&
        isVerseOrChapterNumberInRange(editor, target)
    ) {
        // Use most recent selection to determine what side of the verse
        // number should be selected, then select up to the verse number
        // console.log("FOUNDDDDDDDD")
    }
    // console.log("SELECT target: ", target)
    // console.log("   editor.selection: ", editor.selection)
    select(editor, target)
}

function isVerseOrChapterNumberInRange(
    editor: Editor, 
    range: Range
) {
    if (!editor || !range) return false // Don't know why I need this
    const [match] = Editor.nodes(editor, {
        at: range,
        match: n => n && n.type && UsfmMarkers.isVerseOrChapterNumber(n.type) 
    })
    return !!match
}

const { move } = Transforms
Transforms.move = (editor: Editor, options) => {
    console.log("MOVE options: ", options)
    move(editor, options)
}

const { setPoint } = Transforms
Transforms.setPoint = (editor, props, options) => {
    console.log("POINT options: ", options)
    setPoint(editor, props, options)
}

// const { setSelection } = Transforms
// Transforms.setSelection = (editor, props) => {
//     console.log("   SET props: ", props)
//     setSelection(editor, props)
// }

function selectDOMNodeStart(
    editor: ReactEditor,
    domNode: DOMNode
) {
    const path = MyEditor.getPathFromDOMNode(editor, domNode)
    Transforms.select(
        editor,
        {
            path: path,
            offset: 0
        }
    )
}

function selectNextSiblingNonEmptyText(editor: Editor) {
    if (!Range.isCollapsed(editor.selection)) {
        return
    }
    const [textNode, path] = Editor.node(editor, editor.selection)
    if (textNode.text == "") {
        const thisPath = editor.selection.anchor.path
        const [nextNode, nextPath] = Editor.next(editor) || [null, null]
        if (nextPath && 
            Path.equals(
                Path.parent(thisPath), 
                Path.parent(nextPath)
            )
        ) {
            Transforms.select(
                editor, 
                {
                    path: nextPath,
                    offset: 0
                }
            )
        }
    }
}

function moveToEndOfLastLeaf(
    editor: Editor,
    path: Path
) {
    const [lastLeaf, lastLeafPath] = Editor.leaf(
        editor,
        path,
        { edge: "end" }
    )
    Transforms.select(
        editor,
        {
            path: lastLeafPath,
            offset: lastLeaf.text.length
        }
    )
}
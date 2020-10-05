import * as React from "react";
import { withReact, Slate, Editable, ReactEditor } from "slate-react";
import { createEditor, Transforms, Editor, Node } from 'slate';
import { renderElementByType, renderLeafByProps } from '../transforms/usfmRenderer';
import { usfmToSlate } from '../transforms/usfmToSlate';
import { withNormalize } from "../plugins/normalizeNode";
import { handleKeyPress, withBackspace, withDelete, withEnter } from '../plugins/keyHandlers';
import { slateToUsfm } from "../transforms/slateToUsfm";
import { debounce } from "debounce";
import { flowRight, isEqual } from "lodash"
import { MyTransforms } from "../plugins/helpers/MyTransforms";
import { parseIdentificationFromUsfm, 
         filterInvalidIdentification,
         mergeIdentification,
         normalizeIdentificationValues
} from "../transforms/identificationTransforms";
import { MyEditor } from "../plugins/helpers/MyEditor";
import "./default.css";
import { UsfmEditor, UsfmEditorProps, ForwardRefUsfmEditor, usfmEditorPropTypes, usfmEditorDefaultProps, ChapterAndVerse } from "../UsfmEditor";
import NodeRules from "../utils/NodeRules";
import { UsfmMarkers } from "../utils/UsfmMarkers";
import { SelectionTransforms } from "../plugins/helpers/SelectionTransforms";

export const createBasicUsfmEditor: () => ForwardRefUsfmEditor =
    () => React.forwardRef<BasicUsfmEditor, UsfmEditorProps>(({ ...props }, ref) => 
        <BasicUsfmEditor
            {...props}
            ref={ref}
        />
    )

/**
 * A WYSIWYG editor component for USFM
 */
export class BasicUsfmEditor extends React.Component<UsfmEditorProps, BasicUsfmEditorState> implements UsfmEditor {
    public static propTypes = usfmEditorPropTypes
    public static defaultProps = usfmEditorDefaultProps

    slateEditor: ReactEditor

    constructor(props: UsfmEditorProps) {
        super(props)
        this.state = {
            value: usfmToSlate(props.usfmString),
            selectedChapterAndVerse: { chapter: "", verse: "" }
        }

        this.slateEditor = flowRight(
            withBackspace,
            withDelete,
            withEnter,
            withNormalize,
            withReact,
            createEditor
        )()
        this.slateEditor.isInline = element => {
            return false
        }
    }
    
    /* UsfmEditor interface functions */

    getMarksAtCursor: () => string[] = () => {
        if (!this.slateEditor.selection) return []
        const record = Editor.marks(this.slateEditor);
        const markArray = Object.keys(record).filter((k: string) => record[k] === true);
        return markArray
    }

    addMarkAtCursor: (mark: string) => void = (mark) => {
        if (!this.slateEditor.selection) return
        Editor.addMark(this.slateEditor, mark, true)
    }

    removeMarkAtCursor: (mark: string) => void = (mark) => {
        if (!this.slateEditor.selection) return
        Editor.removeMark(this.slateEditor, mark)
    }

    getParagraphTypesAtCursor: () => string[] = () => {
        if (!this.slateEditor.selection) return []
        let types = []
        const nodes = Editor.nodes(this.slateEditor)
        //@ts-ignore
        let entry = nodes.next()
        while (!entry.done) {
            const node = entry.value[0]
            if (UsfmMarkers.isParagraphType(node)) {
                types = types.concat(node.type)
            }
            //@ts-ignore
            entry = nodes.next()
        }
        return types
    }

    setParagraphTypeAtCursor: (marker: string) => void = (marker) => {
        if (!this.slateEditor.selection) return
        Transforms.setNodes(
            this.slateEditor,
            { type: marker },
            { match: NodeRules.isFormattableBlockType }
        )
    }

    focusEditor: () => void = () => {
        ReactEditor.focus(this.slateEditor)
    }

    /* BasicUsfmEditor functions */

    handleChange: (value: Node[]) => void = value => {
        console.debug("after change", value)
        if (MyEditor.isVerseOrChapterNumberSelected(this.slateEditor)) {
            Transforms.deselect(this.slateEditor)
            return
        }
        this.setState({ value: value })
        this.updateSelectedChapterAndVerseAfterEditorChange()
        this.scheduleOnChange(value)
    }

    scheduleOnChange: (value: Node[]) => void = debounce(function(newValue) {
        const usfm = slateToUsfm(newValue)
        this.props.onChange(usfm)
    }, 200)

    onKeyDown = event => {
        handleKeyPress(event, this.slateEditor)
    }

    updateIdentificationFromProp = () => {
        const current = MyEditor.identification(this.slateEditor)
        const validUpdates = this.filterAndNormalize(this.props.identification)
        const updated = mergeIdentification(current, validUpdates)

        if (! isEqual(updated, current)) {
            MyTransforms.setIdentification(this.slateEditor, updated)
            if (this.props.onIdentificationChange) {
                this.props.onIdentificationChange(updated)
            }
        }
    }

    updateIdentificationFromUsfmAndProp = () => {
        const parsedIdentification = parseIdentificationFromUsfm(this.props.usfmString)
        const validParsed = this.filterAndNormalize(parsedIdentification)
        const validUpdates = this.filterAndNormalize(this.props.identification)
        const updated = mergeIdentification(validParsed, validUpdates)

        MyTransforms.setIdentification(this.slateEditor, updated)
        if (this.props.onIdentificationChange) {
            this.props.onIdentificationChange(updated)
        }
    }

    filterAndNormalize = (idJson: Object) => {
        const filtered = filterInvalidIdentification(idJson)
        return normalizeIdentificationValues(filtered)
    }

    moveToEndOfStartingVerseProp = () => {
        if (!this.props.startingVerse) return
        const { chapter, verse } = this.props.startingVerse
        if (!chapter || !verse) return
        const versePath = MyEditor.findVersePath(this.slateEditor, chapter, verse)
        if (versePath) {
            SelectionTransforms.moveToEndOfLastLeaf(this.slateEditor, versePath)
            ReactEditor.focus(this.slateEditor)

            const [verseNode, _] = Editor.node(this.slateEditor, versePath)
            const verseNumOrRange = Node.string(verseNode.children[0])

            this.updateSelectedChapterAndVerseIfChangeOccured(chapter, verseNumOrRange)
        }
    }

    updateSelectedChapterAndVerseAfterEditorChange = () => {
        let chapterStr = ""
        let verseNumOrRangeStr = ""
        if (this.slateEditor.selection) {
            const verseNodeEntry = MyEditor.getVerse(this.slateEditor)
            if (verseNodeEntry) {
                const [verseNode, versePath] = verseNodeEntry
                const [chapter, chapterPath] = MyEditor.getChapter(this.slateEditor)
                chapterStr = Node.string(chapter.children[0])
                verseNumOrRangeStr = Node.string(verseNode.children[0])
            }
        }
        this.updateSelectedChapterAndVerseIfChangeOccured(chapterStr, verseNumOrRangeStr)
    }

    updateSelectedChapterAndVerseIfChangeOccured = (chapter: string, verseNumOrRange: string) => {
        const [startVerse, endVerseOrUndefined] = verseNumOrRange.split("-")
        const newSelectedChapterAndVerse = {
            chapter: chapter,
            verse: startVerse
        }
        if (!isEqual(newSelectedChapterAndVerse, this.state.selectedChapterAndVerse)) {
            this.setState({ selectedChapterAndVerse: newSelectedChapterAndVerse })
            this.props.onVerseChange(
                chapter,
                startVerse,
                endVerseOrUndefined
            )
        }
    }

    componentDidMount() {
        this.updateIdentificationFromUsfmAndProp()
        this.moveToEndOfStartingVerseProp()
    }
    
    componentDidUpdate(prevProps) {
        if (prevProps.usfmString != this.props.usfmString) {
            this.updateIdentificationFromUsfmAndProp()
        } else if (prevProps.identification != this.props.identification) {
            this.updateIdentificationFromProp()
        }

        if (!isEqual(prevProps.startingVerse, this.props.startingVerse)) {
            this.moveToEndOfStartingVerseProp()
        }
    }

    render() {
        return (
            <Slate
                editor={this.slateEditor}
                value={this.state.value}
                onChange={this.handleChange}
            >
                <Editable
                    readOnly={this.props.readOnly}
                    renderElement={renderElementByType}
                    renderLeaf={renderLeafByProps}
                    spellCheck={false}
                    onKeyDown={this.onKeyDown}
                    className={"usfm-editor"}
                />
            </Slate>
        )
    }
}

interface BasicUsfmEditorState {
    value: any,
    selectedChapterAndVerse: ChapterAndVerse
}
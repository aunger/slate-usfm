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
            selectedChapterAndVerse: { chapter: null, verse: null }
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
        if (this.props.onVerseChange) {
            // No need to keep track of selected chapter and verse if onVerseChange
            // is not given
            this.updateSelectedChapterAndVerseAfterEditorChange()
        }
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
        if (!this.props.startingVerse?.chapter && !this.props.startingVerse?.verse) return

        // default to current chapter
        const chapter: number = this.props.startingVerse.chapter || this.state.selectedChapterAndVerse.chapter
        if (!chapter) return

        const verse = this.props.startingVerse.verse
        // verse could be null, but findVersePath defaults to the first verse (including front)
        const versePath = MyEditor.findVersePath(this.slateEditor, chapter, verse)
        if (!versePath) return

        const [verseNode, _] = Editor.node(this.slateEditor, versePath)
        const verseNumOrRange = Node.string(verseNode.children[0])

        if (!this.didSelectedChapterAndVerseChange(chapter, verseNumOrRange)) return

        SelectionTransforms.moveToEndOfLastLeaf(this.slateEditor, versePath)
        ReactEditor.focus(this.slateEditor)

        // No need to keep track of selected chapter and verse if onVerseChange is not given
        if (!this.props.onVerseChange) return

        this.updateSelectedChapterAndVerse(chapter, verseNumOrRange)
    }

    updateSelectedChapterAndVerseAfterEditorChange = () => {
        let chapterNum: number = null
        let verseNumOrRangeStr: string = null
        if (this.slateEditor.selection) {
            const verseNodeEntry = MyEditor.getVerse(this.slateEditor)
            if (verseNodeEntry) {
                const [verseNode, versePath] = verseNodeEntry
                const [chapter, chapterPath] = MyEditor.getChapter(this.slateEditor)
                chapterNum = parseInt(Node.string(chapter.children[0]))
                verseNumOrRangeStr = Node.string(verseNode.children[0])
            }
        }
        if (this.didSelectedChapterAndVerseChange(chapterNum, verseNumOrRangeStr)) {
            this.updateSelectedChapterAndVerse(chapterNum, verseNumOrRangeStr)
        }
    }

    updateSelectedChapterAndVerse(chapter: number, verseNumOrRange: string) {
        const { startVerse, endVerse } = getStartAndEndVerse(verseNumOrRange)
        const newSelectedChapterAndVerse = {
            chapter: chapter,
            verse: startVerse
        }
        this.setState({ selectedChapterAndVerse: newSelectedChapterAndVerse })

        if (!this.props.onVerseChange) return
        this.props.onVerseChange(
            chapter,
            startVerse,
            endVerse
        )
    }

    didSelectedChapterAndVerseChange(chapter: number, verseNumOrRange: string) {
        const { startVerse, endVerse } = getStartAndEndVerse(verseNumOrRange)
        const newSelectedChapterAndVerse = {
            chapter: chapter,
            verse: startVerse
        }
        return ! isEqual(newSelectedChapterAndVerse, this.state.selectedChapterAndVerse)
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

        if (! isEqual(prevProps.startingVerse, this.props.startingVerse)) {
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

interface StartAndEndVerse {
    startVerse: number,
    endVerse: number
}
    
function getStartAndEndVerse(verseNumOrRange: string): StartAndEndVerse {
    const [startVerseStr, endVerseStr] = verseNumOrRange?.split("-") ?? [null, null]
    const startVerse = parseInt(startVerseStr) || null // parseInt(null) returns NaN
    const endVerse = parseInt(endVerseStr) || null
    return { startVerse, endVerse }
}
import * as React from "react";
import { withReact, Slate, Editable, ReactEditor } from "slate-react";
import { createEditor, Transforms, Node, Editor } from 'slate';
import { renderElementByType, renderLeafByProps } from '../transforms/usfmRenderer';
import { usfmToSlate } from '../transforms/usfmToSlate';
import { withNormalize } from "../plugins/normalizeNode";
import { handleKeyPress, withBackspace, withDelete, withEnter } from '../plugins/keyHandlers';
import { HoveringToolbar } from "./HoveringToolbar";
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
import { PropTypes } from "prop-types" 
import "./default.css";
import { UsfmEditor } from "./UsfmEditor";
import { SelectionTransforms } from "../plugins/helpers/SelectionTransforms";

/**
 * A WYSIWYG editor component for USFM
 */
export class BasicUsfmEditor extends UsfmEditor {
    constructor(props) {
        super(props)
        this.state = {
            value: usfmToSlate(props.usfmString),
            selectedVerse: {
                chapter: "",
                verse: "" // the start verse of a range
            }
        }

        /* Override UsfmEditor's default baseEditor() function */
        this.baseEditor = () => this.slateEditor

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

        this.handleChange = value => {
            console.debug("after change", value)
            if (MyEditor.isVerseOrChapterNumberSelected(this.slateEditor)) {
                Transforms.deselect(this.slateEditor)
                return
            }
            this.setState({ value: value })
            this.updateSelectedVerse()
            this.scheduleOnChange(value)
        }

        this.scheduleOnChange = debounce(function(newValue) {
            const usfm = slateToUsfm(newValue)
            this.props.onChange(usfm)
        }, 200)

        this.onKeyDown = event => {
            handleKeyPress(event, this.slateEditor)
        }

        this.updateIdentificationFromProp = () => {
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

        this.updateIdentificationFromUsfmAndProp = () => {
            const parsedIdentification = parseIdentificationFromUsfm(this.props.usfmString)
            const validParsed = this.filterAndNormalize(parsedIdentification)
            const validUpdates = this.filterAndNormalize(this.props.identification)
            const updated = mergeIdentification(validParsed, validUpdates)

            MyTransforms.setIdentification(this.slateEditor, updated)
            if (this.props.onIdentificationChange) {
                this.props.onIdentificationChange(updated)
            }
        }

        this.filterAndNormalize = (idJson) => {
            const filtered = filterInvalidIdentification(idJson)
            return normalizeIdentificationValues(filtered)
        }

        this.moveToEndOfStartingVerse = () => {
            if (!this.props.startingVerse) return
            const { chapter, verse } = this.props.startingVerse
            if (!chapter || !verse) return
            const versePath = MyEditor.findVersePath(this.slateEditor, chapter, verse)
            if (versePath) {
                SelectionTransforms.moveToEndOfLastLeaf(this.slateEditor, versePath)
                ReactEditor.focus(this.slateEditor)

                const [verseNode, _] = Editor.node(this.slateEditor, versePath)
                const verseNumOrRange = Node.string(verseNode.children[0])
                const [start, endOrNull] = verseNumOrRange.split("-")
                this.setState({ selectedVerse: {
                    chapter: chapter,
                    verse: start
                }})
                this.props.onVerseChange(
                    chapter, 
                    start, 
                    endOrNull ? endOrNull : ""
                )
            }
        }

        this.updateSelectedVerse = () => {
            let newSelectedChapter = ""
            let newSelectedVerse = ""
            if (this.slateEditor.selection) {
                const verseResult = MyEditor.getVerse(this.slateEditor)
                if (verseResult) {
                    const [verse, versePath] = verseResult
                    const [chapter, chapterPath] = MyEditor.getChapter(this.slateEditor)
                    newSelectedChapter = Node.string(chapter.children[0])
                    newSelectedVerse = Node.string(verse.children[0])
                }
            }
            const [startVerse, endVerseOrNull] = newSelectedVerse.split("-")
            const newSelectedChapterVerse = {
                chapter: newSelectedChapter,
                verse: startVerse
            }
            if (!isEqual(newSelectedChapterVerse, this.state.selectedVerse)) {
                this.setState({ selectedVerse: newSelectedChapterVerse })
                this.props.onVerseChange(
                    newSelectedChapter, 
                    startVerse, 
                    endVerseOrNull ? endVerseOrNull : ""
                )
            }
        }
    }

    componentDidMount() {
        this.updateIdentificationFromUsfmAndProp()
        this.moveToEndOfStartingVerse()
    }
    
    componentDidUpdate(prevProps) {
        if (prevProps.usfmString != this.props.usfmString) {
            this.updateIdentificationFromUsfmAndProp()
        } else if (prevProps.identification != this.props.identification) {
            this.updateIdentificationFromProp()
        }

        if (!isEqual(prevProps.startingVerse, this.props.startingVerse)) {
            this.moveToEndOfStartingVerse()
        }
    }

    render() {
        return (
            <Slate
                editor={this.slateEditor}
                value={this.state.value}
                onChange={this.handleChange}
            >
                <HoveringToolbar />
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

BasicUsfmEditor.propTypes = {
    usfmString: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    readOnly: PropTypes.bool.isRequired,
    identification: PropTypes.object,
    onIdentificationChange: PropTypes.func
}
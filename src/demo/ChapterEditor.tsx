import * as React from "react";
import { UsfmEditor, ForwardRefUsfmEditor, HocUsfmEditorProps, usfmEditorPropTypes, usfmEditorDefaultProps, ChapterAndVerse } from "../UsfmEditor";
import { NoopUsfmEditor } from "../NoopUsfmEditor";

export function withChapterPaging(WrappedEditor: ForwardRefUsfmEditor): ForwardRefUsfmEditor {
    return React.forwardRef<ChapterEditor, HocUsfmEditorProps>(({ ...props }, ref) =>
        <ChapterEditor
            {...props}
            wrappedEditor={WrappedEditor}
            ref={ref} // used to access the ChapterEditor and its API
        />
    )
}

class ChapterEditor extends React.Component<HocUsfmEditorProps, ChapterEditorState> implements UsfmEditor {
    public static propTypes = usfmEditorPropTypes
    public static defaultProps = usfmEditorDefaultProps

    constructor(props: HocUsfmEditorProps) {
        super(props)
        this.state = {
            startingVerse: undefined,
            selectedVerse: {
                chapter: "",
                verse: "",
                verseRangeEnd: ""
            }
        }
    }

    wrappedEditorRef = React.createRef<UsfmEditor>()
    wrappedEditorInstance: () => UsfmEditor = () => 
        this.wrappedEditorRef.current ?? new NoopUsfmEditor()
    
    /* UsfmEditor API */

    getMarksAtCursor = () =>
        this.wrappedEditorInstance().getMarksAtCursor()

    addMarkAtCursor = (mark: string) =>
        this.wrappedEditorInstance().addMarkAtCursor(mark)

    removeMarkAtCursor = (mark: string) =>
        this.wrappedEditorInstance().removeMarkAtCursor(mark)

    getParagraphTypesAtCursor = () =>
        this.wrappedEditorInstance().getParagraphTypesAtCursor()

    setParagraphTypeAtCursor = (marker: string) =>
        this.wrappedEditorInstance().setParagraphTypeAtCursor(marker)

    focusEditor = () => {
        this.wrappedEditorInstance().focusEditor()
    }

    /* End UsfmEditor API */

    onStartingVerseChange = (startingVerse: ChapterAndVerse) => {
        this.setState({ startingVerse: startingVerse })
        this.focusEditor()
    }

    onVerseChange = (chapter: string, verse: string, verseRangeEnd?: string) => {
        const selectedVerse = {
            chapter: chapter,
            verse: verse,
            verseRangeEnd: verseRangeEnd
        }
        this.setState({ selectedVerse: selectedVerse })
    }

    render() {
        return (
            <React.Fragment>
                <StartingVerseSelector
                    onChange={this.onStartingVerseChange} />
                <SelectedVerseTracker
                    selectedVerse={this.state.selectedVerse} />
                <hr className="hr-separator"/>
                <this.props.wrappedEditor 
                    {...this.props} 
                    ref={this.wrappedEditorRef} 
                    startingVerse={this.state.startingVerse}
                    onVerseChange={this.onVerseChange}
                />
            </React.Fragment>
        )
    }
}

type ChapterVerseAndRangeEnd = {chapter: string, verse: string, verseRangeEnd: string}

type ChapterEditorState = {
    startingVerse: ChapterAndVerse,
    selectedVerse: ChapterVerseAndRangeEnd
}

const StartingVerseSelector = ({ onChange }) => {
    const chapterInputRef = React.createRef<HTMLInputElement>()
    const verseInputRef = React.createRef<HTMLInputElement>()
    return (
        <div>
            <div className="row">
                <div className="column">
                    <h4 className="demo-header no-margin-top">
                        Starting Verse
                    </h4>
                </div>
            </div>
            Chapter:
            <input 
                className="verse-selector-input"
                type="text" 
                ref={chapterInputRef} 
            />
            Verse:
            <input 
                className="verse-selector-input"
                type="text" 
                ref={verseInputRef} 
            />
            <button onClick={event => 
                onChange({ 
                    chapter: chapterInputRef.current.value,
                    verse: verseInputRef.current.value
                })
            }>Set</button>
        </div>
    )
}

const SelectedVerseTracker = ({ selectedVerse }) => {
    return (
        <div>
            <div className="row">
                <div className="column">
                    <h4 className="demo-header">
                        Selected Verse Tracker
                    </h4>
                </div>
            </div>
            <span className="verse-tracker-text">
                Chapter: {selectedVerse.chapter}
            </span>
            <span className="verse-tracker-text">
                Verse: {selectedVerse.verse}
            </span>
            <span className="verse-tracker-text">
                VerseRangeEnd: {selectedVerse.verseRangeEnd}
            </span>
        </div>
    )
}
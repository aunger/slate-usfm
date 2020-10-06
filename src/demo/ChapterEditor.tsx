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
                chapter: null,
                verse: null,
                verseRangeEnd: null
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

    onVerseChange = (chapter: number, verse: number, verseRangeEnd?: number) => {
        const selectedVerse = {
            chapter: chapter,
            verse: verse,
            verseRangeEnd: verseRangeEnd
        }
        const startingVerse = {
            chapter: chapter,
            verse: verse
        }
        this.setState({ selectedVerse: selectedVerse })
        this.setState({ startingVerse: startingVerse })
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

type ChapterVerseAndRangeEnd = {chapter: number, verse: number, verseRangeEnd: number}

type ChapterEditorState = {
    startingVerse: ChapterAndVerse,
    selectedVerse: ChapterVerseAndRangeEnd
}


const StartingVerseSelector: React.FunctionComponent<StartingVerseSelectorProps> = ({ onChange }) => {
    const chapterInputRef = React.createRef<HTMLInputElement>()
    const verseInputRef = React.createRef<HTMLInputElement>()
    return (
        <div>
            <div className="row">
                <div className="column">
                    <h4 className="demo-header no-margin-top">
                        Set startingVerse prop here:
                    </h4>
                </div>
            </div>
            Chapter:
            <input 
                className="verse-selector-input"
                type="text" 
                onKeyPress={allowOnlyNumbers}
                ref={chapterInputRef} 
            />
            Verse:
            <input 
                className="verse-selector-input"
                type="text" 
                onKeyPress={allowOnlyNumbers}
                ref={verseInputRef} 
            />
            <button onClick={event => 
                onChange({ 
                    chapter: parseInt(chapterInputRef.current.value),
                    verse: parseInt(verseInputRef.current.value)
                })
            }>Set</button>
        </div>
    )
}

interface StartingVerseSelectorProps {
    onChange: (startingVerse: ChapterAndVerse) => void
}

const SelectedVerseTracker: React.FunctionComponent<SelectedVerseTrackerProps> = ({ selectedVerse }) => {
    return (
        <div>
            <div className="row">
                <div className="column">
                    <h4 className="demo-header">
                        Populated by onVerseChange:
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

interface SelectedVerseTrackerProps {
    selectedVerse: ChapterVerseAndRangeEnd
}

const allowOnlyNumbers = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.charCode < 48 || event.charCode > 57) // allow only 0-9
    {
        event.preventDefault();
    }
}
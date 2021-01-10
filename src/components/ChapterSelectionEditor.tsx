import * as React from "react"
import {
    UsfmEditorRef,
    ForwardRefUsfmEditor,
    HocUsfmEditorProps,
    usfmEditorPropTypes,
    usfmEditorDefaultProps,
    Verse,
    VerseWithTimeMs,
} from "../UsfmEditor"
import { NoopUsfmEditor } from "../NoopUsfmEditor"
import { UsfmEditorProps } from ".."

export function withChapterSelection<W extends UsfmEditorRef>(
    WrappedEditor: ForwardRefUsfmEditor<W>
): ForwardRefUsfmEditor<ChapterSelectionEditor<W>> {
    const fc = React.forwardRef<ChapterSelectionEditor<W>, UsfmEditorProps>(
        ({ ...props }, ref) => (
            <ChapterSelectionEditor
                {...props}
                wrappedEditor={WrappedEditor}
                ref={ref} // used to access the ChapterSelectionEditor and its API
            />
        )
    )
    fc.displayName = (WrappedEditor.displayName ?? "") + "withChapterApiTest"
    return fc
}

class ChapterSelectionEditor<W extends UsfmEditorRef>
    extends React.Component<HocUsfmEditorProps<W>, ChapterSelectionEditorState>
    implements UsfmEditorRef {
    public static propTypes = usfmEditorPropTypes
    public static defaultProps = usfmEditorDefaultProps

    constructor(props: HocUsfmEditorProps<W>) {
        super(props)
        this.state = {
            goToVersePropValue: props.goToVerse,
        }
    }

    wrappedEditorRef = React.createRef<W>()
    wrappedEditorInstance: () => UsfmEditorRef = () =>
        this.wrappedEditorRef.current ?? new NoopUsfmEditor()

    /* UsfmEditor API */

    getMarksAtCursor = () => this.wrappedEditorInstance().getMarksAtCursor()

    addMarkAtCursor = (mark: string) =>
        this.wrappedEditorInstance().addMarkAtCursor(mark)

    removeMarkAtCursor = (mark: string) =>
        this.wrappedEditorInstance().removeMarkAtCursor(mark)

    getParagraphTypesAtCursor = () =>
        this.wrappedEditorInstance().getParagraphTypesAtCursor()

    setParagraphTypeAtCursor = (marker: string) =>
        this.wrappedEditorInstance().setParagraphTypeAtCursor(marker)

    goToVerse = (verseObject: Verse) =>
        this.wrappedEditorInstance().goToVerse(verseObject)

    /* End UsfmEditor API */

    setGoToVerseProp = (chapterStr: string, verseStr: string) => {
        const chapter = parseInt(chapterStr)
        const verse = parseInt(verseStr)
        if (chapter >= 0 && verse >= 0) {
            this.setState({
                goToVersePropValue: {
                    chapter: chapter,
                    verse: verse,
                    timeMs: Date.now(),
                },
            })
        }
    }

    render() {
        return (
            <React.Fragment>
                <VerseSelector onChange={this.setGoToVerseProp} />
                <hr className="hr-separator" />
                <this.props.wrappedEditor
                    {...this.props}
                    ref={this.wrappedEditorRef}
                    goToVerse={this.state.goToVersePropValue}
                />
            </React.Fragment>
        )
    }
}

type ChapterSelectionEditorState = {
    goToVersePropValue?: VerseWithTimeMs
}

const VerseSelector: React.FC<VerseSelectorProps> = ({
    onChange,
}: VerseSelectorProps) => {
    const chapterInputRef = React.createRef<HTMLInputElement>()
    const verseInputRef = React.createRef<HTMLInputElement>()
    return (
        <div className="verse-selector">
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
            <button
                onClick={(event) => {
                    if (chapterInputRef.current && verseInputRef.current)
                        onChange(
                            chapterInputRef.current.value,
                            verseInputRef.current.value
                        )
                }}
            >
                Go
            </button>
        </div>
    )
}

interface VerseSelectorProps {
    onChange: (chapterStr: string, verseStr: string) => void
}

const allowOnlyNumbers = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.charCode < 48 || event.charCode > 57) {
        // allow only 0-9
        event.preventDefault()
    }
}

import PropTypes from "prop-types" 

export interface UsfmEditor {
    getMarksAtCursor: () => string[] | Record<string, any>
    addMarkAtCursor: (mark: string) => void
    removeMarkAtCursor: (mark: string) => void
    getParagraphTypesAtCursor: () => string[]
    setParagraphTypeAtCursor: (marker: string) => void

    addVerseToEnd: (chapter: bigint) => void
    removeLastVerse: (chapter: bigint) => void
    joinVerseWithPrevious: (chapter: bigint, verse: bigint) => void
    unjoinVerseRange: (chapter: bigint, verse: bigint) => void
    addChapterToEnd(): () => void
    removeLastChapter(): () => void
}

export interface UsfmEditorProps {
    usfmString: string,
    onChange?: (usfm: string) => void,
    readOnly?: boolean,
    identification?: Object,
    onIdentificationChange?: (identification: Object) => void

    goToReference?: ChapterVerse
    onReferenceChanged?: (r: ChapterVerse) => void
}

export type ChapterVerse = [bigint, bigint]

export const usfmEditorPropTypes = {
    usfmString: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    readOnly: PropTypes.bool,
    identification: PropTypes.object,
    onIdentificationChange: PropTypes.func,
}

export const usfmEditorDefaultProps = {
    onChange: () => {},
    readOnly: false,
    identification: {},
    onIdentificationChange: () => {}
}

export type ForwardRefUsfmEditor = React.ForwardRefExoticComponent<UsfmEditorProps & React.RefAttributes<UsfmEditor>>

// "Higher order component" Usfm Editor Props, for an editor that will wrap another editor
export type HocUsfmEditorProps = UsfmEditorProps & HasWrappedEditor

interface HasWrappedEditor {
    wrappedEditor: ForwardRefUsfmEditor
}
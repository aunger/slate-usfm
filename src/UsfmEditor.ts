import PropTypes from "prop-types" 

export interface UsfmEditor {
    getMarksAtCursor: () => string[]
    addMarkAtCursor: (mark: string) => void
    removeMarkAtCursor: (mark: string) => void
    getParagraphTypesAtCursor: () => string[]
    setParagraphTypeAtCursor: (marker: string) => void
    focusEditor: () => void
}

export interface UsfmEditorProps {
    usfmString: string,
    onChange?: (usfm: string) => void,
    readOnly?: boolean,
    identification?: Object,
    onIdentificationChange?: (identification: Object) => void,
    startingVerse?: ChapterAndVerse,
    // If the verse is a range, "verse" will be the start of the range and
    // "verseRangeEnd" will have a value.
    onVerseChange?: (chapter: string, verse: string, verseRangeEnd?: string) => void
}

export const usfmEditorPropTypes = {
    usfmString: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    readOnly: PropTypes.bool,
    identification: PropTypes.object,
    onIdentificationChange: PropTypes.func,
    startingVerse: PropTypes.object,
    onVerseChange: PropTypes.func
}

export const usfmEditorDefaultProps = {
    onChange: () => {},
    readOnly: false,
    identification: {},
    onIdentificationChange: () => {},
    startingVerse: undefined,
    onVerseChange: undefined
}

// If the verse is a range, "verse" will be the start of the range.
export type ChapterAndVerse = {chapter: string, verse: string}

export type ForwardRefUsfmEditor = React.ForwardRefExoticComponent<UsfmEditorProps & React.RefAttributes<UsfmEditor>>

// "Higher order component" Usfm Editor Props, for an editor that will wrap another editor
export type HocUsfmEditorProps = UsfmEditorProps & HasWrappedEditor

interface HasWrappedEditor {
    wrappedEditor: ForwardRefUsfmEditor
}
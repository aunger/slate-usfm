export type UsfmEditor = React.Component<UsfmEditorProps> & IUsfmEditor

export type ForwardRefUsfmEditor = React.ForwardRefExoticComponent<UsfmEditorProps & React.RefAttributes<UsfmEditor>>

interface HasWrappedEditor {
    wrappedEditor: ForwardRefUsfmEditor
}

export type HOCEditorProps = UsfmEditorProps & HasWrappedEditor

export interface IUsfmEditor {
    getMarksAtCursor: () => string[] | Record<string, any>
    addMarkAtCursor: (mark: string) => void
    removeMarkAtCursor: (mark: string) => void
    getParagraphTypesAtCursor: () => string[]
    setParagraphTypeAtCursor: (marker: string) => void
}

export interface UsfmEditorProps {
    usfmString: string,
    onChange: (usfm: string) => void,
    readOnly: boolean,
    identification: Object,
    onIdentificationChange: (identification: Object) => void
    startingVerse: StartingVerse,
    onVerseChange: (chapter: string, verse: string, endVerseOrNull: string) => void
}

export type StartingVerse = {chapter: string, verse: string} | null | undefined
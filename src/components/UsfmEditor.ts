export type UsfmEditor = React.Component<UsfmEditorProps> & IUsfmEditor

export type ForwardRefUsfmEditor = React.ForwardRefExoticComponent<UsfmEditorProps & React.RefAttributes<UsfmEditor>>

interface HasWrappedEditor {
    wrappedEditor: React.ForwardRefExoticComponent<UsfmEditorProps & React.RefAttributes<HasUsfmEditorAPI>>
    // wrappedEditor: ForwardRefUsfmEditor
}

export type HOCEditorProps = UsfmEditorProps & HasWrappedEditor

export interface IUsfmEditor {
    getMarksAtCursor: () => string[] | Record<string, any>
    addMarkAtCursor: (mark: string) => void
    removeMarkAtCursor: (mark: string) => void
    getParagraphTypesAtCursor: () => string[]
    setParagraphTypeAtCursor: (marker: string) => void
}

export interface HasUsfmEditorAPI {
    API: IUsfmEditor
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
export interface UsfmEditor {
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
}

export type ForwardRefUsfmEditor = React.ForwardRefExoticComponent<UsfmEditorProps & React.RefAttributes<UsfmEditor>>

// "Higher order component" Usfm Editor Props, for an editor that will wrap another editor
export type HocUsfmEditorProps = UsfmEditorProps & HasWrappedEditor

interface HasWrappedEditor {
    wrappedEditor: ForwardRefUsfmEditor
}
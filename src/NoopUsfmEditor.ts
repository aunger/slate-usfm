import { UsfmEditorRef } from "./UsfmEditor"

export class NoopUsfmEditor implements UsfmEditorRef {
    getMarksAtCursor = (): string[] => {
        console.debug(
            "Editor not initialized before getMarksAtCursor called. " +
                "This does not necessarily indicate an error."
        )
        return []
    }
    addMarkAtSelection = (): void => {
        console.error("Editor not initialized before addMarkAtSelection called")
    }
    removeMarkAtSelection = (): void => {
        console.error("Editor not initialized before removeMarkAtSelection called")
    }
    getParagraphTypesAtSelection = (): string[] => {
        console.debug(
            "Editor not initialized before getParagraphTypesAtSelection called. " +
                "This does not necessarily indicate an error."
        )
        return []
    }
    setParagraphTypeAtSelection = (): void => {
        console.error(
            "Editor not initialized before setParagraphTypeAtSelection called"
        )
    }
    goToVerse = (): void => {
        console.error("Editor not initialized before goToVerse called")
    }
}

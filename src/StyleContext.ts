import { createContext } from 'react';

export const StyleContext = createContext({
    editorBackgroundColor: "white",
    paragraphIndent: "0em",
    fontSize: "1em",
    verseNumberFontSize: "100%",
    chapterNumberFontSize: "200%"
})
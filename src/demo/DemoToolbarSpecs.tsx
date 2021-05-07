import FormatItalicButton from "@material-ui/icons/FormatItalic"
import { ReactComponent as AppleLogo } from "./apple-logo.svg"
import { UsfmMarkers } from "../utils/UsfmMarkers"
import { ToolbarSpecs } from "../components/UsfmToolbar"

export const DemoToolbarSpecs: ToolbarSpecs = {
    "Section Header": {
        icon: "S",
        cssClass: "s-toolbar-button",
        actionSpec: {
            buttonType: "ParagraphButton",
            usfmMarker: UsfmMarkers.TITLES_HEADINGS_LABELS.s,
            additionalAction: () =>
                console.log("Section header button pressed!"),
        },
    },
    "Quoted Book Title": {
        icon: AppleLogo,
        cssClass: "bk-toolbar-button",
        actionSpec: {
            buttonType: "MarkButton",
            usfmMarker: UsfmMarkers.SPECIAL_TEXT.bk,
        },
    },
    "Nomen Domini": {
        icon: FormatItalicButton,
        cssClass: "nd-toolbar-button",
        actionSpec: {
            buttonType: "MarkButton",
            usfmMarker: UsfmMarkers.SPECIAL_TEXT.nd,
        },
    },
}

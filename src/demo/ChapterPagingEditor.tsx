import * as React from "react";
import { Button } from "../components/menu/menuComponents";
import { UsfmMarkers } from "../utils/UsfmMarkers";
import { UsfmEditor, UsfmEditorProps, IUsfmEditor, ForwardRefUsfmEditor } from "../components/UsfmEditor";

export function withChapterPaging(Editor: ForwardRefUsfmEditor): ForwardRefUsfmEditor {
    class ChapterPagingEditor extends React.Component<UsfmEditorProps> implements IUsfmEditor {

        constructor(props: UsfmEditorProps) {
            super(props)
        }

        childEditorRef = React.createRef<UsfmEditor>()
        childEditor: () => UsfmEditor | undefined = () => this.childEditorRef.current

        getMarksAtCursor = () =>
            this.childEditor() ? this.childEditor().getMarksAtCursor() : []

        addMarkAtCursor = (mark: string) =>
            this.childEditor() ? this.childEditor().addMarkAtCursor(mark) : {}

        removeMarkAtCursor = (mark: string) =>
            this.childEditor() ? this.childEditor().removeMarkAtCursor(mark) : {}

        getParagraphTypesAtCursor = () =>
            this.childEditor() ? this.childEditor().getParagraphTypesAtCursor() : []

        setParagraphTypeAtCursor = (marker: string) =>
            this.childEditor() ? this.childEditor().setParagraphTypeAtCursor(marker) : {}

        render() {
            return (
                <React.Fragment>
                    <Editor {...this.props} ref={this.childEditorRef} />
                    <MarkButton mark={UsfmMarkers.SPECIAL_TEXT.nd} text="nd" editor={this} />
                </React.Fragment>
            )
        }
    }

    return React.forwardRef<ChapterPagingEditor, UsfmEditorProps>(({ ...props }, ref) => 
        <ChapterPagingEditor
            {...props}
            ref={ref}
        />
    )
}

export const MarkButton = ({ mark, text, editor }) => {
    return (
        //@ts-ignore
        <Button
            active={isMarkActive(editor, mark)}
            onMouseDown={event => {
                event.preventDefault()
                toggleMark(editor, mark)
            }}
        >
            {text}
        </Button>
    )
}

const isMarkActive = (editor: UsfmEditor, mark: string) => {
    const marks = editor.getMarksAtCursor()
    return marks ? marks[mark] === true : false
}

const toggleMark = (editor: UsfmEditor, mark: string) => {
    const isActive = isMarkActive(editor, mark)
    if (isActive) {
        editor.removeMarkAtCursor(mark)
    } else {
        editor.addMarkAtCursor(mark)
    }
}
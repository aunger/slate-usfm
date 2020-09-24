import * as React from "react";
import { Button } from "../components/menu/menuComponents";
import { UsfmMarkers } from "../utils/UsfmMarkers";
import { UsfmEditor, UsfmEditorProps, IUsfmEditor, ForwardRefUsfmEditor } from "../components/UsfmEditor";

export function withChapterPaging(WrappedEditor: ForwardRefUsfmEditor): ForwardRefUsfmEditor {
    class ChapterPagingEditor extends React.Component<UsfmEditorProps> implements IUsfmEditor {

        constructor(props: UsfmEditorProps) {
            super(props)
        }

        wrappedEditorRef = React.createRef<UsfmEditor>()
        wrappedEditorInstance: () => UsfmEditor | undefined = () => this.wrappedEditorRef.current

        getMarksAtCursor = () =>
            this.wrappedEditorInstance() ? this.wrappedEditorInstance().getMarksAtCursor() : []

        addMarkAtCursor = (mark: string) =>
            this.wrappedEditorInstance() ? this.wrappedEditorInstance().addMarkAtCursor(mark) : {}

        removeMarkAtCursor = (mark: string) =>
            this.wrappedEditorInstance() ? this.wrappedEditorInstance().removeMarkAtCursor(mark) : {}

        getParagraphTypesAtCursor = () =>
            this.wrappedEditorInstance() ? this.wrappedEditorInstance().getParagraphTypesAtCursor() : []

        setParagraphTypeAtCursor = (marker: string) =>
            this.wrappedEditorInstance() ? this.wrappedEditorInstance().setParagraphTypeAtCursor(marker) : {}

        render() {
            return (
                <React.Fragment>
                    <WrappedEditor {...this.props} ref={this.wrappedEditorRef} />
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
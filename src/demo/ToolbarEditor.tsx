import * as React from "react";
import { cx, css } from "emotion";
import { Button } from "../components/menu/menuComponents";
import { UsfmMarkers } from "../utils/UsfmMarkers";
import { UsfmEditor, UsfmEditorProps, IUsfmEditor, ForwardRefUsfmEditor } from "../components/UsfmEditor";

export function withToolbar(Editor: ForwardRefUsfmEditor): ForwardRefUsfmEditor {
    class ToolbarEditor extends React.Component<UsfmEditorProps> implements IUsfmEditor {

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
                    <UsfmToolbar editor={this} />
                    <Editor {...this.props} ref={this.childEditorRef} />
                </React.Fragment>
            )
        }
    }

    return React.forwardRef<ToolbarEditor, UsfmEditorProps>(({ ...props }, ref) =>
        <ToolbarEditor
            {...props}
            ref={ref}
        />
    )
}

const UsfmToolbar = ({editor}) => {
    return (
      //@ts-ignore
        <Toolbar>
            <MarkButton mark={UsfmMarkers.SPECIAL_TEXT.nd} text="nd" editor={editor} />
            <MarkButton mark={UsfmMarkers.SPECIAL_TEXT.bk} text="bk" editor={editor} />
            <BlockButton marker={UsfmMarkers.TITLES_HEADINGS_LABELS.s} text="S" editor={editor} /> 
        </Toolbar>
    )
}

//@ts-ignore
const Toolbar = React.forwardRef(({ className, ...props }, ref) => (
    <Menu
      {...props}
      ref={ref}
      //@ts-ignore
        className={cx(
        className,
        css`
          position: relative;
          padding: 1px 18px 17px;
          margin: 0 -20px;
          border-bottom: 2px solid #eee;
          margin-bottom: 20px;
          background-color: blue;
        `
      )}
    />
  ))

  //@ts-ignore
  export const Menu = React.forwardRef(({ className, ...props }, ref) => (
    <div
      {...props}
      //@ts-ignore
      ref={ref}
      className={cx(
        className,
        css`
          & > * {
            display: inline-block;
          }
  
          & > * + * {
            margin-left: 15px;
          }
        `
      )}
    />
  ))

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

export const BlockButton = ({ marker, text, editor }) => {
    return (
        //@ts-ignore
        <Button
            active={isBlockActive(editor, marker)}
            onMouseDown={event => {
                event.preventDefault()
                toggleBlock(editor, marker)
            }}
        >
            {text}
        </Button>
    )
}

const isBlockActive = (editor: UsfmEditor, marker: string) => {
    const types = editor.getParagraphTypesAtCursor()
    return types.includes(marker)
}

const toggleBlock = (editor: UsfmEditor, marker: string) => {
    const isActive = isBlockActive(editor, marker)
    if (isActive) {
        editor.setParagraphTypeAtCursor(UsfmMarkers.PARAGRAPHS.p)
    } else {
        editor.setParagraphTypeAtCursor(marker)
    }
}
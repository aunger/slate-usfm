import * as React from "react";
import { BasicUsfmEditor } from "../components/BasicUsfmEditor";
import { cx, css } from "emotion";
import { Button } from "../components/menu/menuComponents";
import { UsfmMarkers } from "../utils/UsfmMarkers";
import { UsfmEditor } from "../components/UsfmEditor";

export class ToolbarEditor extends UsfmEditor {
    constructor(props) {
        super(props)
    }
    render() {
        return (
            <React.Fragment>
                <Toolbar>
                    <MarkButton mark={UsfmMarkers.SPECIAL_TEXT.nd} text="nd" editor={this} />
                    <MarkButton mark={UsfmMarkers.SPECIAL_TEXT.bk} text="bk" editor={this} />
                    <BlockButton marker={UsfmMarkers.TITLES_HEADINGS_LABELS.s} text="S" editor={this} /> 
                </Toolbar>
                <BasicUsfmEditor
                    usfmString={this.props.usfmString}
                    key={this.props.usfmString}
                    onChange={this.props.onChange}
                    readOnly={this.props.readOnly}
                    identification={this.props.identification}
                    onIdentificationChange={this.props.onIdentificationChange}
                    ref={this.childEditorRef}
                />
            </React.Fragment>
        )
    }
}

const Toolbar = React.forwardRef(({ className, ...props }, ref) => (
    <Menu
      {...props}
      ref={ref}
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

  export const Menu = React.forwardRef(({ className, ...props }, ref) => (
    <div
      {...props}
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

const isMarkActive = (editor, mark) => {
    const marks = editor.getMarksAtCursor()
    return marks ? marks[mark] === true : false
}

const toggleMark = (editor, mark) => {
    const isActive = isMarkActive(editor, mark)
    if (isActive) {
        editor.removeMarkAtCursor(mark)
    } else {
        editor.addMarkAtCursor(mark)
    }
}

export const BlockButton = ({ marker, text, editor }) => {
    return (
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

const isBlockActive = (editor, marker) => {
    const types = editor.getParagraphTypesAtCursor()
    return types.includes(marker)
}

const toggleBlock = (editor, marker) => {
    const isActive = isBlockActive(editor, marker)
    if (isActive) {
        editor.setParagraphTypeAtCursor(UsfmMarkers.PARAGRAPHS.p)
    } else {
        editor.setParagraphTypeAtCursor(marker)
    }
}
import * as React from "react"
import { Button, Icon, Tooltip } from "@material-ui/core"
import { UsfmEditorRef } from ".."
import { ActionSpec, ToolbarButtonSpec } from "./UsfmToolbar"

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
    editor,
    buttonSpec,
    buttonLabel,
}: ToolbarButtonProps) => {
    const { icon, cssClass, actionSpec } = buttonSpec
    return (
        <Tooltip title={buttonLabel} enterDelay={500}>
            <Button
                disableRipple
                disableFocusRipple
                aria-label={buttonLabel.toLowerCase()}
                disabled={isDisabled(actionSpec, editor)}
                onMouseDown={(event: React.MouseEvent) =>
                    onClick(event, actionSpec, editor)
                }
                className={`toolbar-button toolbar-button-${
                    isActive(actionSpec, editor) ? "active" : "inactive"
                } ${cssClass}`.trim()}
            >
                {typeof icon == "string" ? (
                    icon
                ) : (
                    <Icon component={icon} className="toolbar-icon" />
                )}
            </Button>
        </Tooltip>
    )
}

interface ToolbarButtonProps {
    editor: UsfmEditorRef
    buttonSpec: ToolbarButtonSpec
    buttonLabel: string
}

const isDisabled = (actionSpec: ActionSpec, editor: UsfmEditorRef): boolean => {
    return (
        actionSpec.buttonType == "BlockButton" &&
        editor.getParagraphTypesAtCursor().length > 1
    )
}

const isActive = (actionSpec: ActionSpec, editor: UsfmEditorRef): boolean => {
    switch (actionSpec.buttonType) {
        case "ActionButton":
            return actionSpec.isActive(editor)
        case "MarkButton":
            return isMarkActive(editor, actionSpec.usfmMarker)
        case "BlockButton":
            return isBlockActive(editor, actionSpec.usfmMarker)
    }
}

const onClick = (
    event: React.MouseEvent,
    actionSpec: ActionSpec,
    editor: UsfmEditorRef
) => {
    event.preventDefault()
    switch (actionSpec.buttonType) {
        case "ActionButton":
            actionSpec.action(editor)
            return
        case "MarkButton":
            editor.toggleMarkAtCursor(actionSpec.usfmMarker)
            if (actionSpec.additionalAction) actionSpec.additionalAction(editor)
            return
        case "BlockButton":
            editor.toggleParagraphTypeAtCursor(actionSpec.usfmMarker)
            if (actionSpec.additionalAction) actionSpec.additionalAction(editor)
            return
    }
}

const isMarkActive = (editor: UsfmEditorRef, mark: string) => {
    const marks = editor.getMarksAtCursor()
    return marks.includes(mark)
}

const isBlockActive = (editor: UsfmEditorRef, marker: string) => {
    const types = editor.getParagraphTypesAtCursor()
    return types.includes(marker)
}

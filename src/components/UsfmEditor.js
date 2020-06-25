import * as React from "react";
import { useMemo, useState } from 'react';
import { useMemo, useState } from 'react';
import { withReact, Slate, Editable, ReactEditor } from "slate-react";
import { createEditor } from 'slate';
import { renderElementByType, renderLeafByProps } from '../transforms/usfmRenderer';
import { usfmToSlate } from '../transforms/usfmToSlate';
import { withNormalize } from "../plugins/normalizeNode";
import { handleKeyPress, withBackspace, withDelete, withEnter } from '../plugins/keyHandlers';
import { NodeTypes } from "../utils/NodeTypes";
import { HoveringToolbar } from "./HoveringToolbar";
import { slateToUsfm } from "../transforms/slateToUsfm";
import { debounce } from "debounce";
import { flowRight } from "lodash"

/**
 * A WYSIWYG editor component for USFM
 */
export const UsfmEditor = ({ 
    usfmString, 
    plugins, 
    onChange,
    readOnly,
    identification,
    onIdentificationChange
}) => {

    const initialValue = useMemo(() => {
        const iv = usfmToSlate(usfmString)
        // TODO: Transform identification from slate into json
        // Actually, probably just use json parsed from usfm-js
        // and transform that.
        onIdentificationChange(iv[0].children) // use transformed result instead
        return iv
    }, [])

    const editor = useMemo(
        () =>
            flowRight(
                withBackspace,
                withDelete,
                withEnter,
                withNormalize,
                withReact,
                createEditor
            )(),
        []
    )

    React.useEffect(
        () => {
            console.log("in usfmeditor, identification = ", identification)
            // TODO: Transform identification from json into slate
            // Then use Transforms.remove and addNodes where appropriate
        }, [identification]
    )

    const [value, setValue] = useState(initialValue)

    const handleChange = value => {
        console.debug("after change", value)
        // When a change is made by another focused component, we
        // need to restore focus to the editor.
        ReactEditor.focus(editor)
        setValue(value)
        scheduleOnChange(value)
    }

    const scheduleOnChange = useMemo(() => 
        debounce(function(newValue) {
            const usfm = slateToUsfm(newValue)
            onChange(usfm)
        }, 200),
    [])

    const onKeyDown = event => {
        handleKeyPress(event, editor)
    }

    editor.isInline = element => {
        return false
    }

    editor.isVoid = element => {
        return element.type == NodeTypes.HEADERS
    }

    return (
        <Slate
            editor={editor}
            value={value}
            onChange={handleChange}
        >
            <HoveringToolbar />
            <Editable
                readOnly={readOnly}
                renderElement={renderElementByType}
                renderLeaf={renderLeafByProps}
                spellCheck={false}
                onKeyDown={onKeyDown}
            />
        </Slate>
    )
}
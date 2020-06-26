import * as React from "react";
import { useMemo, useState } from 'react';
import { useMemo, useState } from 'react';
import { withReact, Slate, Editable, ReactEditor } from "slate-react";
import { createEditor } from 'slate';
import { renderElementByType, renderLeafByProps } from '../transforms/usfmRenderer';
import { usfmToSlate, usfmJsToSlate, usfmToJsArrays, usfmJsArraysToSlate, transformToSlate } from '../transforms/usfmToSlate';
import { withNormalize } from "../plugins/normalizeNode";
import { handleKeyPress, withBackspace, withDelete, withEnter } from '../plugins/keyHandlers';
import { NodeTypes } from "../utils/NodeTypes";
import { HoveringToolbar } from "./HoveringToolbar";
import { slateToUsfm } from "../transforms/slateToUsfm";
import { debounce } from "debounce";
import { flowRight } from "lodash"
import * as usfmjs from "usfm-js";

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
        const usfmAsArrays = usfmToJsArrays(usfmString)
        const headers = {}
        usfmAsArrays.headers
            .filter(h => h.tag)
            .forEach(h => {
                headers[h.tag] = h.content
            })
        onIdentificationChange(headers)
        return usfmJsArraysToSlate(usfmAsArrays)
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
            if(!identification) return
            const headersAsArray = Object.entries(identification)
                .map(n => {
                    return {
                        "tag": n[0],
                        "content": n[1]
                    }
                })
            console.log("headersAsArray", headersAsArray)
            const slateHeaders = headersAsArray.map(transformToSlate)
            console.log("*** slate headers", slateHeaders)

            // TODO: use Transforms.remove and addNodes where appropriate
            // Or, decide whether the headers even need to be in the slate dom at all!!
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
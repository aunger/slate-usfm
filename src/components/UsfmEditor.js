import * as React from "react";
import * as usfmjs from "usfm-js";
import { useMemo, useState, useEffect, useReducer } from 'react';
import { withReact, Slate, Editable, ReactEditor } from "slate-react";
import { createEditor, Transforms } from 'slate';
import { renderElementByType, renderLeafByProps } from '../transforms/usfmRenderer';
import { usfmToSlate } from '../transforms/usfmToSlate';
import { withNormalize } from "../plugins/normalizeNode";
import { handleKeyPress, withBackspace, withDelete, withEnter } from '../plugins/keyHandlers';
import { NodeTypes } from "../utils/NodeTypes";
import { HoveringToolbar } from "./HoveringToolbar";
import { slateToUsfm } from "../transforms/slateToUsfm";
import { debounce } from "debounce";
import { flowRight, isEqual } from "lodash"
import { MyTransforms } from "../plugins/helpers/MyTransforms";
import { UsfmMarkers } from "../utils/UsfmMarkers";
import { emptyParagraph } from "../transforms/basicSlateNodeFactory";

/**
 * A WYSIWYG editor component for USFM
 */
export const UsfmEditor = ({ 
    usfmString, 
    onChange,
    readOnly,
    identification,
    onIdentificationChange
}) => {

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
    // const identificationReducer = (previous, { action, input }) => {
    const identificationReducer = useMemo(() => 
        (previous, { action, input }) => {
            console.log("previous:", previous)
            console.log("input: ", input)
            switch (action) {
                case "update":
                    if (input &&
                        !isEqual(input, previous)
                    ) {
                        console.log("   update required")
                        return input
                    } else {
                        console.log("   update NOT required")
                        return previous
                    }
                case "replace":
                default:
                    console.log("replace")
                    return input
            }
        // }
        },
        []
    )
            // const validIdJson = filterInvalidIdentification(newInput)
            // MyTransforms.updateIdentificationHeaders(editor, validIdJson)

            // return newInput

    const [identificationState, dispatchIdentification] = useReducer(
        identificationReducer, 
        identification
    )
    const [value, setValue] = useState([emptyParagraph()])

    // const [identificationState, setIdentificationState] = useState(identification)
    // const [value, setValue] = useState(null)


    // useMemo(() => {
    useEffect(() => {
        const slateTree = usfmToSlate(usfmString)
        setValue(slateTree) // TODO: or handleChange??
        if (editor.selection) {
            Transforms.select(editor, [0,0])
        }
    }, [usfmString])

    useEffect(() => {
        const parsedIdentification = parseIdentificationHeaders(usfmString)
        dispatchIdentification({
            action: "replace",
            input: parsedIdentification
        })
    }, [usfmString])

    useEffect(() => {
        console.log("**********state changed: ", identificationState)
        if (onIdentificationChange) {
            onIdentificationChange(identificationState)
        }
    }, [identificationState])

    useEffect(() => {
        console.log("FIRST identification: ", identification)
        console.log("FIRST identificationState: ", identificationState)
        // if (identification &&
        //     !isEqual(identification, identificationState)
        // ) {
            dispatchIdentification({
                action: "update",
                input: identification
            })
        // }
    }, [identification])

    const handleChange = value => {
        console.debug("after change", value)
        // When a change is made by another focused component, we
        // need to restore focus to the editor.
        if (!ReactEditor.isFocused(editor)) {
            ReactEditor.focus(editor)
        }
        MyTransforms.fixCollapsedSelectionOnNonTextNode(editor)
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

    function filterInvalidIdentification(idJson) {
        Object.entries(idJson)
            .filter( ([marker, text]) => 
                false == UsfmMarkers.isIdentification(marker)
            )
            .forEach( ([marker, text]) =>
                console.error(`Invalid identification marker: ${marker}`)
            )

        const validIdJson = {}
        Object.entries(idJson)
            .filter( ([marker, text]) => 
                UsfmMarkers.isIdentification(marker)
            )
            .forEach( ([marker, text]) => 
                validIdJson[marker] = text
            )
        return validIdJson
    }

    function parseIdentificationHeaders(usfm) {
        const parsed = {}
        const usfmJsDoc = usfmjs.toJSON(usfm);

        usfmJsDoc.headers
            .filter(h => 
                UsfmMarkers.isIdentification(h.tag)
            )
            .forEach(h => {
                parsed[h.tag] = h.content
            })
        return parsed
    }
}
import { Transforms, Editor, Path, Node } from "slate";
import { NodeTypes } from "../../utils/NodeTypes";
import { VerseTransforms } from "./VerseTransforms"
import { textNode } from "../../transforms/basicSlateNodeFactory";
import { UsfmMarkers } from "../../utils/UsfmMarkers";
import { SelectionTransforms } from "./SelectionTransforms";
import * as clonedeep from "lodash/cloneDeep"
import { parseIdentificationFromSlateTree, identificationToSlate } from "../../transforms/identificationTransforms";

export const MyTransforms = {
    ...Transforms,
    ...VerseTransforms,
    ...SelectionTransforms,
    mergeSelectedBlockAndSetToInlineContainer,
    replaceText,
    updateIdentificationHeaders
}

/**
 * Merges the selected block with the next or previous block,
 * then sets the resulting block to an inline container type.
 */
function mergeSelectedBlockAndSetToInlineContainer(
    editor: Editor,
    options: {
        mode?: 'next' | 'previous'
    }
) {
    const { mode = 'previous' } = options

    const [selectedBlock, selectedBlockPath] = Editor.parent(editor, editor.selection.anchor.path)
    const mergePath = mode === 'previous'
        ? selectedBlockPath
        : Path.next(selectedBlockPath)

    // The path of the newly merged node
    const resultingPath = mode === 'previous'
        ? Path.previous(selectedBlockPath)
        : selectedBlockPath

    Editor.withoutNormalizing(editor, () => {
        Transforms.mergeNodes(editor, { at: mergePath })
        Transforms.setNodes(editor,
            { type: NodeTypes.INLINE_CONTAINER },
            { at: resultingPath }
        )
    })
}

function replaceText(
    editor: Editor,
    path: Path,
    newText: string
) {
    Transforms.delete(
        editor,
        { at: path }
    )
    Transforms.insertNodes(
        editor,
        textNode(newText),
        { at: path }
    )
}

/**
 * Updates the identification headers, stored in the "headers" node of
 * the editor's children (at path [0].)
 * 
 * @param {Object} inputJson - Json specifying the updated identification headers.
 *      example: {'toc1': 'The Book of Genesis', 'id': 'GEN'}
 *      Unspecified headers will be kept the same.
 *      To delete a header, pass a null, empty string, or empty array value like:
 *      {'toc1': null} OR {'toc1': ''} OR {'rem':[]}
 * @param {Object} oldJson - Json specifying the most recent state of the
 *      identification headers.
 * @returns The updated identification json
 */
function updateIdentificationHeaders(
    editor: Editor, 
    inputJson: Object, 
    oldJson: Object
): Object {
    const updatedJson = clonedeep(oldJson)
    Object.assign(updatedJson, inputJson)

    const slateHeaders = identificationToSlate(updatedJson)

    // Replace the existing identification headers
    Transforms.removeNodes(
        editor,
        {
            at: [0], // look at headers only, not chapter contents
            voids: true, // captures nodes that aren't represented in the DOM
            match: node => UsfmMarkers.isIdentification(node.type)
        }
    )
    Transforms.insertNodes(
        editor,
        // @ts-ignore
        slateHeaders,
        { at: [0, 0] }
    )

    return parseIdentificationFromSlateTree(editor.children)

    // function filterInvalidIdentification(idJson: Object) {
    //     Object.entries(idJson)
    //         .forEach( ([marker, value]) => {
    //             if (! UsfmMarkers.isIdentification(marker)) {
    //                 console.error(`Invalid identification marker: ${marker}`)
    //                 return false
    //             } else if (typeof value != "string") {
    //             }
    //                 marker != UsfmMarkers.IDENTIFICATION.rem &&
    //             ) else if (
    //                 marker == UsfmMarkers.IDENTIFICATION.rem &&
    //                 typeof value
    //             )
    //         })

    //     const validIdJson = {}
    //     Object.entries(idJson)
    //         .filter( ([marker, text]) => 
    //             UsfmMarkers.isIdentification(marker)
    //         )
    //         .forEach( ([marker, text]) => 
    //             validIdJson[marker] = text
    //         )
    //     return validIdJson
    // }
}
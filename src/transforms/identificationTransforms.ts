import * as usfmjs from "usfm-js";
import { Node } from 'slate';
import { UsfmMarkers } from "../utils/UsfmMarkers";
import { transformToSlate } from "./usfmToSlate";

export function identificationToSlate(idJson) {
    const idHeader = (tag, content) => {
        if (!content) return null
        const text = content.toString()
        if (!text.trim()) return null
        return transformToSlate({
            "tag": tag,
            "content": text
        })
    }
    return Object.entries(idJson)
        //@ts-ignore
        .flatMap( ([marker, value]) => (
            Array.isArray(value)
                ? value.map(text => idHeader(marker, text))
                : idHeader(marker, value)
        ))
        .filter(n => n) // filter out nulls
}

export function parseIdentificationFromUsfm(usfm) {
    const usfmJsDoc = usfmjs.toJSON(usfm);
    const headersArray: IdHeader[] = usfmJsDoc.headers
        .map(h => ({
            marker: h.tag,
            content: h.content
        }))
    return arrayToJson(headersArray)
}

export function parseIdentificationFromSlateTree(value) {
    const headersArray: IdHeader[] = value[0].children 
        .map(node => ({
            marker: node.type,
            content: Node.string(node)
        }))
    return arrayToJson(headersArray)
}

interface IdHeader {
    marker: string,
    content: string
}

function arrayToJson(headersArray: IdHeader[]) {
    const parsed = {}
    let remarks = []

    headersArray
        .forEach((h: IdHeader) => {
            if (h.marker == UsfmMarkers.IDENTIFICATION.rem) {
                remarks = remarks.concat(h.content)
            } else if (UsfmMarkers.isIdentification(h.marker)) {
                parsed[h.marker] = h.content
            }
        })
    if (remarks.length > 0) {
        parsed[UsfmMarkers.IDENTIFICATION.rem] = remarks
    }
    return parsed
}
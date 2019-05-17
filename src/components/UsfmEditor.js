import React from "react";
import {Value} from "slate"
import {Editor} from "slate-react";
import usfmjs from "usfm-js"
import {identity, pathRule, transform} from "json-transforms"

/**
 * Simple pass-through to slate Editor for now....
 */
const UsfmEditor = React.forwardRef(({plugins, usfmString, ...props}, ref) => {
        const value = deserialize(usfmString);
        return (
            <Editor
                plugins={plugins}
                value={value}
                {...props}
                // onChange={handleChange}
                // className={className}
                ref={ref}
            />
        );
    }
);

// Convert chapter/verse objects to arrays
const objectToArrayRules = [
    pathRule(
        '.chapters',
        d => Object.assign({}, d.context, {
            chapters: Object.entries(d.match)
                .map(e => ({
                    chapterNumber: e[0],
                    sort: (+e[0] || 0),
                    verses: Object.entries(e[1])
                        .map(f => ({
                            verseNumber: f[0],
                            sort: (+f[0] || 0),
                            nodes: d.runner(f[1].verseObjects)
                        }))
                        .sort((a, b) => a.sort - b.sort)
                }))
                .sort((a, b) => a.sort - b.sort)
        })
    ),
    identity
];

function textNode(textString) {
    return {
        "object": "text",
        "text": textString,
        "marks": []
    };
}

function chapterNumberNode(verseNumber) {
    return {
        "object": "inline",
        "type": "chapterNumber",
        "data": {},
        "nodes": [textNode(verseNumber)]
    };
}

function verseNumberNode(verseNumber) {
    return {
        "object": "inline",
        "type": "verseNumber",
        "data": {},
        "nodes": [textNode(verseNumber)]
    };
}

const slateRules = [
    pathRule(
        '.chapters',
        d => ({
            "object": "block",
            "type": "book",
            "data": {},
            "nodes": [].concat(d.runner())
        })
    ),
    pathRule(
        '.chapterNumber',
        d => ({
            "object": "block",
            "type": "chapter",
            "data": {},
            "nodes": [chapterNumberNode(d.match), ...(d.runner(d.context.verses))]
        })
    ),
    pathRule(
        '.verseNumber',
        d => ({
            "object": "inline",
            "type": "verse",
            "data": {},
            "nodes": [verseNumberNode(d.match), ...(d.runner(d.context.nodes))]
        })
    ),
    pathRule(
        '.tag',
        d => ({
            "object": "inline",
            "type": d.match,
            "data": {},
            "nodes": [textNode(d.context.text)]
        })
    ),
    pathRule(
        '.text',
            d => textNode(d.match)
    ),
    identity
];

function deserialize(usfm) {
    const parsed = usfmjs.toJSON(usfm);
    console.debug("parsed", parsed);
    const restructured = transform(parsed, objectToArrayRules);
    // console.debug("restructured", restructured);

    const slateDocument = {
        "object": "value",
        "document": {
            "object": "document",
            "data": {},
            "nodes": [transform(restructured, slateRules)]
        }
    };
    console.debug("slateDocument", slateDocument);

    const value = Value.fromJSON(slateDocument);
    console.debug("value", value);
    return value;
}

export default UsfmEditor;

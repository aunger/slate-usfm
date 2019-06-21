import React from "react";
import {Value} from "slate";
import {Editor} from "slate-react";
import usfmjs from "usfm-js";
import {identity, pathRule, transform} from "json-transforms";
import "./UsfmEditor.css";

/**
 * Simple pass-through to slate Editor for now....
 */
const UsfmEditor = React.forwardRef(({plugins, usfmString, ...props}, ref) => {
        const value = deserialize(usfmString);
        const amendedPlugins = plugins ? plugins.concat(UsfmRenderingPlugin()) : [UsfmRenderingPlugin()];

        return (
            <Editor
                plugins={amendedPlugins}
                value={value}
                {...props}
                // onChange={handleChange}
                // className={className}
                ref={ref}
            />
        );
    }
);

function UsfmRenderingPlugin(options) {
    function numberClassNames(node) {
        const isFront = node.text === "front";
        const isOne = node.text === "1";
        return isFront ? "Front" : isOne ? "One" : "";
    }

    function ChapterNumberNode(props) {
        const className = `ChapterNumber ${numberClassNames(props.node)}`;
        return (
            <h1 {...props.attributes} className={className}>
                {props.children}
            </h1>
        )
    }

    function VerseNumberNode(props) {
        const className = `VerseNumber ${numberClassNames(props.node)}`;
        return (
            <sup {...props.attributes} className={className}>
                {props.children}
            </sup>
        )
    }

    function Footnote(props) {
        return (
            <div {...props.attributes} className="Footnote">
                {props.children}
            </div>
        )
    }

    return {
        renderInline(props, editor, next) {
            //const { node, attributes, children } = props;
            const [, pluses, baseTag, number] = props.node.type.match(/^(\+*)(.*?)(\d*)$/);
            switch (baseTag) {
                case 'chapterNumber':
                    return <ChapterNumberNode {...props} />;
                case 'verseNumber':
                    return <VerseNumberNode {...props} />;
                case 'f':
                    return <Footnote {...props} />;
                case 'bk':
                    return <cite {...props} />;
                case 'nd':
                    return <span className="NomenDomini" {...props} />;
                case 's':
                    const HeadingTag = `h${number || 1}`;
                    return <HeadingTag {...props} />;
                default:
                    return next()
            }
        }
    }
}

// Convert chapter/verse objects to arrays
const objectToArrayRules = [
    pathRule(
        '.chapters',
        d => Object.assign({}, d.context, {
            chapters: Object.entries(d.match)
                .map(e => ({
                    source: e[1],
                    chapterNumber: e[0],
                    sort: (+e[0] || 0),
                    verses: Object.entries(e[1])
                        .map(f => ({
                            source: f[1],
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
            // d.runner() strangely returns an array if multiple children, otherwise an object. The [].concat
            // trick turns either case into an array.
            "nodes": [].concat(d.runner())
        })
    ),
    pathRule(
        '.chapterNumber',
        d => ({
            "object": "block",
            "type": "chapter",
            "data": {"source": d.context.source},
            "nodes": [chapterNumberNode(d.match)]
                .concat(d.runner(d.context.verses))
        })
    ),
    pathRule(
        '.verseNumber',
        d => ({
            "object": "inline",
            "type": "verse",
            "data": {"source": d.context.source},
            "nodes": [verseNumberNode(d.match)]
                .concat(d.runner(d.context.nodes))
        })
    ),
    pathRule(
        '.tag',
        d => ({
            "object": "inline",
            "type": d.match,
            "data": {source: d.context},
            "nodes": [
                d.context.text ? textNode(d.context.text) : null,
                d.context.content ? textNode(d.context.content) : null
            ]
                .concat(d.context.children ? d.runner(d.context.children) : null)
                .filter(el => el)
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
    console.debug("Value object", value);
    return value;
}

export default UsfmEditor;

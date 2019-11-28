import React from "react";
import PropTypes from "prop-types"
import {Value} from "slate";
import {Editor} from "slate-react";
import debounce from "debounce";
import usfmjs from "usfm-js";
import "./UsfmEditor.css";
import {UsfmRenderingPlugin} from "./UsfmRenderingPlugin"
import {SectionHeaderPlugin} from "./SectionHeaderPlugin"
import {toUsfmJsonDocAndSlateJsonDoc} from "./jsonTransforms/usfmToSlate";
import {handleOperation} from "./operationHandlers";
import Schema from "./schema";
import {verseNumberName} from "./numberTypes";
import {HoverMenu} from "../hoveringMenu/HoveringMenu"
import {handleKeyPress} from "./keyHandlers";
import {Normalize} from "./normalizeNode";
import { getAncestor } from "../utils/documentUtils";

/**
 * A WYSIWYG editor component for USFM
 */
class UsfmEditor extends React.Component {
    static propTypes = {
        /**
         *  USFM contents to be edited. Updating this prop will NOT cause a rerender, so consider also setting
         *  a "key" prop to trigger changes.
         */
        usfmString: PropTypes.string,

        /** Additional SlateJS plugins to be passed to editor. */
        plugins: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),

        /** Change notification. */
        onChange: PropTypes.func,
    };

    static deserialize(usfmString) {
        // Return empty values if no input.
        if (!usfmString) return {usfmJsDocument: {}, value: Value.create()};

        const {usfmJsDocument, slateDocument} = toUsfmJsonDocAndSlateJsonDoc(usfmString);
        const value = Value.fromJSON(slateDocument);
        console.debug("Deserialized USFM as Slate Value", value.toJS());

        return {usfmJsDocument, value};
    }

    menuRef = React.createRef()

    /**
     * On update, update the menu.
     */
    componentDidMount = () => {
        this.updateMenu()
    }

    componentDidUpdate = () => {
        this.updateMenu()
    }

    /**
     * Update the menu's absolute position.
     */
    updateMenu = () => {
        const menu = this.menuRef.current
        if (!menu) return

        const { value } = this.state
        const { fragment, selection } = value

        if (selection.isBlurred || selection.isCollapsed || fragment.text === '') {
        menu.removeAttribute('style')
        return
        }

        const native = window.getSelection()
        const range = native.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        menu.style.opacity = 1
        menu.style.top = `${rect.top + window.pageYOffset - menu.offsetHeight}px`

        menu.style.left = `${rect.left +
        window.pageXOffset -
        menu.offsetWidth / 2 +
        rect.width / 2}px`
    }

    render = () => {
        return (
            <Editor
                plugins={this.state.plugins}
                schema={this.state.schema.schema}
                value={this.state.value}
                readOnly={false}
                spellCheck={false}
                onChange={this.handleChange}
                renderEditor={this.renderEditor}
                onKeyDown={this.onKeyDown}
                onMouseDown={this.onMouseDown}
            />
        );
    };

    onKeyDown = (event, editor, next) => {
        handleKeyPress(event, editor, next)
    }

    onMouseDown = (event, editor, next) => {
        this.setState({enableForwardSelectionChange: true})
        console.debug("     Enabling forward selection change")
        return next()
    }

    handleChange = (change) => {
        console.info("handleChange", change);
        console.info("      handleChange operations", change.operations.toJS());
        let value = this.state.value;
        try {
            for (const op of change.operations) {
                if (op.type == "set_selection") {
                    let shouldSkipOperation = this.normalizeSelection(op.newProperties.anchor, value)
                    if (shouldSkipOperation) {
                        continue
                    }
                }
                // console.debug(op.type, op.toJS());

                const newValue = op.apply(value);

                const {isDirty} = handleOperation(op, value, newValue, this.state.initialized);
                if (isDirty) {
                    this.scheduleOnChange();
                }

                value = newValue
            }
        } catch (e) {
            console.warn("Operation failed; cancelling remainder of change.");
        }
        this.setState({value: value, usfmJsDocument: this.state.usfmJsDocument, initialized: true});
    };

    scheduleOnChange = debounce(() => {
        console.debug("Serializing updated USFM", this.state.usfmJsDocument);
        const serialized = usfmjs.toUSFM(this.state.usfmJsDocument);
        const withNewlines = serialized.replace(/(\\[vps])/g, '\r\n$1');
        this.props.onChange(withNewlines);
    }, 1000);

    handlerHelpers = {
        findNextVerseNumber:
            () => this.state.value.document.getInlinesByType(verseNumberName).map(x => +x.text).max() + 1,
    };

    /** @type {{plugins, usfmJsDocument, value} */
    state = {
        plugins: (this.props.plugins || []).concat([UsfmRenderingPlugin(), SectionHeaderPlugin, Normalize()]),
        schema: new Schema(this.handlerHelpers),
        ...UsfmEditor.deserialize(this.props.usfmString),
        initialized: false,
        enableForwardSelectionChange: true
    };

    /**
     * @param {Editor} editor
     */
    renderEditor = (props, editor, next) => {
        this.editor = editor
        const children = next()
        return (
        <React.Fragment>
            {children}
            <HoverMenu ref={this.menuRef} editor={editor} />
        </React.Fragment>
        )
    }

    /**
     * Normalizes the user's selection and returns true if the set_selection
     * operation should be skipped, false otherwise
     */
    normalizeSelection = (newPoint, value) => {
        const oldPoint = value.selection.anchor

        if (newPointIsAfterOldPoint(newPoint, oldPoint) &&
            !this.state.enableForwardSelectionChange) {
            console.debug("     Skipping set_selection forward change")
            return true
        }
        if (pointHasNonzeroPath(newPoint)) {
            const current = value.document.getNode(newPoint.path)
            const corrected = correctSelectionBackwards(value.document, current)
            if (corrected != current) {
                this.editor.moveToEndOfNode(corrected)
                return true
            }
        }
        if (newPointIsAfterOldPoint(newPoint, oldPoint) &&
            this.state.enableForwardSelectionChange) {
            console.debug("     Disabling forward selection change")
            this.setState({enableForwardSelectionChange: false})
        }
        return false
    }
}

function pointHasNonzeroPath(point) {
    return point &&
           point.path != null &&
           point.path.some(val => val != 0)
}

/**
 * Finds a textNode that the user is allowed to select by traversing
 * backwards through the document tree 
 */
function correctSelectionBackwards(document, current) {
    const initial = current
    if (textIsStandaloneEmptyText(current, document)) {
        do {
            current = document.getPreviousText(current.key)
        }
        while (current && textIsStandaloneEmptyText(current, document))
    }
    if (!current) {
        console.warn("Failed to correct selection")
        return initial
    } else {
        return current
    }
}

/**
 * Returns true if the new point is after the old point.
 * Returns false if one or both points are not initialized. 
 */
function newPointIsAfterOldPoint(newPoint, oldPoint) {
    return oldPoint && oldPoint.path &&
           newPoint && newPoint.path &&
           newPoint.isAfterPoint(oldPoint)
}

function textIsStandaloneEmptyText(textNode, document) {
    return !textNode.text.trim() &&
           !textIsTextOrContentWrapperText(textNode, document)
}

function textIsTextOrContentWrapperText(textNode, document) {
    const parent = getAncestor(1, textNode, document)
    return parent.type == "textWrapper" || parent.type == "contentWrapper"
}

export default UsfmEditor;
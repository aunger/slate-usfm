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
import { handleOnClick } from "./onClickHandlers";

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
                // onClick={this.onClick}
                onMouseDown={this.onClick}
                // onDragStart={this.onClick}
            />
        );
    };

    onKeyDown = (event, editor, next) => {
        handleKeyPress(event, editor, next)
    }

    onClick = (event, editor, next) => {
        this.setState({enableSelection: true})
        console.log("******* Setting enableSelection to TRUE")
        return next()
        // handleOnClick(event, editor, next)
    }

    handleChange = (change) => {
        console.info("handleChange", change);
        console.info("      handleChange operations", change.operations.toJS());
        let value = this.state.value;
        let doit = false
        try {
            let i = 0
            for (const op of change.operations) {
                i++
                if (op.type == "insert_text") {
                    console.log("inserting")
                }
                if (op.type == "set_selection") {
                    if (this.state.enableSelection) {
                        if (change.operations.size == 1) {
                            doit = true
                        // } else if (change.operations.size == 4 && i == 2) {
                        } else if (change.operations.size == 4 && i % 2 == 0 && op.newProperties.focus && op.newProperties.focus.offset == 15) {
                            console.log("******* Setting enableSelection to FALSE")
                            this.setState({enableSelection: false})
                        }
                    } else {
                        console.log("***************** enableSelection FALSE")
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
        if (doit) {
            this.editor.moveToEndOfPreviousText()
            this.editor.moveToEndOfPreviousText()
            // this.editor.moveAnchorToEndOfPreviousText()
            // this.editor.moveToAnchor()
            // this.editor.moveAnchorToEndOfPreviousText()
            // this.editor.moveToAnchor()
        }
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
        enableSelection: true
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
}

export default UsfmEditor;
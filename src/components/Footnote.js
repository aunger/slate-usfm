import React from "react";

class Footnote extends React.Component {
    render = () => {
        console.debug("Footnote.render() props", this.props);
        return [
            <div className="Footnote"
                 onClick={this.openFootnoteEditor}
                 {...this.props.attributes}
            >
                {this.props.children}
            </div>,
            <textarea
                className="Footnote"
                autoFocus={true}
                onBlur={this.closeFootNoteEditor}
                defaultValue={this.props.node.text}
                hidden={!this.state.isEditorOpen}
            />

        ];
    };

    openFootnoteEditor = () => {
        //this.props.editor.removeTextByPath(this.props.node.key, 0, this.props.node.text.length);
        this.setState({isEditorOpen: true})
    };

    closeFootNoteEditor = () => {
        if (this.props.node) {
            const key = this.props.node.key;
            console.warn("Inserting by key", key);
            this.props.editor.insertTextByKey(key, 0, "sigh");
            // this.props.editor.moveToRangeOfNode(this.props.node);
            // this.props.editor.insertText("sigh");
            this.setState({isEditorOpen: false})
        }
    };

    state = {
        isEditorOpen: false
    };

}

export default Footnote;

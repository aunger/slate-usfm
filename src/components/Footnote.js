import React from "react";

class Footnote extends React.Component {
    render = () => {
        console.debug("Footnote.render() props", this.props);
        if (this.state.isEditorOpen) {
            return (
                <textarea
                    className="Footnote"
                    autoFocus={true}
                    onBlur={this.closeFootNoteEditor}
                >
                    {this.props.node.text}
                </textarea>
            );
        } else {
            return (
                <div className="Footnote"
                     onClick={this.openFootnoteEditor}
                >
                    {this.props.children}
                </div>
            );
        }
    };

    openFootnoteEditor = () => {
        //this.props.editor.removeTextByPath(this.props.node.key, 0, this.props.node.text.length);
        this.setState({isEditorOpen: true})
    };

    closeFootNoteEditor = () => {
        this.props.editor.moveToRangeOfNode(this.props.node);
        this.props.editor.insertText("sigh");
        this.setState({isEditorOpen: false})
    };

    state = {
        isEditorOpen: false
    };

}

export default Footnote;

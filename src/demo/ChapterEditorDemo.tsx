import * as React from "react";
import { createBasicUsfmEditor } from "../components/BasicUsfmEditor";
import { usfmToSlate } from "../transforms/usfmToSlate.js";
import { slateToUsfm } from "../transforms/slateToUsfm";
import { OutputUsfm } from "./UsfmContainer";
import "./demo.css";
import { flowRight } from "lodash";
import { withChapterPaging } from "./ChapterEditor";

/**
* This ChapterEditorDemo demonstrates the functionality of the startingVerse and onVerseChange properties of the UsfmEditor interface.
* If the startingVerse property is changed, the editor's selection will move to the end of the desired chapter and verse. 
* Additionally, if the user selects a new verse within the editor, onVerseChange will be called so that the change is
* reflected in the selected verse tracker. This demo utilizes these properties in a HOC editor; however, the application itself 
* can supply the values of these properties without wrapping another editor.
 */
export class ChapterEditorDemo extends React.Component<ChapterEditorDemoProps, ChapterEditorDemoState> {
    constructor(props: ChapterEditorDemoProps) {
        super(props);
        const initialUsfm = props.usfmString
        this.state = {
            usfmInput: initialUsfm,
            usfmOutput: slateToUsfm(usfmToSlate(initialUsfm)),
        };
    }

    handleEditorChange = (usfm: string) => this.setState({ usfmOutput: usfm });

    // This editor can be given a ref of type UsfmEditor
    Editor = flowRight(
        withChapterPaging,
        createBasicUsfmEditor
    )()

    render() {
        return (
            <div className="row">
                <div className="column column-left">
                    <h2>Editor</h2>
                    <this.Editor
                        usfmString={this.state.usfmInput}
                        key={this.state.usfmInput}
                        onChange={this.handleEditorChange}
                    />
                </div>
                <div className="column column-right">
                    <OutputUsfm usfm={this.state.usfmOutput} />
                </div>
            </div>
        )
    }
}

type ChapterEditorDemoProps = {
    usfmString: string
}

type ChapterEditorDemoState = {
    usfmInput: string,
    usfmOutput: string,
}
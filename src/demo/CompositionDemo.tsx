import * as React from "react";
import { createBasicUsfmEditor } from "../components/BasicUsfmEditor";
import { usfmToSlate } from "../transforms/usfmToSlate.js";
import { slateToUsfm } from "../transforms/slateToUsfm";
import { OutputUsfm } from "./UsfmContainer";
import "./demo.css";
import { flowRight } from "lodash";
import { withToolbar } from "./ToolbarEditor";

export class CompositionDemo extends React.Component<CompositionDemoProps, CompositionDemoState> {
    constructor(props: CompositionDemoProps) {
        super(props);
        const initialUsfm = props.usfmString
        this.state = {
            usfmInput: initialUsfm,
            usfmOutput: slateToUsfm(usfmToSlate(initialUsfm)),
        };
    }

    handleEditorChange = (usfm: string) => this.setState({ usfmOutput: usfm });

    // This editor can be given a ref of type UsfmEditor
    // to have access to the editor API (use React.createRef<UsfmEditor>)
    Editor = flowRight(
        withToolbar,
        withToolbar,
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

type CompositionDemoProps = {
    usfmString: string
}

type CompositionDemoState = {
    usfmInput: string,
    usfmOutput: string,
}
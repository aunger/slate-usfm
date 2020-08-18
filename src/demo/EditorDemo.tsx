import * as React from "react";
import { createBasicUsfmEditor } from "../components/BasicUsfmEditor";
import { InputSelector } from "./InputSelector";
import { usfmToSlate } from "../transforms/usfmToSlate.js";
import { slateToUsfm } from "../transforms/slateToUsfm";
import { OptionCheckbox } from "./OptionCheckbox";
import { InputUsfm, OutputUsfm } from "./UsfmContainer";
import { IdentificationSetter } from "./IdentificationSetter";
import "./demo.css";
import { StartingVerseSelector } from "./StartingVerseSelector";
import { SelectedVerseTracker } from "./SelectedVerseTracker";
import { StartingVerse } from "../components/UsfmEditor";
import { withToolbar } from "./ToolbarEditor";
import { withChapterPaging } from "./ChapterPagingEditor";
import { flowRight } from "lodash"

function transformToOutput(usfm) {
    return slateToUsfm(usfmToSlate(usfm))
}

type SelectedVerse = {chapter: string, verse: string, verseRangeEnd: string}

type DemoProps = {
    usfmStrings: string[]
}

type State = {
    usfmInput: string,
    usfmOutput: string,
    showInputUsfm: boolean,
    readOnly: boolean,
    startingVerse: StartingVerse,
    selectedVerse: SelectedVerse,
    identification: Object
}

export class EditorDemo extends React.Component<DemoProps, State> {
    constructor(props: DemoProps) {
        super(props);
        // Get the first usfm string in the dropdown menu
        const initialUsfm = props.usfmStrings.values().next().value
        this.state = {
            usfmInput: initialUsfm,
            usfmOutput: transformToOutput(initialUsfm),
            showInputUsfm: false,
            readOnly: false,
            startingVerse: undefined,
            selectedVerse: {
                chapter: "",
                verse: "",
                verseRangeEnd: ""
            },
            identification: null
        };
    }

    handleInputChange =
        (input: string) => this.setState(
            { 
                usfmInput: input,
                usfmOutput: transformToOutput(input),
                identification: null,
                startingVerse: undefined,
                selectedVerse: {
                    chapter: "",
                    verse: "",
                    verseRangeEnd: ""
                }
            }
        )

    handleEditorChange = (usfm: string) => this.setState({ usfmOutput: usfm });
    handleShowInputChange = () => {
        this.setState({ showInputUsfm: !this.state.showInputUsfm});
    }
    handleReadOnlyChange = () => {
        this.setState({ readOnly: !this.state.readOnly});
    }
    onIdentificationChange = (id: Object) => {
        if (typeof id == "string") {
            id = JSON.parse(id)
        }
        this.setState({ identification: id })
    }
    onStartingVerseChange = (startingVerse: StartingVerse) => 
        this.setState({ startingVerse: startingVerse })

    onVerseChange = (chapter: string, verse: string, verseRangeEnd: string) => {
        const selectedVerseJson = { 
            chapter: chapter,
            verse: verse,
            verseRangeEnd: verseRangeEnd
        }
        console.debug("onVerseChange called: ", selectedVerseJson)
        this.setState({ selectedVerse: selectedVerseJson })
    }

    // This editor can be given a ref of type UsfmEditor
    // to have access to the editor API (use React.createRef<UsfmEditor>)
    Editor = flowRight(
        withChapterPaging,
        withToolbar,
        createBasicUsfmEditor
    )()

    render() {
        return (
            <div>
                <div className={ this.state.showInputUsfm ? "" : "row" }>
                    <div className="column column-left">
                        <InputSelector 
                            onChange={this.handleInputChange} 
                            demoUsfmStrings={this.props.usfmStrings}
                        />
                    </div>
                    <div className="column column-right">
                        <div className="center-horizontal">
                            <OptionCheckbox
                                id={"show-input-checkbox"}
                                text={"Show Input"}
                                onChange={this.handleShowInputChange}
                                checked={this.state.showInputUsfm}
                            />
                            <OptionCheckbox
                                id={"read-only-checkbox"}
                                text={"Read-Only"}
                                onChange={this.handleReadOnlyChange}
                                checked={this.state.readOnly}
                            />
                        </div>
                        {
                            this.state.showInputUsfm &&
                                <React.Fragment>
                                       <InputUsfm usfm={this.state.usfmInput} />
                                       <OutputUsfm usfm={this.state.usfmOutput} />
                                </React.Fragment>
                        }
                    </div>
                </div>
                <div className="row">
                    <div className="column column-left">
                        <IdentificationSetter 
                            idJson={JSON.stringify(this.state.identification)} 
                            onChange={this.onIdentificationChange} />
                        <StartingVerseSelector
                            onChange={this.onStartingVerseChange} />
                        <SelectedVerseTracker
                            selectedVerse={this.state.selectedVerse} />
                        <h2>Editor</h2>
                        <this.Editor 
                            usfmString={this.state.usfmInput}
                            key={this.state.usfmInput}
                            onChange={this.handleEditorChange}
                            readOnly={this.state.readOnly}
                            identification={this.state.identification}
                            onIdentificationChange={this.onIdentificationChange}
                            startingVerse={this.state.startingVerse}
                            onVerseChange={this.onVerseChange}
                        />
                    </div>
                    <div className="column column-right">
                        {
                            this.state.showInputUsfm ||
                                <OutputUsfm usfm={this.state.usfmOutput} />
                        }
                    </div>
                </div>
            </div>
        )
    }
}
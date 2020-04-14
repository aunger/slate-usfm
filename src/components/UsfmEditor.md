Test component:

```js
const usfmStrings = new Map([
["unknown", `
\\id GEN
\\c 1
\\q
\\v 1 Poetry with \\unk unknown \\unk*tag.
`]
]);

import {UsfmEditor} from "./UsfmEditor";

class DemoEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {usfmInput: usfmStrings.get("unknown")};
        this.handleCannedDemoSelectionChange = event => this.setState({ usfmInput: event.target.value });
        this.handleEditorChange = (usfm) => this.setState({ usfmOutput: usfm });
    }
    
    render() {
        return (
            <div>
                <h2>Demo text selection</h2>
                <form>
                    <select required onChange={this.handleCannedDemoSelectionChange}>
                    {
                        Array.from(usfmStrings).map(function(arr) {
                            const [k, v] = arr;
                            return <option key={k} value={v}>{k}</option>;
                        })
                    }
                    </select>
                </form>

                <h2>Editor</h2>
                <UsfmEditor
                    usfmString={this.state.usfmInput}
                    key={this.state.usfmInput}
                    onChange={this.handleEditorChange}
                />
                
                <h2>Input USFM</h2>
                <pre style={{border: 'ridge'}}>{this.state.usfmInput}</pre>
                
                <h2>Output USFM</h2>
                <pre style={{border: 'ridge'}}>{this.state.usfmOutput}</pre>
            </div>
        )
    }
}

(<DemoEditor/>)
```

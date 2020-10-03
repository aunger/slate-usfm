
This ChapterEditorDemo demonstrates the functionality of the startingVerse and onVerseChange properties of the UsfmEditor interface.
If the startingVerse property is changed, the editor's selection will move to the end of the desired chapter and verse. 
Additionally, if the user selects a new verse within the editor, onVerseChange will be called so that the change is
reflected in the selected verse tracker. This demo utilizes these properties in a HOC editor; however, the application itself 
can supply the values of these properties without wrapping another editor.
```js
const usfmString = `
\\id GEN
\\c 1
\\v 1 the first verse
\\v 2 the second verse
\\c 2
\\v 1 the first verse
\\v 2 the second verse
`;

import {ChapterEditorDemo} from "./ChapterEditorDemo";

(<ChapterEditorDemo usfmString={usfmString}/>)
```
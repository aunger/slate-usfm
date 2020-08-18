import * as React from "react";

export const StartingVerseSelector = ({ onChange }) => {
    const chapterInputRef = React.createRef()
    const verseInputRef = React.createRef()
    return (
        <div>
            <div className="row">
                <div className="column">
                    <h4 className="demo-header">
                        Starting Verse
                    </h4>
                </div>
            </div>
            Chapter:
            <input 
                className="verse-selector-input"
                type="text" 
                ref={chapterInputRef} 
            />
            Verse:
            <input 
                className="verse-selector-input"
                type="text" 
                ref={verseInputRef} 
            />
            <button onClick={event => 
                onChange({ 
                    chapter: chapterInputRef.current.value,
                    verse: verseInputRef.current.value
                })
            }>Set</button>
        </div>
    )
}
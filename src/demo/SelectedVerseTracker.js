import * as React from "react";

export const SelectedVerseTracker = ({ selectedVerse }) => {
    return (
        <div>
            <div className="row">
                <div className="column">
                    <h4 className="demo-header">
                        Selected Verse
                    </h4>
                </div>
            </div>
            Chapter: {selectedVerse.chapter}
            Verse: {selectedVerse.verse}
            VerseRangeEnd: {selectedVerse.verseRangeEnd}
        </div>
    )
}
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
            <span className="verse-tracker-text">
                Chapter: {selectedVerse.chapter}
            </span>
            <span className="verse-tracker-text">
                Verse: {selectedVerse.verse}
            </span>
            <span className="verse-tracker-text">
                VerseRangeEnd: {selectedVerse.verseRangeEnd}
            </span>
        </div>
    )
}
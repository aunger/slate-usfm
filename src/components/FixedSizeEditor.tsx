import * as React from "react"
import {
    UsfmEditorRef,
    ForwardRefUsfmEditor,
    HocUsfmEditorProps,
    usfmEditorPropTypes,
    usfmEditorDefaultProps,
    Verse,
} from "../UsfmEditor"
import { NoopUsfmEditor } from "../NoopUsfmEditor"
import { UsfmEditorProps } from ".."

export function withFixedSize<W extends UsfmEditorRef>(
    WrappedEditor: ForwardRefUsfmEditor<W>
): ForwardRefUsfmEditor<FixedSizeEditor<W>> {
    const fc = React.forwardRef<FixedSizeEditor<W>, UsfmEditorProps>(
        ({ ...props }, ref) => (
            <FixedSizeEditor
                {...props}
                wrappedEditor={WrappedEditor}
                ref={ref} // used to access the FixedSizeEditor and its API
            />
        )
    )
    fc.displayName = (WrappedEditor.displayName ?? "") + "WithFixedSize"
    return fc
}

export class FixedSizeEditor<W extends UsfmEditorRef>
    extends React.Component<HocUsfmEditorProps<W>>
    implements UsfmEditorRef {
    public static propTypes = usfmEditorPropTypes
    public static defaultProps = usfmEditorDefaultProps

    constructor(props: HocUsfmEditorProps<W>) {
        super(props)
    }

    wrappedEditorRef = React.createRef<W>()
    wrappedEditorInstance: () => UsfmEditorRef = () =>
        this.wrappedEditorRef.current ?? new NoopUsfmEditor()

    /* UsfmEditor API */

    getMarksAtSelection = (): string[] =>
        this.wrappedEditorInstance().getMarksAtSelection()

    addMarkAtSelection = (mark: string): void =>
        this.wrappedEditorInstance().addMarkAtSelection(mark)

    removeMarkAtSelection = (mark: string): void =>
        this.wrappedEditorInstance().removeMarkAtSelection(mark)

    getParagraphTypesAtSelection = (): string[] =>
        this.wrappedEditorInstance().getParagraphTypesAtSelection()

    setParagraphTypeAtSelection = (marker: string): void =>
        this.wrappedEditorInstance().setParagraphTypeAtSelection(marker)

    goToVerse = (verseObject: Verse): void =>
        this.wrappedEditorInstance().goToVerse(verseObject)

    /* End UsfmEditor API */

    render(): JSX.Element {
        return (
            <div
                className="fixed-size"
                style={{ width: this.props.width, height: this.props.height }}
            >
                <this.props.wrappedEditor
                    {...this.props}
                    ref={this.wrappedEditorRef}
                />
            </div>
        )
    }
}

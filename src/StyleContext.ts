import { createContext, useContext } from 'react';
import { Theme as DefaultTheme } from '@material-ui/core/styles/createMuiTheme';
import { ClassNameMap, Styles, WithStylesOptions } from '@material-ui/styles/withStyles';
import { Omit } from '@material-ui/types';
import { makeStyles } from '@material-ui/core';

export const StyleContext = createContext({
    editorBackgroundColor: "white",
    paragraphIndent: "0em",
    fontSize: "1em",
    verseNumberFontSize: "100%",
    chapterNumberFontSize: "200%"
})

/**
 * Extends Material UI's makeStyles() function to incorporate the customizable css
 * properties defined in StyleContext. These properties will be set by the integrator 
 * via a StyleContext provider.
 */
export function useCustomStyles<
  Theme = DefaultTheme,
  Props extends {} = {},
  ClassKey extends string = string
>(
  styles: Styles<Theme, Props, ClassKey>,
  options?: Omit<WithStylesOptions<Theme>, 'withTheme'>
): ClassNameMap<ClassKey> {
    const styleContext = useContext(StyleContext)
    const classes = makeStyles(styles, options)(styleContext)
    return classes
}
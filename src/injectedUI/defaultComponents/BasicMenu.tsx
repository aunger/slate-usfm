import * as React from 'react'
import { ForwardRefExoticComponent } from "react"
import MenuList from '@material-ui/core/MenuList'

export const BasicMenu: ForwardRefExoticComponent<any> = React.forwardRef(
    ({ ...props }, ref) => (
        <MenuList
            //@ts-ignore
            ref={ref}>
                {...props.children}
        </MenuList>
    )
)
export default BasicMenu
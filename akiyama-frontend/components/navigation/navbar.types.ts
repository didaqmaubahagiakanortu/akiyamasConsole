export interface NavItem {
    id: string,
    label: string,
    href: string
}

export interface NavbarProps {
    navItems: NavItem[]
}
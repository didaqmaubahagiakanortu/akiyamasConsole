"use client"

import { Button } from "../ui/Button"
import { NavbarProps } from "./navbar.types"

export default function Navbar({ navItems }: NavbarProps) {
    return (
        <header className="fixed top-0 flex items-center justify-between inset-x-0 px-10 py-5">
            <nav className="flex items-center gap-8">
                {navItems.map((item) => (
                    <a key={item.id} href={item.href} className="text-xl tracking-widest text-shadow-lg hover:underline">
                        {item.label}
                    </a>
                ))}
            </nav>
            <div>
                <Button onClick={() => window.location.href = 'login'}>Login</Button>
            </div>
        </header>
    )
}
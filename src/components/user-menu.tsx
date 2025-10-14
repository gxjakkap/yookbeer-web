import SignOutButton from "./signout-button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";

interface UserMenuProps {
    name: string,
    email: string,
    role: string,
}

const getInitials = (name: string) => {
    const arr = name.split(" ")
    return `${arr[0].substring(0, 1)}${arr[arr.length-1].substring(0, 1)}`
}

export default function UserMenu(props: UserMenuProps){
    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
            <Avatar className="outline outline-1 outline-slate-300">
                <AvatarFallback>{getInitials(props.name)}</AvatarFallback>
            </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>{props.name}</DropdownMenuLabel>
                <DropdownMenuLabel className="font-normal capitalize">{props.role}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <SignOutButton variant="ghost" />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
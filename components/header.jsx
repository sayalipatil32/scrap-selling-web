import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import {
    ChevronDown,
    FileText,
    GraduationCap,
    LayoutDashboard,
    PenBox,
    StarsIcon,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
    return (
        <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 supports-[backdrop-filter]:bg-background/60">
            <nav className="container mx-auto px-4 pt-2 h-16 flex align-items-center justify-between">
                <Link href="/">
                    <Image
                        src="/logo.png"
                        alt="logo"
                        height={60}
                        width={200}
                        className="h-12 py-1 w-auto object-contain"
                    />
                </Link>

                <div className="flex items-center space-x-2 md:space-x-4">
                    <SignedIn>

                    
                        <Link href={"http://localhost:8000/"}>
                            <Button variant='outline'>
                                <LayoutDashboard className="h-4 w-4" />
                                <span className="hidden md:block">Locate</span>
                            </Button>
                        </Link>

                        <Link href="/scrap-sales">
                            <Button variant='outline'>
                                <LayoutDashboard className="h-4 w-4" />
                                <span className="hidden md:block">See Details</span>
                            </Button>
                        </Link>
                        <Link href="https://kaustubh-ronge.github.io/scrap-ai/">
                            <Button variant='outline'>
                                <LayoutDashboard className="h-4 w-4" />
                                <span className="hidden md:block">Ask to AI</span>
                            </Button>
                        </Link>
                        <Link href="/pricing">
                            <Button variant='outline'>
                                <LayoutDashboard className="h-4 w-4" />
                                <span className="hidden md:block">Pricing</span>
                            </Button>
                        </Link>
                        


                    </SignedIn>
                    <SignedOut>
                        <SignInButton>

                            <Button className='cursor-pointer' variant='outline'>Sign In</Button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: 'w-10 h-10',
                                    userButtonPopoverCard: 'shadow-xl',
                                    userPreviewMainIdentifier: 'font-semibold',
                                },
                            }}
                            afterSignOutUrl="/"
                        />
                    </SignedIn>
                </div>
            </nav>
        </header>
    );
};

export default Header;

// ===================================================================================================================================

// import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
// import Image from 'next/image';
// import Link from 'next/link';
// import React from 'react';
// import { Button } from './ui/button';
// import { ChevronDown, FileText, LayoutDashboard, StarsIcon } from 'lucide-react';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';

// const Header = () => {
//   return (
//     <header className='fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 supports-[backdrop-filter]:bg-background/60'>
//       <nav className='container mx-auto px-4 pt-2 h-16 flex align-items-center justify-between'>
//         <Link href='/'>
//           <Image
//             src='/logo.png'
//             alt='logo'
//             height={60}
//             width={200}
//             className='h-12 py-1 w-auto object-contain'
//           />
//         </Link>

//         <div className='flex items-center space-x-2 md:space-x-4'>
//           <SignedIn>
//             <Link href={'/dashboard'}>
//               <Button>
//                 <LayoutDashboard className='h-4 w-4' />
//                 <span className='hidden md:block'>Industries Insights</span>
//               </Button>
//             </Link>
//           </SignedIn>
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button>
//                 <StarsIcon className='h-4 w-4' />
//                 <span className='hidden md:block'>Industries Insights</span>
//                 <ChevronDown className='h-4 w-4' />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent>
//               <Link href={'resume'} className='flex items-center gap-2'>
//                 <FileText className='h-4 w-4' />
//                 <span>Build Resume</span>
//               </Link>
//               <DropdownMenuItem>Profile</DropdownMenuItem>
//               <DropdownMenuItem>Billing</DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//           <SignedOut>
//             <SignInButton />
//           </SignedOut>
//           <SignedIn>
//             <UserButton />
//           </SignedIn>
//         </div>
//       </nav>
//     </header>
//   );
// };

// export default Header;

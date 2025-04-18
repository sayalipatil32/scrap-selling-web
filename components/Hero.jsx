"use client"
import React, { useEffect, useRef, useState } from 'react'
import { Button } from './ui/button'
import Link from 'next/link'
import Image from 'next/image'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import ScrapForm from './ScrapForm' // Make sure this is the path to your ScrapForm component

const HeroSection = () => {
    const [showScrapForm, setShowScrapForm] = useState(false)
    const imageRef = useRef(null)

    useEffect(() => {
        const imageElement = imageRef.current
        const handleScroll = () => {
            const scrollPosition = window.scrollY
            const scrollThreshold = 100
            if (scrollPosition > scrollThreshold) {
                imageElement.classList.add("scrolled")
            }
            else {
                imageElement.classList.remove("scrolled")
            }
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <section className='w-full pt-36 md:pt-48 pb-10'>
            <div className='space-y-6 text-center'>
                <div className='space-y-6 mx-auto'>
                    <h1 className='gradient-title text-5xl md:text-6xl font-bold lg:text-7xl xl:text-8xl'>
                        Sell Your Scrap Easily <br />
                        Earn Money Responsibly
                    </h1>
                    <p className='mx-auto max-w-[600px] text-muted-foreground md:text-xl'>
                        Turn your waste into wealth with our easy scrap selling platform. Get the best prices for your paper, plastic, metal and more.
                    </p>
                </div>

                <div className='flex justify-center space-x-4'>
                    <Button
                        size="lg"
                        className="px-8"
                        onClick={() => setShowScrapForm(true)}
                    >
                        Sell Your Scrap Now
                    </Button>
                </div>

                <div className='hero-image-wrapper mt-5 md:mt-0'>
                    <div ref={imageRef} className='hero-image'>
                        <Image
                            src={"/img1.jpg"} // Consider using a scrap-related image
                            width={1280}
                            height={720}
                            alt='Scrap selling banner'
                            className='rounded-lg shadow-2xl border mx-auto'
                            priority
                        />
                    </div>
                </div>
            </div>

            {/* Scrap Form Modal */}
            <Dialog open={showScrapForm} onOpenChange={setShowScrapForm}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Sell Your Scrap</DialogTitle>
                    </DialogHeader>
                    <ScrapForm onSuccess={() => setShowScrapForm(false)} />
                </DialogContent>
            </Dialog>
        </section>
    )
}

export default HeroSection
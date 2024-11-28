/* eslint-disable @next/next/no-img-element */
import { db } from "@/db"
import { thirtyeight } from "@/db/schema"
import { eq } from "drizzle-orm"
import { Prompt } from "next/font/google"
import { getPresignedURLForYookbeerPic } from "../../actions"
import { LineIcon } from "@/components/svg/socials/line"
import { InstagramIcon } from "@/components/svg/socials/ig"
import { FacebookIcon } from "@/components/svg/socials/fb"

interface Props {
    params: Promise<{ id: string }>
}

const promptReg = Prompt({
    weight: '400',
    subsets: ['latin', 'thai']
})

const promptMed = Prompt({
    weight: '500',
    subsets: ['latin', 'thai']
})

const promptBold = Prompt({
    weight: '700',
    subsets: ['latin', 'thai']
})

const courseName = ['Regular Program', 'International Program', 'Health Data Science Program', 'Residential College']

export default async function StudentProfilePage({ params }: Props){
    const { id } = await params
    const data = (await db.select().from(thirtyeight).where(eq(thirtyeight.stdid, id)).limit(1))[0]
    const imgUrl = await getPresignedURLForYookbeerPic(data.img || '')
    console.log(data)
    return (
        <div className={`${promptReg.className} bg-neutral-100 mx-auto flex flex-col gap-y-3`}>
            <div className="flex flex-col gap-y-1">
                <h1 className={`${promptMed.className} text-4xl text-zinc-900`}>{data.nameen}</h1>
                <p className="text-gray-600 text-xl">{data.stdid} - {data.nicken}</p>
            </div>
            <div className="flex flex-col lg:flex-row gap-x-20">
                <div className="">
                    <img className="max-w-[500px] max-h-[450px] rounded-md" src={imgUrl} alt={`${data.nicken}'s portrait`} />
                </div>
                <div className="flex flex-col gap-y-8">
                    <div className="flex flex-col">
                        <p className={`${promptReg.className} text-gray-700 text-xl`}>
                            <span className={`${promptMed.className}`}>Course: </span>
                            {courseName[data.course]}
                        </p>
                        <p className={`${promptReg.className} text-gray-700 text-xl`}>
                            <span className={`${promptMed.className}`}>Thai name: </span>
                            {data.nameth} ({data.nickth})
                        </p>
                    </div>
                    <div className="flex flex-col">
                        <p className={`${promptBold.className} text-gray-700 text-xl`}>
                            Contact Info📱
                        </p>
                        <p className={`${promptReg.className} text-gray-700 text-xl`}>
                            <span className={`${promptMed.className}`}>Phone: </span>
                            {data.phone}
                        </p>
                        <p className={`${promptReg.className} text-gray-700 text-xl`}>
                            <span className={`${promptMed.className}`}>Email: </span>
                            <a href={`mailto:${data.emailuni}`} className="hover:underline hover:text-blue-500">{data.emailuni}</a>
                        </p>
                        <p className={`${promptReg.className} text-gray-700 text-xl`}>
                            <span className={`${promptMed.className}`}>Personal Email: </span>
                            <a href={`mailto:${data.emailper}`} className="hover:underline hover:text-blue-500">{data.emailper}</a>
                        </p>
                        {(data.discord) ? (
                            <p className={`${promptReg.className} text-gray-700 text-xl`}>
                                <span className={`${promptMed.className}`}>Discord: </span>
                                {data.discord}
                            </p>
                        ) : (<></>)}
                    </div>
                    <div className="flex flex-col">
                        <p className={`${promptBold.className} text-gray-700 text-xl`}>Socials</p>
                        <div className="flex gap-x-6 mt-3">
                            {(data.lineid) ? (<a href={`https://line.me/R/ti/p/~${data.lineid}`} className="w-10 h-10 text-neutral-400"><LineIcon className="w-12 h-12" /></a>) : (<></>)}
                            {(data.instagram) ? (<a href={`https://instagram.com/${data.instagram}`} className="w-10 h-10 text-neutral-400"><InstagramIcon className="w-12 h-12" /></a>) : (<></>)}
                            {(data.facebook) ? (<a href={`https://www.facebook.com/search/top/?q=${encodeURIComponent(data.facebook)}`} className="w-10 h-10 text-neutral-400"><FacebookIcon className="w-12 h-12" /></a>) : (<></>)}
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <p className={`${promptBold.className} text-gray-700 text-xl`}>Emergency Contact🆘</p>
                        <p className={`${promptReg.className} text-gray-700 text-xl`}>
                            <span className={`${promptMed.className}`}>Phone: </span>
                            {data.emerphone}
                        </p>
                        <p className={`${promptReg.className} text-gray-700 text-xl`}>
                            <span className={`${promptMed.className}`}>Relations: </span>
                            {data.emerrelation}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
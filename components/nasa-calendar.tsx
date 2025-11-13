"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { ScrollToTop } from "@/components/scroll-to-top"
import { format } from "date-fns"

interface NASAImageItem {
  data: Array<{
    title: string
    description?: string
    date_created?: string
    nasa_id?: string
    keywords?: string[]
  }>
  links?: Array<{
    href: string
    rel: string
    render?: string
  }>
}

interface NASAImagesResponse {
  collection: {
    items: NASAImageItem[]
    metadata: {
      total_hits: number
    }
  }
}

export function NasaCalendar() {
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = React.useState<string>(currentYear.toString())
  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const [imagesData, setImagesData] = React.useState<NASAImagesResponse | null>(null)
  const [imagesLoading, setImagesLoading] = React.useState(false)
  const [imagesError, setImagesError] = React.useState<string | null>(null)
  const years = Array.from({ length: currentYear - 1929 }, (_, i) => 
    (currentYear - i).toString()
  )

  React.useEffect(() => {
    if (selectedYear) {
      fetchNASAImages(selectedYear, searchQuery)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, searchQuery])

  const fetchNASAImages = React.useCallback(async (year: string, query?: string) => {
    if (!year || year.length !== 4) {
      setImagesError("Please enter a valid 4-digit year")
      return
    }

    const yearNum = parseInt(year)
    if (isNaN(yearNum) || yearNum < 1930 || yearNum > new Date().getFullYear()) {
      setImagesError("Please enter a valid year between 1930 and current year")
      return
    }

    setImagesLoading(true)
    setImagesError(null)
    setImagesData(null)

    try {
      let url = `https://images-api.nasa.gov/search?year_start=${year}&year_end=${year}&media_type=image&page_size=500`
      
      if (query && query.trim()) {
        url += `&q=${encodeURIComponent(query.trim())}`
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      const response = await fetch(url, { signal: controller.signal })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data: NASAImagesResponse = await response.json()
      setImagesData(data)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      
      if (err instanceof Error) {
        setImagesError(err.message)
      } else {
        setImagesError("Unknown error occurred")
      }
    } finally {
      setImagesLoading(false)
    }
  }, [])

  return (
    <div className="flex flex-col items-center px-4 md:px-32 gap-8  w-full ">
      <ThemeToggle />
      <ScrollToTop />
      
      <div className="w-full flex flex-col items-center justify-center">
        <div className="flex w-full items-center justify-center mx-auto max-w-xl ">
            <div className="items-center justify-center w-full flex gap-4 pl-10">
        <Input
            type="text"
            placeholder="Search (optional)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-[50px]"
          />
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger  id="year-select" className="w-[240px] cursor-pointer min-h-[50px]">
              <SelectValue placeholder="Select a year" />
            </SelectTrigger>
            <SelectContent>
            <SelectGroup className="w-[240px] h-[440px]">
              <SelectLabel className="text-left">Select a year</SelectLabel>
              {years.map((year) => (
                <SelectItem key={year} value={year} className="cursor-pointer">
                  {year}
                </SelectItem>
              ))}
            </SelectGroup>
            </SelectContent>
          </Select>
          
          </div>
        </div>

        {imagesLoading && (
           <section className="py-8 w-full flex flex-col items-center justify-center">
           

           <div className="flex justify-center w-full items-center mb-10 max-w-xl">
                   <div className="h-0.25 ml-10 bg-muted rounded-md flex-1"/>
           <div className="text-sm px-2 text-nowrap text-muted-foreground  text-center">
               Found <span className="animate-pulse">...</span> images
             </div>
             <div className="h-0.25 bg-muted rounded-md flex-1"/>
             </div>
             
             <div className="relative w-full items-center justify-center max-w-xl pb-10">
                <Separator
                  orientation="vertical"
                  className="bg-muted absolute left-2 top-0 bottom-0"
                />
                
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="relative mb-10 pl-10">
                    <div className="bg-muted-foreground absolute left-0 top-3.5 flex size-4 items-center justify-center rounded-full" />
                    
                    <Skeleton className="h-7 w-3/4 mb-2" />
                    
                    <Skeleton className="h-5 w-24 mb-4 md:absolute md:left-[-120px] md:w-[100px]" />
                    
                    <Card className="my-5 border-none bg-transparent shadow-none">
                      <CardContent className="px-0">
                        <Skeleton className="w-full h-64 rounded-lg mb-4" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-5/6 mb-2" />
                        <Skeleton className="h-4 w-4/6" />
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            
          </section>
        )}

        {imagesError && (
          <div className="text-center py-4">
            <p className="text-destructive">{imagesError}</p>
          </div>
        )}

        {imagesData && !imagesLoading && !imagesError && (
          <section className="py-8 w-full flex flex-col items-center justify-center">
           

            <div className="flex justify-center w-full items-center mb-10 max-w-xl">
                    <div className="h-0.25 ml-10 bg-muted rounded-md flex-1"/>
            <p className="text-sm px-2 text-nowrap text-muted-foreground  text-center">
                Found {imagesData.collection?.metadata?.total_hits || 0} images
              </p>
              <div className="h-0.25 bg-muted rounded-md flex-1"/>
              </div>
              
              <div className="relative items-center justify-center max-w-xl pb-10">
                <Separator
                  orientation="vertical"
                  className="bg-muted absolute left-2 top-0 bottom-0"
                />
                
                {imagesData.collection?.items
                  ?.filter((item) => {
                    const imageData = item.data[0]
                    const imageLink = item.links?.find(link => link.render === "image")
                    return imageLink && imageData
                  })
                  .sort((a, b) => {
                    const dateA = a.data[0]?.date_created ? new Date(a.data[0].date_created).getTime() : 0
                    const dateB = b.data[0]?.date_created ? new Date(b.data[0].date_created).getTime() : 0
                    return dateA - dateB
                  })
                  .map((item, index) => {
                    const imageData = item.data[0]
                    const imageLink = item.links?.find(link => link.render === "image")
                    
                    if (!imageLink || !imageData) return null

                    const dateCreated = imageData.date_created 
                      ? format(new Date(imageData.date_created), "MMMM dd, yyyy")
                      : "Unknown date"

                    return (
                      <div key={index} className="relative mb-10 pl-10">
                        <div className="bg-muted-foreground absolute left-0 top-3.5 flex size-4 items-center justify-center rounded-full" />
                        
                        <h4 className="rounded-xl md:text-start py-2 text-xl font-bold tracking-tight xl:mb-4 xl:px-3">
                          {imageData.title}
                        </h4>

                        <h5 className="text-md text-muted-foreground top-3  rounded-xl tracking-tight md:absolute md:left-[-120px] md:w-[100px] md:text-right">
                          {dateCreated}
                        </h5>

                        <Card className="my-5 border-none bg-transparent shadow-none">
                          <CardContent className="px-0">
                            {imageLink.href && (
                              <img
                                src={imageLink.href}
                                alt={imageData.title || "NASA Image"}
                                className="w-full rounded-lg object-cover mb-4 max-h-96"
                                loading="lazy"
                              />
                            )}
                            {imageData.description && (
                              <p className="text-foreground text-start text-sm leading-relaxed">
                                {imageData.description}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    )
                  })}
              </div>
            
          </section>
        )}
      </div>
    </div>
  )
}


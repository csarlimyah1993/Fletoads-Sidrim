import Image from "next/image"
import type { ImageProps } from "next/image"

interface LogoProps extends Omit<ImageProps, "src" | "alt"> {
  showText?: boolean
}

export function Logo({ showText = false, ...props }: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-md bg-primary/10">
        <Image
          src="/assets/image.png"
          alt="FletoAds Logo"
          width={32}
          height={32}
          className="object-contain"
          priority
          {...props}
        />
      </div>
      {showText && <span className="font-bold">FletoAds</span>}
    </div>
  )
}


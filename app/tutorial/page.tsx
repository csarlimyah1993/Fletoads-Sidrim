"use client"

import { Header } from "@/components/header"
import { TutorialContent } from "@/components/tutorial-content"

export default function TutorialPage() {
  return (
    <>
      <Header />
      <div className="p-4">
        <TutorialContent />
      </div>
    </>
  )
}


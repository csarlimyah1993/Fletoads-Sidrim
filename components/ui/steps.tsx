import * as React from "react"
import { cn } from "@/lib/utils"

interface StepsProps extends React.HTMLAttributes<HTMLDivElement> {
  currentStep: number
  totalSteps: number
  children: React.ReactNode
}

export function Steps({ currentStep, totalSteps, className, children, ...props }: StepsProps) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      <div className="flex items-center justify-between">
        <div className="flex-1 flex items-center">
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300 ease-in-out"
              style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
            />
          </div>
        </div>
        <span className="ml-4 text-sm text-muted-foreground">
          Passo {currentStep + 1} de {totalSteps}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              active: index === currentStep,
              completed: index < currentStep,
              stepNumber: index + 1,
            })
          }
          return child
        })}
      </div>
    </div>
  )
}

interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  active?: boolean
  completed?: boolean
  stepNumber?: number
}

export function Step({ title, active, completed, stepNumber, className, ...props }: StepProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium",
        active ? "bg-primary/10 text-primary" : "text-muted-foreground",
        completed ? "text-primary" : "",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium",
          active ? "bg-primary text-primary-foreground" : "bg-muted",
          completed ? "bg-primary text-primary-foreground" : "",
        )}
      >
        {stepNumber}
      </div>
      <span>{title}</span>
    </div>
  )
}

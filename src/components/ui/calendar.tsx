
import * as React from "react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      className={cn("p-3", className)}
      classNames={{
        months: cn("flex flex-col sm:flex-row gap-y-4 sm:gap-x-4 sm:gap-y-0"),
        month: cn("space-y-4"),
        caption: cn("flex justify-center pt-1 relative items-center"),
        caption_label: cn("text-sm font-medium"),
        nav: cn(
          "gap-x-1 flex items-center",
          classNames?.nav
        ),
        nav_button: cn(
          "h-7 w-7 bg-muted rounded-full flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-50",
          classNames?.nav_button
        ),
        nav_button_previous: cn(
          "absolute left-1",
          classNames?.nav_button_previous
        ),
        nav_button_next: cn("absolute right-1", classNames?.nav_button_next),
        table: cn("w-full border-collapse space-y-1", classNames?.table),
        head_row: cn("flex", classNames?.head_row),
        head_cell: cn(
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
          classNames?.head_cell
        ),
        row: cn("flex w-full mt-2", classNames?.row),
        cell: cn(
          "text-center text-sm p-0 relative [&:has([data-selected])]:bg-accent first:[&:has([data-selected])]:rounded-l-md last:[&:has([data-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          classNames?.cell
        ),
        day: cn(
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
          classNames?.day
        ),
        day_selected: cn(
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          classNames?.day_selected
        ),
        day_today: cn("bg-accent text-accent-foreground", classNames?.day_today),
        day_outside: cn(
          "text-muted-foreground opacity-50",
          classNames?.day_outside
        ),
        day_disabled: cn(
          "text-muted-foreground opacity-50",
          classNames?.day_disabled
        ),
        day_range_middle: cn(
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
          classNames?.day_range_middle
        ),
        day_hidden: cn("invisible", classNames?.day_hidden),
        ...classNames,
      }}
      showOutsideDays={showOutsideDays}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { CalendarIcon } from 'lucide-react'

export default function DatePicker({ label = "Select a date", onChange }) {
  return (
    <div className="grid w-full max-w-sm items-center gap-2 relative">
      <Label htmlFor="date">{label}</Label>
      <div className="relative">
        <Input
          id="date"
          type="date"
          onChange={onChange}
          className="pr-10"
        />
        <CalendarIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  )
}

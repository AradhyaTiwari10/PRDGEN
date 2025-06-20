import { ShinyText } from "@/components/ui/shiny-text"

function ShinyTextDemo() {
  return (
    <div className="space-y-4">
      <ShinyText text="Just some shiny text!" disabled={false} speed={3} className='custom-class' />
    </div>
  )
}

export { ShinyTextDemo } 
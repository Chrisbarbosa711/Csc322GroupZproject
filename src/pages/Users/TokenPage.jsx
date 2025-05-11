import Sidebar from "@/components/Sidebar"
import Navbar from "@/components/Navbar"
import PaymentMethodForm from "@/components/PaymentMethodForm"
import TokenBill from "@/components/TokenBill"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"

const TokenPage = () => {
  const [tokenCount, setTokenCount] = useState(0)

  return (
    <div className="flex flex-row min-h-screen">
      <Sidebar />
      
      <div className="flex flex-1 flex-col">
        <Navbar />

        <main className="flex-1 p-8 flex flex-row justify-center">
          <div className='grid grid-cols-2 gap-0'>
            <TokenBill tokenCount={tokenCount} setTokenCount={setTokenCount} />
            {/* <Separator orientation="vertical" className="h-full" /> */}
            <PaymentMethodForm tokenCount={tokenCount} setTokenCount={setTokenCount} />
          </div>
        </main>
      </div>
    </div>
  )
}
export default TokenPage
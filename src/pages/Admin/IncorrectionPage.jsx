import Sidebar from "@/components/Sidebar"
import Navbar from "@/components/Navbar"
import { RiShieldUserLine } from "react-icons/ri" 
import IncorrectionReports from "./../../components/IncorrectionReports"

const IncorrectionPage = () => {
  return (
    <div className="flex flex-row min-h-screen">
    <Sidebar />
    
    <div className="flex flex-1 flex-col">
      <Navbar />

      <main className="flex-1 p-8 flex flex-row">
        <div className='shadow-none p-4 flex-1'>
          <div className="flex flex-row items-center gap-2 mb-4">
            <RiShieldUserLine className="text-4xl" />
            <h1 className="text-2xl font-bold">Incorrection Report</h1>
          </div>
          <IncorrectionReports />
        </div>
      </main>
    </div>
    </div>
  )
}

export default IncorrectionPage
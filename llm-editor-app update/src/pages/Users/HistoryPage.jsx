import Sidebar from "@/components/Sidebar"
import Navbar from "@/components/Navbar"
import { AiOutlineFolder } from "react-icons/ai"
import Documents from "@/components/Documents"
import { Card } from "@/components/ui/card"

const HistoryPage = () => {
  return (
    <div className="flex flex-row min-h-screen">
      <Sidebar />
      
      <div className="flex flex-1 flex-col">
        <Navbar />

        <main className="flex-1 p-8 flex flex-row">
          <Card className='shadow-none border-none p-0 flex-1'>
            <div className="flex flex-row items-center gap-2 mb-0">
              <AiOutlineFolder className="text-4xl text-bold" />
              <h1 className="text-2xl font-bold">My Documents</h1>
            </div>
            <div className="space-y-0">
              <Documents />
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
export default HistoryPage
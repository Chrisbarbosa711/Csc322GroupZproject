import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "./ui/scroll-area";

import { useEditor } from '../contexts/EditorContext';
import { GoPencil } from "react-icons/go";
import { FaRegFlag } from "react-icons/fa";
import { FaRegCheckCircle } from "react-icons/fa";
import { CgSearchLoading } from "react-icons/cg";
import { useAuth } from '../contexts/AuthContext';
import { Button } from "./ui/button";


const Suggestions = () => {
  const { submissionStatus,
    handleCorrectionAction,
    corrections,
    checkType,
    setCheckType,
    canEdit,
    activeCorrection,
    submitForCorrection,
    setActiveCorrection } = useEditor();
  const { isAuthenticated } = useAuth();


  const CorrectionButton = ({ text, onClick }) => {
    return (
      <Button
        disabled={!canEdit}
        className={`w-full px-4 py-2 rounded-md font-semibold
                        ${isAuthenticated ? 'cursor-pointer' : 'cursor-not-allowed'}`}
        onClick={onClick}>
        {text}
      </Button>
    )
  }

  if (submissionStatus === 'idle' && corrections.length === 0) {
    return (
      <div className=' flex-grow relative h-full'>
        <CgSearchLoading className='text-primary w-[50px] h-[50px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' />

        <div className='w-full absolute bottom-0 left-0'>
          <CorrectionButton text='Submit for LLM Suggestion' onClick={() => { submitForCorrection(checkType) }} />
        </div>
      </div>
    );
  } else if (submissionStatus === 'submitted') {
    return (
      <div className='w-full h-full flex-grow relative'>

        <ScrollArea className="h-[400px]">
          {corrections.length !== 0 && corrections.map((correction) => (
            <div
              key={correction.id}
              className={`p-2 border-b-1 border-gray-300 text-center ${activeCorrection === correction.id ? 'bg-accent/30' : 'bg-white'}`}
              onClick={() => { setActiveCorrection(correction.id) }}
            >
              <div className="flex items-center mb-2">
                <span className="mr-1"><GoPencil /></span>
                <span className="ml-2 text-left text-sm text-gray-500">{correction.message}</span>
              </div>

              <div className="mb-2">
                <span className="line-through text-red-500 mr-2">{correction.original}</span>
                <span className="text-green-600">→ {correction.corrected}</span>
              </div>

              {activeCorrection === correction.id && (
                <div className="flex justify-between space-x-2">
                  <Button
                    onClick={() => handleCorrectionAction('accept')}>
                    Accept
                  </Button>

                  <Button
                    onClick={() => handleCorrectionAction('dismiss')}
                    variant={'outline'}>
                    Dismiss
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger><FaRegFlag className='text-gray-500 hover:text-gray-700' /></DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem><Button className='w-full text-left' variant='ghost' size='sm'>Incorrect suggestion</Button></DropdownMenuItem>
                      <DropdownMenuItem><Button className='w-full text-left' variant='ghost' size='sm'>Offensive word</Button></DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                </div>
              )}
            </div>
          ))}
        </ScrollArea>


        <div className='w-full absolute bottom-0 left-0'>
          <CorrectionButton text={`Continue to ${checkType === 'llm' ? 'Self Correction' : 'LLM Correction'}`}
            onClick={() => {
              const newType = checkType === 'llm' ? 'self' : 'llm';
              setCheckType(newType);
              submitForCorrection(newType);
            }} />

        </div>
      </div>
    )
  }
}

export default Suggestions;



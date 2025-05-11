import { useState } from 'react'
import { FaBars, FaRegUser } from 'react-icons/fa'
import { LuUserRound, LuUserRoundCheck, LuUserRoundCog } from 'react-icons/lu'
import { FiLogIn } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

const UserIcon = ({ icon, text, color, tokens }) => {
  const bgColors = {
    gray: 'bg-gray-400',
    blue: 'bg-blue-400',
    green: 'bg-primary',
  }
  const borderColors = {
    gray: 'border-gray-400',
    blue: 'border-blue-400',
    green: 'border-primary',
  }
  const textColors = {
    gray: 'text-gray-400',
    blue: 'text-blue-400',
    green: 'text-primary',
  }

  return (
    <div className="flex w-full justify-between">
      <label
        className={`inline-flex self-center rounded-lg ${bgColors[color]} text-white px-2 py-0 ml-1`}
      >
        <span className="text-light self-center mr-1">{icon}</span>
        <span className="font-normal">{text}</span>
      </label>
      <label
        className={`inline-flex items-center rounded-lg ${borderColors[color]} ${textColors[color]} border-1 px-2 py-1`}
      >
        <span className="font-medium">{tokens} tokens</span>
      </label>
    </div>
  )
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated, logout, userInfo, isLoadingUser } = useAuth()

  return (
    <nav className="shadow-sm !w-full">
      <div className="px-8">
        <div className="flex">
          <div className="py-4">
            <h3 className="text-2xl font-bold">LLM Editor</h3>
          </div>
          <div className="flex flex-1 space-x-4 my-auto">
            {isAuthenticated && userInfo ? (
              <div className="hidden sm:flex w-full space-x-8">
                {isLoadingUser ? (
                  <div>Loading...</div>
                ) : (
                  <>
                    {userInfo.role === 'free' && (
                      <UserIcon
                        icon={<LuUserRound />}
                        text="free"
                        color={'gray'}
                        tokens={userInfo.tokens}
                      ></UserIcon>
                    )}
                    {userInfo.role === 'paid' && (
                      <UserIcon
                        icon={<LuUserRoundCheck />}
                        text="paid"
                        color={'green'}
                        tokens={userInfo.tokens}
                      ></UserIcon>
                    )}
                    {userInfo.role === 'super' && (
                      <UserIcon
                        icon={<LuUserRoundCog />}
                        text="super"
                        color={'blue'}
                        tokens={userInfo.tokens}
                      ></UserIcon>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex justify-end space-x-8 w-full">
                <Button variant="ghost" className="text-lg" asChild>
                  <Link to={'/login'}>
                    <span>
                      <FiLogIn />
                    </span>
                    <span>log in</span>
                  </Link>
                </Button>
                <Button variant="ghost" className="text-lg" asChild>
                  <Link to={'/signup'}>
                    <span>
                      <FaRegUser />
                    </span>
                    <span>sign up</span>
                  </Link>
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => {
                setIsOpen(!isOpen)
              }}
            >
              <FaBars />
            </button>
          </div>
        </div>
        <div className="sm:hidden">
          {!isAuthenticated && isOpen ? (
            <div className="flex flex-col">
              <Button
                variant="ghost"
                className="flex items-center gap-2 justify-start"
                asChild
              >
                <Link to={'/login'}>
                  <span>
                    <FiLogIn />
                  </span>
                  <span>log in</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="flex items-center gap-2 justify-start"
                asChild
              >
                <Link to={'/signup'}>
                  <span>
                    <FaRegUser />
                  </span>
                  <span>sign up</span>
                </Link>
              </Button>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    </nav>
  )
}
export default Navbar

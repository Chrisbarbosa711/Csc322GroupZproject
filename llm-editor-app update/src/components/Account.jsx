import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2 } from "lucide-react"
import axios from 'axios'

const Account = () => {
  const { userInfo, logout } = useAuth()
  const navigate = useNavigate()
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [deletePassword, setDeletePassword] = useState("")

  const handlePasswordChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value
    })
  }

  const handleChangePassword = async () => {
    // Validate password inputs
    if (!passwords.currentPassword) {
      toast.error("Please enter your current password")
      return
    }
    if (!passwords.newPassword) {
      toast.error("Please enter a new password")
      return
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords don't match")
      return
    }
    if (passwords.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters")
      return
    }

    try {
      setIsSubmitting(true)
      const token = localStorage.getItem('token')
      await axios.put(
        'http://localhost:8000/users/change-password', 
        {
          current_password: passwords.currentPassword,
          new_password: passwords.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      
      toast.success("Password changed successfully")
      setIsPasswordDialogOpen(false)
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to change password")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== userInfo?.username) {
      toast.error("Please type your username correctly to confirm")
      return
    }

    if (!deletePassword) {
      toast.error("Please enter your password")
      return
    }

    try {
      setIsSubmitting(true)
      const token = localStorage.getItem('token')
      await axios.delete(
        'http://localhost:8000/users/delete-account',
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          data: {
            password: deletePassword
          }
        }
      )
      
      toast.success("Account deleted successfully")
      logout()
      navigate('/login')
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to delete account")
    } finally {
      setIsSubmitting(false)
      setIsDeleteDialogOpen(false)
      setDeleteConfirmation("")
      setDeletePassword("")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => setIsPasswordDialogOpen(true)}
        >
          Change Password
        </Button>
        <Separator />
        <Button 
          variant="outline" 
          className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          Delete Account
        </Button>

        {/* Change Password Dialog */}
        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>
                Enter your current password and a new password to update your credentials.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input 
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter your current password"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input 
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter your new password"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input 
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm your new password"
                />
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                onClick={handleChangePassword}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : "Change Password"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Account Alert Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-500">Delete Account</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. It will permanently delete your account and remove all your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="py-4 space-y-4">
              <div>
                <Label htmlFor="confirmDelete" className="text-sm text-gray-700 font-medium">
                  Type your username <span className="font-bold">{userInfo?.username}</span> to confirm:
                </Label>
                <Input 
                  id="confirmDelete"
                  className="mt-2"
                  placeholder="Enter your username"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="deletePassword" className="text-sm text-gray-700 font-medium">
                  Enter your password:
                </Label>
                <Input 
                  id="deletePassword"
                  className="mt-2"
                  type="password"
                  placeholder="Enter your password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                />
              </div>
            </div>
            
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                className="bg-red-500 hover:bg-red-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : "Delete Account"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}

export default Account
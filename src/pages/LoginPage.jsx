import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useLogin } from '../costumeQuerys/userQuery'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

const LoginPage = () => {
  const { login, isPending, isError, error } = useLogin();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errorMessage, setErrorMessage] = useState('');

  // when login failed, extract error message
  useEffect(() => {
    if (isError) {
      const detail = error?.response?.data?.detail;
      setErrorMessage(detail || error?.message || 'Login failed. Please try again.');
    } else {
      setErrorMessage('');
    }
  }, [isError, error]);

  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData);
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
    // when user start to modify the form, clear the error message
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  // when user click the retry button, clear the form and error message
  const handleRetry = () => {
    setFormData({
      username: '',
      password: ''
    });
    setErrorMessage('');
  };

  if (isPending) return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600">Logging in...</p>
      </div>
    </div>
  );

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <Card className="w-[400px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Enter your username to access your account
          </CardDescription>
        </CardHeader>
        
        {errorMessage && (
          <div className="px-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {errorMessage}
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <CardContent className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="enter your username"
              className="w-full"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="w-full"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isPending}
            onClick={handleSubmit}
          >
            {isPending ? 'Logging in...' : 'Log in'}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default LoginPage

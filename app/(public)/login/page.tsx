import { LoginForm } from './(components)/login-form';

export default function LoginPage() {
  return (
    <div className="h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white lg:flex-1">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
      
      {/* Right side - QuarryLink Illustration (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 overflow-hidden">
        <img
          src="/quarrylink-login-side-image.png"
          alt="QuarryLink - Quarry Operations Management"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}

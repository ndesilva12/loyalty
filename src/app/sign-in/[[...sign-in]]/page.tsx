import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <SignIn
        appearance={{
          variables: {
            colorPrimary: '#ffffff',
            colorBackground: 'rgba(17, 24, 39, 0.9)',
            colorText: '#ffffff',
            colorTextSecondary: '#d1d5db',
            colorInputBackground: 'rgba(255, 255, 255, 0.05)',
            colorInputText: '#ffffff',
            borderRadius: '0.75rem',
            fontSize: '1rem',
            fontWeight: { normal: 400, medium: 500, bold: 600 },
            spacingUnit: '1rem',
          },
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-gray-900/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl',
            headerTitle: 'text-white text-2xl font-bold',
            headerSubtitle: 'text-gray-300 text-base',
            // Social buttons - glass style
            socialButtonsBlockButton: 'bg-white/10 border border-white/30 text-white hover:bg-white/20 hover:border-white/50 backdrop-blur-sm transition-all rounded-xl py-3',
            socialButtonsBlockButtonText: 'text-white font-medium text-base',
            socialButtonsBlockButtonArrow: 'text-white',
            socialButtonsProviderIcon: 'w-5 h-5',
            // Divider
            dividerLine: 'bg-white/20',
            dividerText: 'text-gray-400 text-sm',
            // Form fields
            formFieldLabel: 'text-gray-200 text-sm font-medium',
            formFieldInput: 'bg-white/5 border border-white/20 text-white text-base py-3 px-4 rounded-xl focus:border-white/50 focus:ring-2 focus:ring-white/20 placeholder:text-gray-500',
            formFieldInputShowPasswordButton: 'text-gray-400 hover:text-white',
            // Primary button - glass style
            formButtonPrimary: 'bg-white/10 border border-white/30 text-white hover:bg-white/20 hover:border-white/50 backdrop-blur-sm transition-all rounded-xl py-3 font-medium text-base',
            // Footer links
            footerActionLink: 'text-white/80 hover:text-white underline',
            footerActionText: 'text-gray-400',
            // Identity preview
            identityPreviewText: 'text-white text-base',
            identityPreviewEditButton: 'text-white/80 hover:text-white',
            identityPreviewEditButtonIcon: 'text-white/80',
            // Alert/development banner - grey glass style
            alert: 'bg-white/5 border border-white/20 text-gray-300 rounded-xl backdrop-blur-sm',
            alertText: 'text-gray-300 text-sm',
            alertTextDanger: 'text-gray-300',
            // Badge (development mode)
            badge: 'bg-white/10 border border-white/20 text-gray-300 rounded-lg',
            // Other elements
            formResendCodeLink: 'text-white/80 hover:text-white',
            otpCodeFieldInput: 'bg-white/5 border border-white/20 text-white rounded-xl',
            alternativeMethodsBlockButton: 'bg-white/5 border border-white/20 text-white hover:bg-white/10 rounded-xl',
            // Internal card styling
            main: 'gap-6',
            form: 'gap-4',
          },
        }}
      />
    </div>
  );
}

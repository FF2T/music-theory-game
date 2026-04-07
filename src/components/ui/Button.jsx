import { forwardRef } from 'react'

const variants = {
  primary:   'bg-primary-600 hover:bg-primary-500 active:bg-primary-700 text-white glow-primary',
  secondary: 'bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-gray-100',
  ghost:     'bg-transparent hover:bg-white/10 text-gray-300 hover:text-white',
  success:   'bg-green-600 hover:bg-green-500 text-white',
  danger:    'bg-red-600 hover:bg-red-500 text-white',
}

const sizes = {
  sm:  'px-3 py-1.5 text-sm rounded-lg',
  md:  'px-5 py-2.5 text-base rounded-xl',
  lg:  'px-7 py-3.5 text-lg rounded-2xl',
  xl:  'px-10 py-4 text-xl rounded-2xl',
}

export const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', className = '', disabled, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center gap-2 font-semibold',
        'transition-all duration-150 select-none',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
})

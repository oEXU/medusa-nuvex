import { InputHTMLAttributes } from "react"

type CheckoutFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  label: string
}

const CheckoutField = ({
  label,
  name,
  required,
  className = "",
  ...props
}: CheckoutFieldProps) => {
  const id = props.id ?? name

  return (
    <label htmlFor={id} className="block min-w-0">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-rose-600">*</span>}
      </span>
      <input
        {...props}
        id={id}
        name={name}
        required={required}
        className={`h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-fuchsia-600 focus:ring-4 focus:ring-fuchsia-600/10 ${className}`}
      />
    </label>
  )
}

export default CheckoutField

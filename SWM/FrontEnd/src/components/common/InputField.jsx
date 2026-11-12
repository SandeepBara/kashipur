function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  disabled = false,
  required = false,
  error,
  ...rest
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block mb-1 font-semibold text-slate-700 text-sm"
      >
        {label} {required &&(<span className="text-red-500">*</span>)}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={label}
        disabled={disabled}
        className={`w-full p-2.5 border ${
          error ? "border-red-500" : "border-slate-300"
        } rounded-lg bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-600`}
        {...rest}
      />
      {error && <p className="mt-1 text-red-500 text-sm">{error}</p>}
    </div>
  );
}

export default InputField;

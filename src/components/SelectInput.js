const SelectInput = ({ disabled = false, className, options = [], value, onChange, placeholder = "Pilih salah satu", ...props }) => (
    <select
        disabled={disabled}
        value={value}
        onChange={onChange}
        className={`${className} bg-white rounded-md p-2 border shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50`}
        {...props}
    >
        <option value="">{placeholder}</option>
        {options.map((option) => (
            <option key={option.value} value={option.value}>
                {option.label}
            </option>
        ))}
    </select>
);

export default SelectInput;

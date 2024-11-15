import React from "react";
import { Select, MenuItem } from "@material-ui/core";

const CustomSelect = ({
  id,
  label,
  onChange,
  required,
  options,
  value
}) => {
  const handleChange = (event) => {
    onChange(event.target.value);
  };
  return (
    <div className="form-custom-input">
      <label {...(id && { htmlFor: id })}>
        {required && <span>* </span>}
        {label}
      </label>
      <Select
        labelId="demo-simple-select-standard-label"
        id="custom-select-native"
        value={value}
        onChange={handleChange}
      >
        {options.map(({ key, label }) => (
          <MenuItem value={key} key={key}>{label}</MenuItem>
        ))}
      </Select>
    </div>
  );
};

export default CustomSelect;

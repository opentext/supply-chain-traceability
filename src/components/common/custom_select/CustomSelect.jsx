/* eslint-disable react/jsx-props-no-spreading */
import { Select, MenuItem, FormControl } from '@mui/material';
import PropTypes from 'prop-types';

function CustomSelect({
  id, inputLabel, onChange, required, options, value,
}) {
  const handleChange = (event) => {
    onChange(event.target.value);
  };
  return (
    <div className="form-custom-input">
      <label htmlFor={id}>
        {required && <span>* </span>}
        {inputLabel}
      </label>
      <FormControl
        variant="standard"
        style={{ width: '100%', backgroundColor: '#efefef' }}
      >
        <Select
          labelId="demo-simple-select-standard-label"
          id="demo-select-state"
          value={value}
          onChange={handleChange}
        >
          {options.map(({ key, label }) => (
            <MenuItem value={key} key={key}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}

CustomSelect.propTypes = {
  id: PropTypes.string,
  inputLabel: PropTypes.string,
  onChange: PropTypes.func,
  required: PropTypes.bool,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ),
  value: PropTypes.string,
};
export default CustomSelect;

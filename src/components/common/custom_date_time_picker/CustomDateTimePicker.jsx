/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prop-types */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { HiCalendar } from 'react-icons/hi2';
import './datepicker.scss';

function CustomDateTimePicker({
  disabled,
  id,
  label,
  name,
  onChange,
  placeholder,
  readOnly,
  required,
  value,
  showCalendarIcon,
  dateFormat,
  htmlClass,
  maxDate,
  minDate,
}) {
  const checkAndConstructDate = (date) => (date
    ? typeof date === 'string'
      ? !Number.isNaN(new Date(date).getDate())
        ? new Date(date)
        : null
      : date
    : null);

  const [selectedDate, setSelectedDate] = useState(
    checkAndConstructDate(value),
  );

  useEffect(() => {
    setSelectedDate(checkAndConstructDate(value));
  }, [value]);

  const changeHandler = (date) => {
    setSelectedDate(date);
    onChange(date);
  };

  function CustomInput(props, ref) {
    return (
      <div className="form-custom-input">
        <label {...(id && { htmlFor: id })}>
          {required && <span>* </span>}
          {label}
        </label>
        <input
          onClick={props.onClick}
          ref={ref}
          value={props.value || props.placeholder}
          {...props}
        />
        <HiCalendar
          className="custom-date-picker-icon"
          onClick={props.onClick}
        />
      </div>
    );
  }

  return (
    <div>
      <DatePicker
        {...(id && { id })}
        className={htmlClass}
        dateFormat={dateFormat}
        disabled={disabled}
        maxDate={checkAndConstructDate(maxDate)}
        minDate={checkAndConstructDate(minDate)}
        name={name}
        onChange={changeHandler}
        placeholderText={placeholder}
        readOnly={readOnly}
        selected={selectedDate}
        {...(showCalendarIcon && {
          customInput: React.createElement(React.forwardRef(CustomInput)),
        })}
      />
    </div>
  );
}

export default CustomDateTimePicker;

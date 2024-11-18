/* eslint-disable react/prop-types */
import './DynamicForm.scss';
import { Input, TextField } from '@mui/material';
import { classNames } from '../../utilities/Utils';

function DynamicForm({
  formLabel, fields, id,
}) {
  const className = classNames('ot-dynamic-form__fields', {
    [id]: id,
  });

  const renderFieldsByEntries = () => {
    const fieldsEntries = [];

    fields.entries.forEach((entry, index) => {
      const {
        name, label, type, value,
      } = entry;
      fieldsEntries.push(
        // eslint-disable-next-line react/no-array-index-key
        <div {...{ className: 'control-fields' }} key={`${name}${index}`}>
          {type === 'label' && <label htmlFor={name}>{value}</label>}
          {type === 'input' && (
            <TextField
              type="text"
              label={label}
              id={name}
              value={value}
              required={false}
              fullWidth
              variant="standard"
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
              sx={{
                '& .MuiInput-underline:before': {
                  borderBottom: 'none !important', // Removes the default border
                },
                '& .MuiInput-underline:hover:before': {
                  borderBottom: 'none !important', // Removes the border on hover
                },
                '& .MuiInput-underline:after': {
                  borderBottom: 'none !important', // Prevents the border on focus
                },
              }}
            />
          )}
          {type === 'date' && (
            <Input
              type="date"
              label={name}
              dateFormat="dd-MM-yyyy"
              showCalendarIcon
              id="withCalendarIconDP"
              value={value || ''}
            />
          )}
        </div>,
      );
    });

    return fieldsEntries;
  };

  return (
    <div className={className}>
      {formLabel && (
        <div className="control-fields" style={{ fontWeight: 'bold' }}>
          {formLabel}
        </div>
      )}
      {renderFieldsByEntries()}
    </div>
  );
}

export default DynamicForm;

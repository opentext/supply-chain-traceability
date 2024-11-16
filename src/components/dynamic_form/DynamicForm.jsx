/* eslint-disable react/prop-types */
import './DynamicForm.scss';
import { Input, TextField } from '@mui/material';
import { classNames } from '../../utilities/Utils';

function DynamicForm({
  label, fields, id,
}) {
  const className = classNames('ot-dynamic-form__fields', {
    [id]: id,
  });

  const renderFieldsByEntries = () => {
    const fieldsEntries = [];

    fields.entries.forEach((entry, index) => {
      const { name, type, value } = entry;
      fieldsEntries.push(
        // eslint-disable-next-line react/no-array-index-key
        <div {...{ className: 'control-fields' }} key={`${name}${index}`}>
          {type === 'label' && <label htmlFor={name}>{value}</label>}
          {type === 'input' && (
            <TextField
              type="text"
              label={name}
              id={name}
              value={value}
              required={false}
              variant="standard"
              slotProps={{
                input: {
                  readOnly: true,
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
      {label && (
        <div className="control-fields" style={{ fontWeight: 'bold' }}>
          {label}
        </div>
      )}
      {renderFieldsByEntries()}
    </div>
  );
}

export default DynamicForm;

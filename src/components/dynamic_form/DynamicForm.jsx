import React from "react";
import "./DynamicForm.scss";
import { classNames } from "../../utilities/Utils";
import { Input, TextField } from "@material-ui/core";

const DynamicForm = ({ label, fields, id, mode }) => {
  const className = classNames("ot-dynamic-form__fields", {
    [id]: id,
  });

  const renderFieldsByEntries = () => {
    const fieldsEntries = [];

    fields.entries.forEach((entry, index) => {
      const { name, type, value } = entry;
      fieldsEntries.push(
        <div {...{ className: "control-fields" }} key={`${name}${index}`}>
          {type === "label" && <label>{value}</label>}
          {type === "input" && (
            <>
              <TextField
                disabled={mode === "readonly"}
                type="text"
                label={name}
                id="name_input"
                value={value}
                placeholder=""
                required={false}
              />
            </>
          )}
          {type === "date" && (
            <Input
              type="date"
              label={name}
              dateFormat={"dd-MM-yyyy"}
              showCalendarIcon={true}
              id="withCalendarIconDP"
              value={value || ''}
            />
          )}
        </div>
      );
    });

    return fieldsEntries;
  };

  return <div className={className}>{label && <div className="control-fields" style={{ fontWeight: "bold" }}>{label}</div>}{renderFieldsByEntries()}</div>;
};

export default DynamicForm;

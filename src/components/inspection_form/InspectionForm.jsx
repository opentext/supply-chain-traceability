import PropTypes from 'prop-types';
import CustomDateTimePicker from '../common/custom_date_time_picker/CustomDateTimePicker';
import CustomInput from '../common/custom_input/CustomInput';
import CustomSelect from '../common/custom_select/CustomSelect';
import { LOCATION_OPTIONS } from './InspectionConstants';

function InspectionForm({
  name,
  handleChangeName,
  date,
  handleChangeDate,
  location,
  handleChangeLocation,
  batch,
  handleChangeBatch,
  description,
  handleChangeDescription,
}) {
  return (
    <>
      <div className="inspection_form_container">
        <CustomInput
          type="text"
          label="Name"
          id="name_input"
          value={name}
          placeholder=""
          required
          onChange={handleChangeName}
        />
        <CustomDateTimePicker
          label="Date"
          dateFormat="dd-MMM-yyyy"
          showCalendarIcon
          id="withCalendarIconDP"
          value={date}
          onChange={handleChangeDate}
        />
        <CustomSelect
          id="location_select"
          inputLabel="Location"
          options={LOCATION_OPTIONS}
          required={false}
          value={location}
          onChange={handleChangeLocation}
        />
        <CustomInput
          type="text"
          label="Batch Number"
          id="batch_input"
          value={batch}
          placeholder=""
          required
          onChange={handleChangeBatch}
        />
      </div>
      <div className="inspection_select_container">
        <CustomInput
          type="textarea"
          label="Description"
          id="description_textarea"
          required={false}
          value={description}
          onChange={handleChangeDescription}
        />
      </div>
    </>
  );
}

InspectionForm.propTypes = {
  name: PropTypes.string,
  handleChangeName: PropTypes.func,
  date: PropTypes.instanceOf(Date),
  handleChangeDate: PropTypes.func,
  location: PropTypes.string,
  handleChangeLocation: PropTypes.func,
  batch: PropTypes.string,
  handleChangeBatch: PropTypes.func,
  description: PropTypes.string,
  handleChangeDescription: PropTypes.func,
};

export default InspectionForm;

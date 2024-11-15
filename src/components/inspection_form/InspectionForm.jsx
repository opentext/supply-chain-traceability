import React from "react";
import CustomDateTimePicker from "../common/custom_date_time_picker/CustomDateTimePicker";
import CustomInput from "../common/custom_input/CustomInput";
import CustomSelect from "../common/custom_select/CustomSelect";
import { LOCATION_OPTIONS } from "./InspectionConstants";

const InspectionForm = ({name,handleChange_name,date,handleChange_date,location,handleChange_location,batch,handleChange_batch,description,handleChange_description}) => {

	return ( 
	<><div className="inspection_form_container">
		<CustomInput
		  type="text"
		  label="Name"
		  id="name_input"
		  value={name}
		  placeholder=""
		  required={true}
		  onChange={handleChange_name}
		/>
		<CustomDateTimePicker
		  label="Date"
		  dateFormat={"dd-MMM-yyyy"}
		  showCalendarIcon={true}
		  id="withCalendarIconDP"
		  value={date}
		  onChange={handleChange_date}
		/>
		<CustomSelect
		  label="Location"
		  options={LOCATION_OPTIONS}
		  required={false}
		  value={location}
		  onChange={handleChange_location}
		/>
		<CustomInput
		  type="text"
		  label="Batch Number"
		  id="batch_input"
		  value={batch}
		  placeholder=""
		  required={true}
		  onChange={handleChange_batch}
		/>
	  </div>
	  <div className="inspection_select_container">
	  <CustomInput
		type="textarea"
		label="Description"
		id="description_textarea"
		required={false}
		value={description}
		onChange={handleChange_description}
	  />
	</div></>
	  );
}

export default InspectionForm;
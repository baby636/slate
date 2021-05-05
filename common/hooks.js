import * as React from "react";
import * as Events from "~/common/custom-events";

export const useForm = ({ onSubmit, validate, initialValues }) => {
  const [state, setState] = React.useState({ isSubmitting: false, values: initialValues });

  const handleFieldChange = (e) =>
    setState((prev) => ({
      ...prev,
      values: { ...prev.values, [e.target.name]: e.target.value },
    }));

  // Note(Amine): this prop getter will capture the field state
  const getFieldProps = (name) => ({
    name: name,
    value: state.values[name],
    onChange: handleFieldChange,
  });

  const handleFormOnSubmit = (e) => {
    e.preventDefault();

    if (validate) {
      const error = validate(state.values);
      if (error) {
        Events.dispatchMessage({
          message: error,
        });
        return;
      }
    }

    setState((prev) => ({ ...prev, isSubmitting: true }));
    onSubmit(state.values)
      .then(() => {
        setState((prev) => ({ ...prev, isSubmitting: false }));
      })
      .catch(() => {
        setState((prev) => ({ ...prev, isSubmitting: false }));
      });
  };

  // Note(Amine): this prop getter will overide the form onSubmit handler
  const getFormProps = () => ({
    onSubmit: handleFormOnSubmit,
  });

  return { getFieldProps, getFormProps, values: state.values, isSubmitting: state.isSubmitting };
};

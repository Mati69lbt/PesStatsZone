// cspell: ignore setform
import { useState } from "react";

const useForm = (initialObj = {}) => {
  const [form, setform] = useState(initialObj);

  const changed = ({ target }) => {
    const { name, value } = target;
    setform({ ...form, [name]: value });
  };

  const setValue = (name, value) => {
    setform((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  return {
    form,
    changed,
    setValue,
  };
};

export default useForm;

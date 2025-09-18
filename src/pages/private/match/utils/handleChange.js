
export const makeHandleChange = (dispatch) => (e) => {
  const { name, value, type, checked } = e.target;
  dispatch({
    type: "ACTUALIZAR_CAMPO",
    campo: name,
    valor: type === "checkbox" ? checked : value,
  });
};

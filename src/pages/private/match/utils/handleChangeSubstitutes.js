import React from "react";

const makeHandleChangeSubstitutes = (dispatch) => {
  return (subs) => {
    dispatch({
      type: "SET_SUBS",
      payload: { substitutes: subs },
    });
  };
};

export default makeHandleChangeSubstitutes;

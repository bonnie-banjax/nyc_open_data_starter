import React from "react";
import ScaleLoader from "react-spinners/ScaleLoader";

export default function Loading() {
  return (
    <div className="GlobalRelativeContainer dark_bg">
      <div className="middle">
        <ScaleLoader color="#fff" size={50} />
      </div>
    </div>
  );
}

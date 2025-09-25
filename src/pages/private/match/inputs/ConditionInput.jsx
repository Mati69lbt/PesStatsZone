const ConditionInput = ({ value, onChange }) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm text-gray-600">¿Donde se jugó?</label>
      <div className="flex flex-wrap gap-2 list-disc list-inside">
        <label className="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-lg">
          <input
            type="radio"
            name="condition"
            value="local"
            checked={value === "local"}
            onChange={onChange}
          />
          <span className="ml-2">Local</span>
        </label>
        <label className="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-lg">
          <input
            type="radio"
            name="condition"
            value="visitante"
            checked={value === "visitante"}
            onChange={onChange}
          />
          <span className="ml-2">Visitante</span>
        </label>
        <label className="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-lg">
          <input
            type="radio"
            name="condition"
            value="neutro"
            checked={value === "neutro"}
            onChange={onChange}
          />
          <span className="ml-2">Neutro</span>
        </label>
      </div>
    </div>
  );
};

export default ConditionInput;

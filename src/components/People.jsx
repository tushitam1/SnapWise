import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

const People = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const data = state?.items;

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white p-6 rounded-xl shadow border text-center space-y-3">
          <p className="text-sm text-slate-600">No bill data found.</p>
          <button
            onClick={() => navigate("/split")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            Go to upload
          </button>
        </div>
      </div>
    );
  }

  const allItems = [...(data.foodItems || []), ...(data.drinkItems || [])];

  const [people, setPeople] = useState(["Alice", "Bob"]);
  const [newPerson, setNewPerson] = useState("");
  // assignments[index] = array of people names
  const [assignments, setAssignments] = useState({});

  const handleToggleAssign = (index, person) => {
    setAssignments((prev) => {
      const current = prev[index] || [];
      const exists = current.includes(person);
      const next = exists
        ? current.filter((p) => p !== person)
        : [...current, person];
      return { ...prev, [index]: next };
    });
  };

  const handleAddPerson = () => {
    const name = newPerson.trim();
    if (name && !people.includes(name)) {
      setPeople([...people, name]);
    }
    setNewPerson("");
  };

  const getPersonTotals = () => {
    const totals = {};
    people.forEach((p) => (totals[p] = 0));
    allItems.forEach((item, index) => {
      const assigned = assignments[index] || [];
      if (assigned.length === 0) return;
      const pricePerPerson = (item.price || 0) / assigned.length;
      assigned.forEach((person) => {
        totals[person] = (totals[person] || 0) + pricePerPerson;
      });
    });
    return totals;
  };
  const personTotals = getPersonTotals();

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center px-4 py-10">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Assign Items</h1>
          <button
            onClick={() => navigate("/split")}
            className="text-sm bg-slate-900 text-white px-4 py-1.5 rounded-full"
          >
            Back
          </button>
        </div>

        {/* Add Person */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newPerson}
            onChange={(e) => setNewPerson(e.target.value)}
            placeholder="Add person"
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
          />
          <button
  type="button"
  onClick={handleAddPerson}
  className="bg-blue-600 text-white px-4 rounded-lg text-sm"
>
  Add
</button>
        </div>

        {/* People chips */}
        <div className="flex gap-2 flex-wrap">
          {people.map((p) => (
            <span
              key={p}
              className="text-xs bg-slate-100 px-3 py-1 rounded-full"
            >
              {p}
            </span>
          ))}
        </div>

        {/* Items */}
        <div className="space-y-3">
          {allItems.length ? (
            allItems.map((item, index) => (
              <div
                key={index}
                className="border rounded-xl px-3 py-2 bg-slate-50 space-y-2"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-sm">{item.name}</div>
                    <div className="text-xs text-slate-500">
                      {item.quantity && `Qty: ${item.quantity} `}
                      {item.price && `· $${item.price}`}
                    </div>
                  </div>
                </div>

                {/* Per-item people checkboxes */}
                <div className="flex flex-wrap gap-2 text-xs">
                  {people.map((p) => {
                    const checked = (assignments[index] || []).includes(p);
                    return (
                      <label
                        key={p}
                        className="flex items-center gap-1 border border-slate-300 bg-white px-2 py-1 rounded-full cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleAssign(index, p)}
                          className="h-3 w-3"
                        />
                        <span>{p}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400">No items detected.</p>
          )}
        </div>

        {/* Total Split */}
        <div className="border-t border-slate-200 pt-4 mt-4 space-y-3">
          <h2 className="font-semibold text-slate-900">Total Split</h2>
          <div className="space-y-2">
            {people.map((person) => (
              <div
                key={person}
                className="flex justify-between items-center py-2 px-3 rounded-lg bg-slate-50"
              >
                <span className="text-sm font-medium text-slate-800">{person}</span>
                <span className="text-sm font-semibold text-blue-600">
                  ${(personTotals[person] ?? 0).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-200 font-semibold">
            <span>Total</span>
            <span>
              $
              {people
                .reduce((sum, p) => sum + (personTotals[p] || 0), 0)
                .toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default People;
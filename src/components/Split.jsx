import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      resolve(base64 || reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function transformToItems(rawItems) {
  if (!Array.isArray(rawItems)) return { foodItems: [], drinkItems: [] };
  const drinkKeywords = ["beer", "wine", "cola", "soda", "juice", "water", "coffee", "tea"];
  const foodItems = [];
  const drinkItems = [];

  for (const item of rawItems) {
    const name = item.item_name || item.name || item.itemName || "";
    const price = parseFloat(item.item_price ?? item.price ?? item.itemPrice ?? 0) || 0;
    const quantity = parseInt(item.quantity ?? 1, 10) || 1;
    const normalized = { name, price, quantity };
    const lower = name.toLowerCase();
    const isDrink = drinkKeywords.some((kw) => lower.includes(kw));
    if (isDrink) drinkItems.push(normalized);
    else foodItems.push(normalized);
  }

  return { foodItems, drinkItems };
}

const Split = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError("");
  };

  const handleSplit = async () => {
    if (!file) {
      setError("Please upload a bill image first.");
      return;
    }
    setError("");
    setIsLoading(true);
  
    try {
      const base64 = await fileToBase64(file);
      const mimeType = file.type || "image/jpeg";
  
      const { data } = await axios.post("http://localhost:3000/ExtractData", {
        imageBase64: base64,
        mimeType,
      });
  
      const items = transformToItems(data);
      navigate("/people", { state: { items } });
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || "Failed to extract items. Try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 px-4 py-10 relative">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-sm shadow-sm z-10">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 py-4">
          <div className="text-sm sm:text-base text-slate-600">
            <span className="font-semibold text-slate-900">Hello,</span> User
          </div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            SnapWise
          </div>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-full bg-red-500 px-5 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-red-600 hover:shadow-md active:scale-95"
          >
            Logout
          </button>
        </nav>
      </header>

      <div className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-lg px-6 py-8 space-y-6 pt-24">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 text-center">
          Smart Bill Splitter
        </h1>
        <p className="text-sm sm:text-base text-slate-500 text-center">
          Upload your restaurant bill and we&apos;ll extract food and drink items.
        </p>

        {/* Upload area */}
        <div className="flex flex-col items-center gap-4">
          <input
            id="bill-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <label
            htmlFor="bill-upload"
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-2 text-sm font-semibold text-white shadow-sm cursor-pointer hover:bg-slate-800"
          >
            {file ? "Change image" : "Upload bill image"}
          </label>

          {file && (
            <p className="text-xs text-slate-500">
              Selected: <span className="font-medium">{file.name}</span>
            </p>
          )}

          <button
            type="button"
            onClick={handleSplit}
            disabled={!file || isLoading}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-60 disabled:cursor-not-allowed hover:bg-blue-700"
          >
            {isLoading ? "Extracting..." : "Split"}
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}
      </div>
    </div>
  );
};

export default Split;
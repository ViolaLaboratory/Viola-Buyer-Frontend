import { useNavigate } from "react-router-dom";

const LABELS = [
  "Universal Music Group",
  "Sony Music Entertainment",
  "Warner Music Group",
  "BMG Rights Management",
  "HYBE Labels",
  "JYP Entertainment",
  "SM Entertainment",
  "YG Entertainment",
  "88rising",
  "Sub Pop",
  "XL Recordings",
  "Republic Records",
];

export const RecordLabelsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen overflow-y-auto px-6 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-3xl font-dm font-bold text-white">Record Labels</h1>
        <button
          onClick={() => navigate("/demo/marketplace")}
          className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
        >
          Back to Marketplace
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {LABELS.map((name) => (
          <div
            key={name}
            className="rounded-xl border border-white/15 bg-[linear-gradient(120deg,rgba(102,64,168,0.25),rgba(255,255,255,0.05))] px-4 py-3 text-white"
          >
            {name}
          </div>
        ))}
      </div>
    </div>
  );
};

import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();
  return (
    <main>
      <h1 className="text-9xl tracking-widest">EQUIT</h1>

      <p>Manage your equity on</p>
      <h2 className="font-bold">BLOCKCHAIN</h2>
      <button
        onClick={() => {
          navigate("/create");
        }}
        className="px-4 py-2  my-4 border-emerald-400 border-2 rounded-lg  hover:bg-emerald-100 transition ease-in font-bold duration-100"
      >
        GET STARTED
      </button>
    </main>
  );
}

export default LandingPage;

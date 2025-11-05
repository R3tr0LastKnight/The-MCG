import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import Layout from "./Layout";
// import { useAuth } from "./context/AuthContext";

const IndexPage = lazy(() => import("./pages/IndexPage"));

function App() {
  // const { isAdmin } = useAuth();
  return (
    <div className="overflow-x-hidden select-none font-libertinus">
      <Suspense
        fallback={
          <>
            <div className="w-screen flex justify-center items-center h-screen">
              {/* <img src={load} alt="" /> */}
            </div>
          </>
        }
      >
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<IndexPage />} />
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
